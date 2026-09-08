package com.sb.erp.appr.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.dto.request.ApprLineDelegationRequest;
import com.sb.erp.appr.dto.request.ApprLineRequestSearchCondition;
import com.sb.erp.appr.dto.response.ApprLineDelegationResponse;
import com.sb.erp.appr.entity.ApprLine;
import com.sb.erp.appr.entity.ApprLineRequest;
import com.sb.erp.appr.entity.ApprLog;
import com.sb.erp.appr.repository.ApprLineRepository;
import com.sb.erp.appr.repository.ApprLineRequestRepository;
import com.sb.erp.appr.repository.ApprLogRepository;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.global.exception.ResourceNotFoundException;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprLineDelegationServiceImpl implements ApprLineDelegationService{

	private final ApprLineRequestRepository reqDao;
	private final ApprLineRepository lineDao;
	private final ApprLogRepository logDao;
	private final EntityManager em;
	
	// 위임/대결 요청 생성
	@Override
	@Transactional
	public Long createRequest(ApprLineDelegationRequest req, Long reqEmpId) {
		
		ApprLine line = lineDao.findById(req.getLinId())
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 결재선입니다."));
		
		boolean isLineOwner = line.getEmployee().getEmpId().equals(reqEmpId);
		boolean isDrafter = line.getApprDoc().getEmployee().getEmpId().equals(reqEmpId);
		
		// 본인이 기안한 문서/결재 당사자 만 위임요청 가능
		if (!isLineOwner && !isDrafter) {
			throw new IllegalArgumentException("본인이 기안한 문서에 대해서만 위임 요청할 수 있습니다.");
		}
		
		if (!"WAI".equals(line.getLinStatus())) {
			throw new IllegalArgumentException("대기중인 결재선만 위임 요청할 수 있습니다.");
		}
		
		// 본인을 요청시 차단
		if (line.getEmployee().getEmpId().equals(req.getNewEmpId())) {
			throw new IllegalArgumentException("본인을 대결자로 지정할 수 없습니다.");
		}
		
		boolean alreadyInLine = lineDao.findByApprDoc_DocIdAndEmployee_EmpId (
				line.getApprDoc().getDocId(), req.getNewEmpId()
		).isPresent();
		
		if(alreadyInLine) {
			throw new IllegalArgumentException("이미 같은 문서의 결재선에 포함된 사람은 대결자로 지정할수 없습니다.");
		}
		
		// 이미 이 결재선에 처리 대기중인 요청이 있으면 생성 차단
		if (reqDao.existsByApprLine_LinIdAndReqStatus(req.getLinId(), "REQ")) {
			throw new IllegalStateException("이미 처리 대기중인 위임/대결 요청이 있습니다.");
		}
		
		Employee newEmp = em.getReference(Employee.class, req.getNewEmpId());
		Employee reqEmp = em.getReference(Employee.class, reqEmpId);
		
		ApprLineRequest entity = ApprLineRequest.builder()
				.apprDoc(line.getApprDoc())
				.apprLine(line)
				.oriEmp(line.getEmployee())
				.newEmp(newEmp)
				.reqEmp(reqEmp)
				.reqReason(req.getReqReason())
				.build();
		
		reqDao.save(entity);
		return entity.getReqId();
	}

	// 본인이 신청한 위임 요청 목록
	@Override
	public List<ApprLineDelegationResponse> myRequests(Long empId) {
		return reqDao.findByReqEmp_EmpIdOrderByCreatedAtDesc(empId).stream()
				.map(ApprLineDelegationResponse::new)
				.collect(Collectors.toList());
	}

	// 관리자용 - 승인 대기중인 요청
	@Override
	public List<ApprLineDelegationResponse> pendingRequests(Long comId) {
		return reqDao.findByReqStatusAndApprDoc_Company_ComIdOrderByCreatedAtDesc("REQ", comId).stream()
				.map(ApprLineDelegationResponse::new)
				.collect(Collectors.toList());
	}

	// 승인 처리 - 결재선 emp_id 교체 + 감사로그 기록
	@Override
	@Transactional
	public void approve(Long reqId, Long adminEmpId, Long comId) {
		
		ApprLineRequest reqEntity = reqDao.findById(reqId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 요청입니다."));
		
		if (!reqEntity.getApprDoc().getCompany().getComId().equals(comId)) {
			throw new IllegalStateException("본인 소속 회사의 요청만 처리할 수 있습니다.");
		}
		
		if (!"REQ".equals(reqEntity.getReqStatus())) {
			throw new IllegalStateException("이미 처리된 요청입니다.");
		}
		
		Employee admin = em.getReference(Employee.class, adminEmpId);
		ApprLine line = reqEntity.getApprLine();
		Employee oriEmp = line.getEmployee();
		
		// 1. 결재선 emp_id 교체 / 더티체킹
		line.setEmployee(reqEntity.getNewEmp());
		
		// 2. 요청 상태 갱신
		reqEntity.setProEmp(admin);
		reqEntity.setReqStatus("APP");
		reqEntity.setProcessedAt(LocalDateTime.now());
		
		// 3. 감사 로그 기록
		ApprLog log = ApprLog.builder()
				.apprDoc(reqEntity.getApprDoc())
				.oriEmp(oriEmp)
				.actEmp(reqEntity.getNewEmp())
				.perEmp(admin)
				.build();
		logDao.save(log);

	}

	// 반려처리
	@Override
	@Transactional
	public void reject(Long reqId, Long adminEmpId, Long comId) {
		
		ApprLineRequest reqEntity = reqDao.findById(reqId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 요청입니다."));
		
		if (!reqEntity.getApprDoc().getCompany().getComId().equals(comId)) {
			throw new IllegalStateException("본인 소속 회사의 요청만 처리할 수 있습니다.");
		}
		
		if (!"REQ".equals(reqEntity.getReqStatus())) {
			throw new IllegalStateException("이미 처리된 요청입니다.");
		}
		
		Employee admin = em.getReference(Employee.class, adminEmpId);
		reqEntity.setProEmp(admin);
		reqEntity.setReqStatus("REJ");
		reqEntity.setProcessedAt(LocalDateTime.now());
	}

	@Override
	public Page<ApprLineDelegationResponse> searchHistory(ApprLineRequestSearchCondition cond, Pageable pageable, Long comId) {
		
		LocalDateTime start = cond.getStartDate() != null ? cond.getStartDate().atStartOfDay() : null;
		LocalDateTime end = cond.getEndDate() != null ? cond.getEndDate().plusDays(1).atStartOfDay() : null;
		
		return reqDao.search(comId, cond.getReqStatus(), cond.getReqEmpId(), start, end, pageable)
				.map(ApprLineDelegationResponse::new);
	}

}
