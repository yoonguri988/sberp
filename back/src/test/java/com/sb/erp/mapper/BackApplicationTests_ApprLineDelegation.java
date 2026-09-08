package com.sb.erp.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.dto.request.ApprDocRequest;
import com.sb.erp.appr.dto.request.ApprFormRequest;
import com.sb.erp.appr.dto.request.ApprLineDelegationRequest;
import com.sb.erp.appr.dto.response.ApprLineDelegationResponse;
import com.sb.erp.appr.entity.ApprLine;
import com.sb.erp.appr.entity.ApprLineRequest;
import com.sb.erp.appr.entity.ApprLog;
import com.sb.erp.appr.repository.ApprDocMapper;
import com.sb.erp.appr.repository.ApprFormMapper;
import com.sb.erp.appr.repository.ApprLineMapper;
import com.sb.erp.appr.repository.ApprLineRepository;
import com.sb.erp.appr.repository.ApprLineRequestRepository;
import com.sb.erp.appr.repository.ApprLogRepository;
import com.sb.erp.appr.service.ApprLineDelegationService;
import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.repository.CompanyMapper;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.repository.EmpMapper;

@SpringBootTest
@Transactional
public class BackApplicationTests_ApprLineDelegation {
	
	@Autowired ApprLineDelegationService delService;
	@Autowired ApprLineRequestRepository reqDao;
	@Autowired ApprLineRepository lineDao;
	@Autowired ApprLogRepository logDao;
	
	@Autowired ApprLineMapper lineMapper;
	@Autowired ApprDocMapper docMapper;
	@Autowired ApprFormMapper formMapper;
	@Autowired CompanyMapper comMapper;
	@Autowired EmpMapper empMapper;
	
	private Long docId;
	private Long linId;
	private Long oriEmpId;	// 원래 결재자
	private Long newEmpId;	// 대결자
	private Long adminId;	// 관리자
	
	@BeforeEach
	void setUp() {
		ComRequest com = ComRequest.builder()
				.industryGrpCode("아")
				.industryCode("아악")
				.comName("ㅠ")
				.comCeo("ㅠㅠ")
				.bizNo("444-44-44444")
				.build();
		
		comMapper.insert(com);
		Long comId = com.getComId();
		
		EmpRequest drafter = EmpRequest.builder()
				.empNo("TEST-001")
				.empPass("test")
				.empName("기안할거임")
				.deptId(1L)
				.posId(1L)
				.comId(comId)
				.empEmail("1@1")
				.empMobile("000-1111-1111")
				.empStatus("재직")
				.hireDate("2022-11-11")
				.build();
		empMapper.insert(drafter);
		Long drafterId = drafter.getEmpId();
		
		EmpRequest ori = EmpRequest.builder()
				.empNo("TEST-002")
				.empPass("test")
				.empName("결재할거임")
				.deptId(1L)
				.posId(1L)
				.comId(comId)
				.empEmail("2@2")
				.empMobile("010-1111-2222")
				.empStatus("재직")
				.hireDate("2022-01-01")
				.build();
		empMapper.insert(ori);
		oriEmpId = ori.getEmpId();

		EmpRequest delegate = EmpRequest.builder()
				.empNo("TEST-003")
				.empPass("test")
				.empName("대결할거임")
				.deptId(1L)
				.posId(1L)
				.comId(comId)
				.empEmail("3@3")
				.empMobile("010-1111-3333")
				.empStatus("재직")
				.hireDate("2022-01-01")
				.build();
		empMapper.insert(delegate);
		newEmpId = delegate.getEmpId();

		EmpRequest admin = EmpRequest.builder()
				.empNo("TEST-004")
				.empPass("test")
				.empName("관리할거임")
				.deptId(1L)
				.posId(1L)
				.comId(comId)
				.empEmail("4@4")
				.empMobile("010-1111-4444")
				.empStatus("재직")
				.hireDate("2022-01-01")
				.build();
		empMapper.insert(admin);
		adminId = admin.getEmpId();

		ApprFormRequest form = new ApprFormRequest();
		form.setComId(comId);
		form.setForCode("form");
		form.setForTitle("얘는");
		form.setForContent("테스트할게너무많은데");
		form.setForStatus(true);
		formMapper.insertForm(form);
		Long forId = formMapper.selectCurrentFormSeq();

		ApprDocRequest docReq = new ApprDocRequest();
		docReq.setForId(forId);
		docReq.setForVersion(1L);
		docReq.setDocTitle("준비물도");
		docReq.setDocContent("너무많아");
		docMapper.insertDoc(docReq, drafterId, comId);
		docId = docMapper.selectCurrentDocSeq();

		// 결재선 1번 순서 - 대기중(WAI) 상태로 oriEmpId 배정
		lineMapper.insertLine(docId, oriEmpId, 1, "WAI");
		linId = lineMapper.selectLineByOrder(docId, 1).getLinId();
	}
	
