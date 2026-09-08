package com.sb.erp.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.dto.request.ApprFormRequest;
import com.sb.erp.appr.dto.response.ApprFormResponse;
import com.sb.erp.appr.repository.ApprFormMapper;
import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.repository.CompanyMapper;

@SpringBootTest
@Transactional
class BackApplicationTests_ApprForm {

	@Autowired ApprFormMapper formMapper;
	@Autowired CompanyMapper companyMapper;
	
	private Long comId;
	
	@BeforeEach
	void setUp() {
		// 테스트용 회사
		ComRequest com = ComRequest.builder()
				.industryGrpCode("A")
				.industryCode("123")
				.comName("테스트회사")
				.comCeo("테스트ceo")
				.bizNo("111-11-11111")
				.build();
		companyMapper.insert(com);
		comId = com.getComId();
	}
	
	// 기본 양식 요청 객체 생성
	private ApprFormRequest baseReq(String code) {
		ApprFormRequest req = new ApprFormRequest();
		req.setComId(comId);
		req.setForCode(code);
		req.setForTitle("양식");
		req.setForContent("내용");
		req.setForStatus(true);
		return req;
	}
	
	@Test
	@DisplayName("양식 등록")
	void testInsertForm() {
		ApprFormRequest req = baseReq("FORM-TEST-001");
 
		int result = formMapper.insertForm(req);
		// 정상적으로 입력됐는지
		assertThat(result).isEqualTo(1);
 
		Long newForId = formMapper.selectCurrentFormSeq();
		// 시퀀스 값 정상적으로 가져왔는지
		assertThat(newForId).isNotNull();
 
		ApprFormResponse saved = formMapper.selectFormAll(newForId, 1L);
		// 전체 조회 했을때 데이터가 존재하는지
		assertThat(saved).isNotNull();
		// 조회한 데이터의 양식 코드가 일치하는지
		assertThat(saved.getForCode()).isEqualTo("FORM-TEST-001");
		// 조회한 데이터의 양식 이름이 일치하는지
		assertThat(saved.getForTitle()).isEqualTo("양식");
	}
 
	@Test
	@DisplayName("양식 코드 중복 확인")
	void testFindByCode() {
		ApprFormRequest req = baseReq("FORM-TEST-002");
		formMapper.insertForm(req);
		Long forId = formMapper.selectCurrentFormSeq();
 
		String dup = formMapper.findByCode("FORM-TEST-002", comId, null);
		// 입력한 양식 코드가 중복을 정상적으로 잡아내는지
		assertThat(dup).isNotNull();
 
		String self = formMapper.findByCode("FORM-TEST-002", comId, forId);
		// 수정시에 이미 입력되어있는 양식 코드값은 중복 예외처리 정상적으로 되는지
		assertThat(self).isNull();
	}
 
	@Test
	@DisplayName("양식 수정 - 버전 변경 없음")
	void testUpdateForm() {
		ApprFormRequest req = baseReq("FORM-TEST-003");
		formMapper.insertForm(req);
		Long forId = formMapper.selectCurrentFormSeq();
 
		ApprFormRequest updateReq = baseReq("FORM-TEST-003");
		updateReq.setForTitle("수정된 제목");
 
		int result = formMapper.updateForm(forId, 1L, updateReq);
		// 양식을 갱신했는지
		assertThat(result).isEqualTo(1);
 
		ApprFormResponse updated = formMapper.selectFormAll(forId, 1L);
		// 같은 id, 버전을 조회했을때 바꾼 값이 정상적으로 들어가있는지
		assertThat(updated.getForTitle()).isEqualTo("수정된 제목");
	}
 
//	@Test
//	@DisplayName("양식 수정 - 버전 증가")
//	void testUpdateFormNewVersion() {
//		ApprFormRequest req = baseReq("FORM-TEST-004");
//		formMapper.insertForm(req);
//		Long forId = formMapper.selectCurrentFormSeq();
// 
//		// 서비스 로직상 content/title/schema가 실질적으로 바뀌면 새 버전으로 insert됨
//		ApprFormRequest v2Req = baseReq("FORM-TEST-004");
//		v2Req.setForContent("버전 테스트");
// 
//		int result = formMapper.updateFormNewVersion(forId, v2Req);
//		// 정상적으로 버전 증가가 됐는지 (insert)
//		assertThat(result).isEqualTo(1);
// 
//		List<ApprFormResponse> versions = formMapper.selectFormVersions(forId);
//		// 특정 문서의 버전을 조회했을때 정상적으로 2개의 버전이 남아있는지
//		assertThat(versions).hasSize(2);
//		// for_version desc 정렬이라 리스트의 첫 요소가 최신버전이 선택됐는지
//		assertThat(versions.get(0).getForVersion()).isEqualTo(2L);
//	}
 
//	@Test
//	@DisplayName("양식 삭제 (소프트 딜리트) - 목록 조회에서 빠짐")
//	void testDeleteForm() {
//		ApprFormRequest req = baseReq("FORM-TEST-005");
//		formMapper.insertForm(req);
//		Long forId = formMapper.selectCurrentFormSeq();
// 
//		// deleteForm은 실제 row 삭제가 아니라 is_deleted = 1로 갱신하는 소프트 딜리트
//		int result = formMapper.deleteForm(forId, 1L);
//		// 정상적으로 삭제 처리가 됐는지
//		assertThat(result).isEqualTo(1);
// 
//		// selectFormList는 is_deleted = 0 조건이 걸려있어서, 삭제된 양식은 목록에 안 나와야 정상
//		ApprFormSearchCondition cond = new ApprFormSearchCondition();
//		cond.setComId(comId);
//		cond.setOnepagelist(50);
//		List<ApprFormResponse> list = formMapper.selectFormList(cond);
// 
//		// selectFormList 의 조건 is_deleted = 0 의 조건이 정상적으로 작동됐는지
//		assertThat(list).extracting(ApprFormResponse::getForId).doesNotContain(forId);
//	}
}
