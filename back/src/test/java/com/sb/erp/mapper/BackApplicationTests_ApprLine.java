package com.sb.erp.mapper;
 
import static org.assertj.core.api.Assertions.assertThat;
 
import java.util.List;
 
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
 
import com.sb.erp.appr.dto.request.ApprDocRequest;
import com.sb.erp.appr.dto.request.ApprFormRequest;
import com.sb.erp.appr.dto.response.ApprLineResponse;
import com.sb.erp.appr.repository.ApprDocMapper;
import com.sb.erp.appr.repository.ApprFormMapper;
import com.sb.erp.appr.repository.ApprLineMapper;
import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.repository.CompanyMapper;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.repository.EmpMapper;
 
@SpringBootTest
@Transactional
class BackApplicationTests_ApprLine {
 
	@Autowired ApprLineMapper lineMapper;
	@Autowired ApprDocMapper docMapper;
	@Autowired ApprFormMapper formMapper;
	@Autowired CompanyMapper companyMapper;
	@Autowired EmpMapper empMapper;
 
	private Long docId;
	private Long approver1Id;
	private Long approver2Id;
 
	@BeforeEach
	void setUp() {
		ComRequest com = ComRequest.builder()
				.industryGrpCode("A")
				.industryCode("123")
				.comName("회사이름")
				.comCeo("대표이름")
				.bizNo("333-33-33333")
				.build();
		companyMapper.insert(com);
		Long comId = com.getComId();
 
		// 기안자
		EmpRequest drafter = EmpRequest.builder()
				.empNo("222-222")
				.empPass("test")
				.empName("테스으트")
				.deptId(1L)
				.posId(1L)
				.comId(comId)
				.empEmail("2@2")
				.empMobile("010-2222-2222")
				.empStatus("재직")
				.hireDate("2022-01-01")
				.build();
		empMapper.insert(drafter);
		Long drafterId = drafter.getEmpId();
 
		// 결재자1 (1번 순서)
		EmpRequest approver1 = EmpRequest.builder()
				.empNo("EMP-LINE-002")
				.empPass("test")
				.empName("결재자1")
				.deptId(1L)
				.posId(1L)
				.comId(comId)
				.empEmail("11@11")
				.empMobile("010-3212-2222")
				.empStatus("재직")
				.hireDate("2022-01-01")
				.build();
		empMapper.insert(approver1);
		approver1Id = approver1.getEmpId();
 
		// 결재자2 (2번 순서)
		EmpRequest approver2 = EmpRequest.builder()
				.empNo("EMP-LINE-003")
				.empPass("test")
				.empName("결재자2")
				.deptId(1L)
				.posId(1L)
				.comId(comId)
				.empEmail("22@22")
				.empMobile("010-4313-2222")
				.empStatus("재직")
				.hireDate("2022-01-01")
				.build();
		empMapper.insert(approver2);
		approver2Id = approver2.getEmpId();
 
		// 문서가 참조할 양식
		ApprFormRequest form = new ApprFormRequest();
		form.setComId(comId);
		form.setForCode("양식코드");
		form.setForTitle("양식이름");
		form.setForContent("양식내용");
		form.setForStatus(true);
		formMapper.insertForm(form);
		Long forId = formMapper.selectCurrentFormSeq();
 
		// 결재선을 붙일 문서
		ApprDocRequest docReq = new ApprDocRequest();
		docReq.setForId(forId);
		docReq.setForVersion(1L);
		docReq.setDocTitle("결재선 테스트 문서");
		docReq.setDocContent("내용");
		docMapper.insertDoc(docReq, drafterId, comId);
		docId = docMapper.selectCurrentDocSeq();
 
		// 결재선 2단계 등록 (1번: approver1, 2번: approver2), 둘 다 초기상태 WAI로 시작
		lineMapper.insertLine(docId, approver1Id, 1, "WAI");
		lineMapper.insertLine(docId, approver2Id, 2, "WAI");
	}
 
	@Test
	@DisplayName("문서ID로 결재선 목록 조회")
	void testSelectLinesByDocId() {
		List<ApprLineResponse> lines = lineMapper.selectLinesByDocId(docId);
 
		// 등록한 결재선 2건이 그대로 조회되는지
		assertThat(lines).hasSize(2);
		// 정렬이 순서대로 1, 2로 나오는지
		assertThat(lines.get(0).getLinOrder()).isEqualTo(1);
		assertThat(lines.get(1).getLinOrder()).isEqualTo(2);
	}
 
	@Test
	@DisplayName("특정 순서의 결재선 조회")
	void testSelectLineByOrder() {
		ApprLineResponse line = lineMapper.selectLineByOrder(docId, 1);
 
		// 1번 순서로 조회했을때 결과가 존재하는지
		assertThat(line).isNotNull();
		// 1번 순서에 지정한 사람이 approver1이 맞는지
		assertThat(line.getEmpId()).isEqualTo(approver1Id);
	}
 
	@Test
	@DisplayName("결재 승인 처리 - 상태 갱신")
	void testUpdateLineStatus_approve() {
		int result = lineMapper.updateLineStatus(docId, approver1Id, "APP");
		// 정상적으로 1개 라인이 갱신됐는지
		assertThat(result).isEqualTo(1);
 
		ApprLineResponse line = lineMapper.selectLineByOrder(docId, 1);
		// 조회했을때 상태값이 APP으로 바뀌어 있는지
		assertThat(line.getLinStatus()).isEqualTo("APP");
	}
 
	@Test
	@DisplayName("결재 반려 처리 - 상태 갱신")
	void testUpdateLineStatus_reject() {
		int result = lineMapper.updateLineStatus(docId, approver2Id, "REJ");
		// 정상적으로 1개 라인이 갱신됐는지
		assertThat(result).isEqualTo(1);
 
		ApprLineResponse line = lineMapper.selectLineByOrder(docId, 2);
		// 조회했을때 상태값이 REJ로 바뀌어 있는지
		assertThat(line.getLinStatus()).isEqualTo("REJ");
	}
}
 