	@Test
	@DisplayName("위임 요청 생성 - 성공")
	void testCreateRequest_success() {
		ApprLineDelegationRequest req = new ApprLineDelegationRequest();
		req.setLinId(linId);
		req.setNewEmpId(newEmpId);
		req.setReqReason("휴가 위임");
		
		Long reqId = delService.createRequest(req, oriEmpId);
		
		assertThat(reqId).isNotNull();
		
		ApprLineRequest saved = reqDao.findById(reqId).orElseThrow();
		assertThat(saved.getReqStatus()).isEqualTo("REQ");
		assertThat(saved.getOriEmp().getEmpId()).isEqualTo(oriEmpId);
		assertThat(saved.getReqEmp().getEmpId()).isEqualTo(oriEmpId);
		assertThat(saved.getNewEmp().getEmpId()).isEqualTo(newEmpId);
	}
	
	@Test
	@DisplayName("위임 요청 생성 - 본인 라인이 아니면 예외")
	void testCreateRequest_notOwner_throws() {
		ApprLineDelegationRequest req = new ApprLineDelegationRequest();
		req.setLinId(linId);
		req.setNewEmpId(newEmpId);
		
		assertThrows(IllegalArgumentException.class,
				() -> delService.createRequest(req, newEmpId));
	}
	
	@Test
	@DisplayName("위임 요청 생성 - 대기상태가 아니면 예외")
	void testCreateRequest_lineNotWaiting_throws() {
		lineMapper.updateLineStatus(docId, oriEmpId, "APP");
		
		ApprLineDelegationRequest req = new ApprLineDelegationRequest();
		req.setLinId(linId);
		req.setNewEmpId(newEmpId);
		
		assertThrows(IllegalArgumentException.class,
				() -> delService.createRequest(req, oriEmpId));
	}
	
//	@Test
//	@DisplayName("위임 요청 승인 - 결재선 emp_id 교체 + 감사로그 기록")
//	void testApprove_success() {
//		ApprLineDelegationRequest req = new ApprLineDelegationRequest();
//		req.setLinId(linId);
//		req.setNewEmpId(newEmpId);
//		Long reqId = delService.createRequest(req, oriEmpId);
//
//		delService.approve(reqId, adminId);
//
//		ApprLineRequest updated = reqDao.findById(reqId).orElseThrow();
//		assertThat(updated.getReqStatus()).isEqualTo("APP");
//		assertThat(updated.getProEmp().getEmpId()).isEqualTo(adminId);
//		assertThat(updated.getProcessedAt()).isNotNull();
//
//		ApprLine line = lineDao.findById(linId).orElseThrow();
//		assertThat(line.getEmployee().getEmpId()).isEqualTo(newEmpId);
//
//		List<ApprLog> logs = logDao.findByApprDoc_DocIdOrderByCreatedAtDesc(docId);
//		assertThat(logs).hasSize(1);
//		assertThat(logs.get(0).getOriEmp().getEmpId()).isEqualTo(oriEmpId);
//		assertThat(logs.get(0).getActEmp().getEmpId()).isEqualTo(newEmpId);
//		assertThat(logs.get(0).getPerEmp().getEmpId()).isEqualTo(adminId);
//	}
//
//	@Test
//	@DisplayName("위임 요청 승인 - 이미 처리된 요청이면 예외")
//	void testApprove_alreadyProcessed_throws() {
//		ApprLineDelegationRequest req = new ApprLineDelegationRequest();
//		req.setLinId(linId);
//		req.setNewEmpId(newEmpId);
//		Long reqId = delService.createRequest(req, oriEmpId);
//		delService.approve(reqId, adminId);
//
//		assertThrows(IllegalStateException.class,
//				() -> delService.approve(reqId, adminId));
//	}
//
//	@Test
//	@DisplayName("위임 요청 반려 - 결재선은 그대로 유지")
//	void testReject_success() {
//		ApprLineDelegationRequest req = new ApprLineDelegationRequest();
//		req.setLinId(linId);
//		req.setNewEmpId(newEmpId);
//		Long reqId = delService.createRequest(req, oriEmpId);
//
//		delService.reject(reqId, adminId);
//
//		ApprLineRequest updated = reqDao.findById(reqId).orElseThrow();
//		assertThat(updated.getReqStatus()).isEqualTo("REJ");
//		assertThat(updated.getProEmp().getEmpId()).isEqualTo(adminId);
//
//		// 반려됐으므로 결재선 emp_id는 원래 결재자 그대로여야 함
//		ApprLine line = lineDao.findById(linId).orElseThrow();
//		assertThat(line.getEmployee().getEmpId()).isEqualTo(oriEmpId);
//	}

	@Test
	@DisplayName("본인이 신청한 위임 요청 목록 조회")
	void testMyRequests() {
		ApprLineDelegationRequest req = new ApprLineDelegationRequest();
		req.setLinId(linId);
		req.setNewEmpId(newEmpId);
		delService.createRequest(req, oriEmpId);

		List<ApprLineDelegationResponse> myList = delService.myRequests(oriEmpId);

		assertThat(myList).extracting(ApprLineDelegationResponse::getOriEmpId).contains(oriEmpId);
	}

//	@Test
//	@DisplayName("관리자용 승인 대기 목록 조회")
//	void testPendingRequests() {
//		ApprLineDelegationRequest req = new ApprLineDelegationRequest();
//		req.setLinId(linId);
//		req.setNewEmpId(newEmpId);
//		Long reqId = delService.createRequest(req, oriEmpId);
//
//		List<ApprLineDelegationResponse> pending = delService.pendingRequests();
//
//		assertThat(pending).extracting(ApprLineDelegationResponse::getReqId).contains(reqId);
//	}
}
