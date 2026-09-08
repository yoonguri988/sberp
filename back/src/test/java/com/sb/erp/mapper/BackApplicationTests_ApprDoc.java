package com.sb.erp.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.dto.request.ApprDocRequest;
import com.sb.erp.appr.dto.request.ApprFormRequest;
import com.sb.erp.appr.dto.response.ApprDocInitResponse;
import com.sb.erp.appr.dto.response.ApprDocResponse;
import com.sb.erp.appr.dto.response.ApprFormResponse;
import com.sb.erp.appr.repository.ApprDocMapper;
import com.sb.erp.appr.repository.ApprFormMapper;
import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.repository.CompanyMapper;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.repository.EmpMapper;

@SpringBootTest
@Transactional
class BackApplicationTests_ApprDoc {

	@Autowired ApprDocMapper docMapper;
	@Autowired ApprFormMapper formMapper;
	@Autowired CompanyMapper companyMapper;
	@Autowired EmpMapper empMapper;
	
	private Long comId;
	private Long empId;
	private Long forId;
	
	@BeforeEach
	void setUp() {
		// 회사
		ComRequest com = ComRequest.builder()
				.industryGrpCode("A")
				.industryCode("123")
				.comName("어떻게")
				.comCeo("테스트가더어려워")
				.bizNo("222-22-22222")
				.build();
		companyMapper.insert(com);
		comId = com.getComId();
		
		// 사원
		EmpRequest emp = EmpRequest.builder()
				.empNo("001-111")
				.empPass("test")
				.empName("ㅠㅠ")
				.deptId(1L)
				.posId(1L)
				.comId(comId)
				.empEmail("1@1")
				.empMobile("000-1111-2222")
				.empStatus("재직")
				.hireDate("2022-01-01")
				.build();
		empMapper.insert(emp);
		empId = emp.getEmpId();
		
		// 임시 양식
		ApprFormRequest form = new ApprFormRequest();
		form.setComId(comId);
		form.setForCode("doc-test");
		form.setForTitle("양식이요");
		form.setForContent("내용이요");
		form.setForStatus(true);
		formMapper.insertForm(form);
		forId = formMapper.selectCurrentFormSeq();
	}
	
	private ApprDocRequest baseReq(String title) {
		ApprDocRequest req = new ApprDocRequest();
		req.setForId(forId);
		req.setForVersion(1L);
		req.setDocTitle(title);
		req.setDocContent("내용이요오");
		return req;
	}
	
	@Test
	@DisplayName("문서 작성 및 단건 조회")
	void testInsertAndSelectDetail() {
		ApprDocRequest req = baseReq("테스트 문서");
 
		// insertDoc은 (req, empId, comId) 순서 - doc_id는 컬럼에 안 넣으므로 트리거 채번 가정
		int result = docMapper.insertDoc(req, empId, comId);
		// 정상적으로 입력됐는지
		assertThat(result).isEqualTo(1);
 
		Long docId = docMapper.selectCurrentDocSeq();
		// 시퀀스 값 정상적으로 가져왔는지
		assertThat(docId).isNotNull();
 
		ApprDocResponse detail = docMapper.selectDocDetail(docId);
		// 조회한 데이터의 제목이 넣은 값과 일치하는지
		assertThat(detail.getDocTitle()).isEqualTo("테스트 문서");
		// 문서 작성시 문서 상태(디폴트값 ING) 잘 들어갔는지
		assertThat(detail.getDocStatus()).isEqualTo("ING");
	}
 
	@Test
	@DisplayName("문서 상태 갱신")
	void testUpdateDocStatus() {
		ApprDocRequest req = baseReq("상태변경 테스트");
		docMapper.insertDoc(req, empId, comId);
		Long docId = docMapper.selectCurrentDocSeq();
 
		int result = docMapper.updateDocStatus(docId, "APP");
		// 정상적으로 갱신됐는지
		assertThat(result).isEqualTo(1);
 
		ApprDocResponse detail = docMapper.selectDocDetail(docId);
		// 조회했을때 상태값이 바뀐 값(APP) 그대로 반영되어 있는지
		assertThat(detail.getDocStatus()).isEqualTo("APP");
	}
 
	@Test
	@DisplayName("작성 가능한 양식 목록 조회 - 활성화된 양식만")
	void testFindForm() {
		List<ApprFormResponse> forms = docMapper.findForm(comId);
 
		// setUp에서 만든 활성화(for_status=1) 양식이 목록에 포함되는지
		assertThat(forms).extracting(ApprFormResponse::getForId).contains(forId);
	}
 
	@Test
	@DisplayName("문서 작성자 초기 정보 조회")
	void testInitResponse() {
		ApprDocInitResponse init = docMapper.initResponse(empId);
 
		// empId로 조회했을때 결과 자체가 존재하는지
		assertThat(init).isNotNull();
		// 조회한 회사 id가 문서 작성자가 소속된 회사와 일치하는지
		assertThat(init.getComId()).isEqualTo(comId);
	}
 
	@Test
	@DisplayName("대시보드용 문서 통계 조회")
	void testSelectDocCnt() {
		ApprDocRequest req = baseReq("통계 테스트");
		docMapper.insertDoc(req, empId, comId);
 
		Map<String, Object> cnt = docMapper.selectDocCnt(empId);
 
		// 방금 만든 문서 1건이 총 문서수(TOTALCNT)에 반영됐는지
		assertThat(((Number) cnt.get("TOTALCNT")).intValue()).isGreaterThanOrEqualTo(1);
	}
	
}
