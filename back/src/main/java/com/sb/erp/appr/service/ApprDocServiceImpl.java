package com.sb.erp.appr.service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sb.erp.appr.dto.request.ApprDocRequest;
import com.sb.erp.appr.dto.request.ApprDocSearchCondition;
import com.sb.erp.appr.dto.request.ApprDocUpdateRequest;
import com.sb.erp.appr.dto.request.ApprLineFavoriteRequest;
import com.sb.erp.appr.dto.response.ApprDocInitResponse;
import com.sb.erp.appr.dto.response.ApprDocResponse;
import com.sb.erp.appr.dto.response.ApprDocSummaryResponse;
import com.sb.erp.appr.dto.response.ApprFormResponse;
import com.sb.erp.appr.dto.response.ApprLineResponse;
import com.sb.erp.appr.entity.ApprDoc;
import com.sb.erp.appr.entity.ApprForm;
import com.sb.erp.appr.entity.ApprFormId;
import com.sb.erp.appr.entity.LeaveRequest;
import com.sb.erp.appr.repository.ApprDocMapper;
import com.sb.erp.appr.repository.ApprFormRepository;
import com.sb.erp.appr.repository.ApprLineMapper;
import com.sb.erp.appr.repository.ApprLineRequestRepository;
import com.sb.erp.appr.repository.LeaveRequestRepository;
import com.sb.erp.att.dto.request.LeaveGrantRequest;
import com.sb.erp.att.service.LeaveBalanceService;
import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.service.DeptService;
import com.sb.erp.emp.entity.Employee;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprDocServiceImpl implements ApprDocService{

	private final ApprDocMapper dao;
	private final ApprLineMapper lineDao;
	private final DeptService deptService;
	private final ApprAutoDelegationTriggerService autoTrigger;
	private final ApprLineFavoriteService favService;
	private final ApprLineRequestRepository lineReqDao;
	
	// 연차 연동
	private final ApprFormRepository formDao;
	private final LeaveRequestRepository leaveReqDao;
	private final LeaveBalanceService leaveBalService;
	private final EntityManager em;
	private final ObjectMapper objectMapper;

	// 작성하려는 사용자의 회사 양식
	@Override
	public List<ApprFormResponse> findForm(Long comId) {
		return dao.findForm(comId);
	}
	
	// 결재 양식 작성하려는 사용자의 인적사항
	@Override
	public ApprDocInitResponse initResponse(Long empId) {
		return dao.initResponse(empId);
	}

	
	// 결재선, 문서 insert
	@Override
	@Transactional
	public Long insertDocAndLine(ApprDocRequest req, Long empId, Long comId) {
		
		// 문서 데이터 등록
		dao.insertDoc(req, empId, comId);
		
		// 문서 id
		Long docId = dao.selectCurrentDocSeq();
		
		// 결재선 순차 등록
		List<Long> approverEmpIds = req.getApproverEmpIds();
		if (approverEmpIds != null && !approverEmpIds.isEmpty()) {
			for (int i = 0; i < approverEmpIds.size(); i++) {
				int linOrder = i + 1;
				String status = (linOrder == 1) ? "WAI" : "NOT";
				lineDao.insertLine(docId, approverEmpIds.get(i), linOrder, status);
			}
		}
		
		// 연차 신청서면 기안시점에 LeaveRequest 생성
		createLeaveRequestIfNeeded(
				docId,
				req.getForId(),
				req.getForVersion(),
				empId,
				req.getDocContent()
		);
		
		return docId;
	}

	// 대시보드용 통계
	@Override
	public Map<String, Object> selectDocCnt(Long empId) {
		return dao.selectDocCnt(empId);
	}

	// 내가 결재 했던 모든 문서
	@Override
	public List<ApprDocSummaryResponse> selectMyHistoryDocs(ApprDocSearchCondition condition) {
		return dao.selectMyHistoryDocs(condition);
	}

	// 내가 결재 해야할 모든 문서
	@Override
	public List<ApprDocSummaryResponse> selectMyTodoDocs(ApprDocSearchCondition condition) {
		return dao.selectMyTodoDocs(condition);
	}

	// 상세 페이지 docId로 데이터 가져오기
	@Override
	public ApprDocResponse selectDocDetail(Long docId, Long comId) {
		ApprDocResponse detail = dao.selectDocDetail(docId);
		if (detail == null) {
			throw new IllegalArgumentException("존재하지 않는 문서입니다");
		}
		if (!detail.getComId().equals(comId)) {
			throw new IllegalArgumentException("본인 소속 회사의 문서만 조회할 수 있습니다.");
		}
		return detail;
	}

	// 기안자 상사들 목록 조회
	@Override
	public List<ApprLineResponse> approversByEmpId(Long empId) {
		return dao.approversByEmpId(empId);
	}

	// docId로 결재선 가져오기
	@Override
	public List<ApprLineResponse> selectLinesByDocId(Long docId) {
		return lineDao.selectLinesByDocId(docId);
	}

	// 결재 처리 로직 (승/반)
	@Override
	@Transactional
	public void processLine(Long docId, Long empId, String action) {
		
		// 낙관적 락 검증 리팩토링 이후 3차 진행때 추가
		
		// 결재선 상태 갱신
		int updated = lineDao.updateLineStatus(docId, empId, action);
		if (updated == 0) {
			throw new IllegalArgumentException("처리할 수 있는 결재선이 없습니다");
		}
		
		// 반려했을시 처리
		if ("REJ".equals(action)) {
			dao.updateDocStatus(docId, "REJ");
			
			// 연차 신청서면 반려 이력 남김
			leaveReqDao.findByApprDoc_DocId(docId)
				.ifPresent(lr -> lr.setReqStatus("REJ"));
			return;
		}
		
		// 승인했을시 처리
		
		// 전체 결재선 라인
		List<ApprLineResponse> lines = lineDao.selectLinesByDocId(docId);
		
		// 현재 결재자 정보
		ApprLineResponse current = lines.stream()
				.filter(l -> l.getEmpId().equals(empId))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("결재선 정보를 찾을 수 없습니다."));
		
		// 다음 결재자 정보
		ApprLineResponse next = lines.stream()
				.filter(l -> l.getLinOrder() == current.getLinOrder() + 1)
				.findFirst()
				.orElse(null);
		
		// 다음 순서 있는지 검증
		if (next != null) {
			// 있는경우
			lineDao.activeNextLine(docId, next.getEmpId());
		}
		else {
			// 없는경우
			dao.updateDocStatus(docId, "APP");
			
			// [스코프 제외] 위임전결 자동화 트리거 - ApprAutoDelegation.java 참고
			// comId 검증 없이 delegation-config를 다른 회사 양식에도 설정할 수 있는 IDOR가 있고,
			// 발동 시 실제 결재선(ApprLine)을 수정하는 코드라 리스크 차단을 위해 호출 자체를 막음.
			// autoTrigger.tryTrigger(docId, doc.getForId(), doc.getForVersion(), doc.getEmpId(), doc.getDocContent());
			ApprDocResponse doc = dao.selectDocDetail(docId);
			
			// 결재선 조합 사용횟수 반영 - 위임/대결이 한 번도 없었던 경우에만 카운트
			boolean everDelegated = lineReqDao.existsByApprDoc_DocIdAndReqStatus(docId, "APP");
			if (!everDelegated) {
				List<Long> approverEmpIds = lines.stream()
						.sorted(Comparator.comparing(ApprLineResponse::getLinOrder))
						.map(ApprLineResponse::getEmpId)
						.collect(Collectors.toList());
				
				Long deptId = dao.initResponse(doc.getEmpId()).getDeptId();
				ApprLineFavoriteRequest favReq = new ApprLineFavoriteRequest();
				favReq.setDeptId(deptId);
				favReq.setForId(doc.getForId());
				favReq.setEmpIds(approverEmpIds);
				favService.saveOrIncrement(favReq);
			}
			
			// 연차 신청서면 최종 승인시 잔여 연차 차감 + LeaveRequest 상태 갱신
			processLeaveApprovalIfNeeded(docId, doc);
		}
		
	}

	// 결재선 지정용 - 부서 내 직원 목록
	@Override
	public List<ApprLineResponse> selectDeptEmpsForLines(Long deptId, Long empId) {
		return dao.selectDeptEmpsForLines(deptId, empId);
	}

	// 결재선 지정 가능 인원수
	@Override
	public List<DeptResponse> cntApprovers(Long deptId, Long empId) {
		List<DeptResponse> chain = deptService.selectAncestorDepts(deptId);
		
		for (DeptResponse d : chain) {
			int cnt = dao.cntApprovers(d.getDeptId(), empId);
			d.setEmpCount(cnt);
		}
		return chain;
	}

	// 모든 문서 카운트
	@Override
	public int selectMyHistoryDocsCnt(ApprDocSearchCondition condition) {
		return dao.selectMyHistoryDocsCnt(condition);
	}

	// 본인차례 결재 문서 카운트
	@Override
	public int selectMyTodoDocsCnt(ApprDocSearchCondition condition) {
		return dao.selectMyTodoDocsCnt(condition);
	}
	
	//////////////// 연차
	
	// 연차 필드 파싱 내부클래스
	private static class LeaveDocFields {
		LocalDate startDate;
		LocalDate endDate;
		Double reqDays;
		String leaveType;
		String halfType;
	}
	
	// start~end 범위중 주말 제외한 날짜 목록 / 공휴일은 생각 안함
	private List<LocalDate> businessDaysBetween(LocalDate start, LocalDate end) {
		List<LocalDate> days = new ArrayList<>();
		LocalDate cur = start;
		while (!cur.isAfter(end)) {
			DayOfWeek dow = cur.getDayOfWeek();
			if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
				days.add(cur);
			}
			cur = cur.plusDays(1);
		}
		return days;
	}
	
	// docContent(JSON) -> leaveType/startDate/endDate 파싱 + 연차/반차 계산
	private LeaveDocFields parseLeaveFields (String docContent) {
		try {
			Map<String, Object> content = objectMapper.readValue(
					docContent, new TypeReference<Map<String, Object>>() {}
			);
			
			String leaveType = (String) content.get("leaveType");
			LocalDate startDate = LocalDate.parse((String) content.get("startDate"));
			LocalDate endDate = LocalDate.parse((String) content.get("endDate"));
			
			LeaveDocFields fields = new LeaveDocFields();
			fields.leaveType = leaveType;
			
			if (leaveType != null && leaveType.startsWith("HALF")) {
				// 반차는 단일일, 0.5일
				fields.startDate = startDate;
				fields.endDate = startDate;
				fields.reqDays = 0.5;
				fields.halfType = "HALF_PM".equals(leaveType) ? "PM" : "AM";
			}
			else {
				fields.startDate = startDate;
				fields.endDate = endDate;
				fields.reqDays = (double) businessDaysBetween(startDate, endDate).size();
			}
			
			return fields;
		} catch (Exception e) {
			throw new IllegalArgumentException("연차 신청서 필드를 읽을수 없습니다.");
		}
	}
	
	// 기안 시점
	private void createLeaveRequestIfNeeded(Long docId, Long forId, Long forVersion, Long empId, String docContent) {
		
		ApprForm form = formDao.findById(new ApprFormId(forId, forVersion)).orElse(null);
		// 일반 문서 제외
		if (form == null || !"LEAVE".equals(form.getForCategory())) {
			return; 
		}
		
		LeaveDocFields fields = parseLeaveFields(docContent);
		
		Employee emp = em.getReference(Employee.class, empId);
		ApprDoc apprDocRef = em.getReference(ApprDoc.class, docId);
		
		LeaveRequest leaveRequest = LeaveRequest.builder()
				.apprDoc(apprDocRef)
				.emp(emp)
				.startDate(fields.startDate)
				.endDate(fields.endDate)
				.reqDays(fields.reqDays)
				.reqStatus("PEN")
				.build();
		
		leaveReqDao.save(leaveRequest);
	}
	
	// 최종 승인
	private void processLeaveApprovalIfNeeded(Long docId, ApprDocResponse doc) {
		LeaveRequest leaveRequest = leaveReqDao.findByApprDoc_DocId(docId).orElse(null);
		// LEAVE 문서 아닐시 제외
		if (leaveRequest == null) {
			return;
		}
		
		leaveRequest.setReqStatus("APP");
		
		boolean isHalfDay = leaveRequest.getReqDays() != null && leaveRequest.getReqDays() == 0.5;
		
		if (isHalfDay) {
			LeaveDocFields fields = parseLeaveFields(doc.getDocContent());
			
			LeaveGrantRequest request = new LeaveGrantRequest();
			request.setEmpId(doc.getEmpId());
			request.setGrantDays(BigDecimal.valueOf(-0.5));
			request.setLeaveDate(leaveRequest.getStartDate());
			request.setGrantType("USE");
			request.setHalfType(fields.halfType);
			request.setReason("연차 신청서 승인 (docId="+ docId + ")");
			
			leaveBalService.deductLeave(doc.getEmpId(), request);
		}
		else {
			for (LocalDate day : businessDaysBetween(leaveRequest.getStartDate(), leaveRequest.getEndDate())) {
				LeaveGrantRequest request = new LeaveGrantRequest();
				request.setEmpId(doc.getEmpId());
				request.setGrantDays(BigDecimal.valueOf(-1.0));
				request.setLeaveDate(day);
				request.setGrantType("USE");
				request.setReason("연차 신청서 승인 (docId="+ docId + ")");
				
				leaveBalService.deductLeave(doc.getEmpId(), request);
			}
		}
	}
	
	// 문서 수정
	@Override
	@Transactional
	public void updateDoc(Long docId, ApprDocUpdateRequest req, Long empId) {
		
		ApprDocResponse doc = dao.selectDocDetail(docId);
		if (doc == null) {
			throw new IllegalArgumentException("존재하지 않는 문서입니다.");
		}
		
		// 기안자 본인만 수정 가능
		if (!doc.getEmpId().equals(empId)) {
			throw new IllegalArgumentException("본인이 기안한 문서만 수정할 수 있습니다.");
		}
		
		// 결재선중 하나라도 이미 처리됐으면 수정 불가
		List<ApprLineResponse> lines = lineDao.selectLinesByDocId(docId);
		boolean anyProcessed = lines.stream()
				.anyMatch(l -> "APP".equals(l.getLinStatus()) || "REJ".equals(l.getLinStatus()));
		if (anyProcessed) {
			throw new IllegalStateException("이미 결재가 진행된 문서는 수정할 수 없습니다.");
		}
		
		// 낙관적 락 체크
		int updated = dao.updateDoc(docId, req);
		if (updated == 0) {
			throw new IllegalArgumentException("문서가 이미 변경 또는 처리되었습니다. 새로고침후 다시 시도해주세요.");
		}
	}
}
