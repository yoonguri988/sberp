package com.sb.erp.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.dto.request.CompanySearchRequest;
import com.sb.erp.com.dto.response.ComResponse;
import com.sb.erp.com.dto.response.StatsComResponse;
import com.sb.erp.com.repository.CompanyMapper;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.repository.EmpMapper;

@SpringBootTest
@Transactional
class BackApplicationTests_Company {

	@Autowired CompanyMapper mapper;
	@Autowired EmpMapper empMapper;
	
	// 여러 테스트에서 공통으로 재사용할 등록된 회사의 PK
	private long savedComId1;
	private long savedComId2;
	
	@BeforeEach
	void setUp() {
		// 매 테스트 실행 전, 조회/수정/삭제 테스트에서 사용할 기준 데이터를 하나 등록해둔다.
		ComRequest dto1 = ComRequest.builder()
				.industryGrpCode("G")
				.industryCode("12345")
				.comName("test")
				.comCeo("도훈")
				.bizNo("152-45-12345")
				.build();
		ComRequest dto2 = ComRequest.builder()
				.industryGrpCode("J")
				.industryCode("54321")
				.comName("kkk")
				.comCeo("신유")
				.bizNo("588-98-12345")
				.build();
 
		int res1 = mapper.insert(dto1);
		assertThat(res1).isEqualTo(1);
		int res2 = mapper.insert(dto2);
		assertThat(res2).isEqualTo(1);
 
		savedComId1 = dto1.getComId();
		assertThat(savedComId1).isNotNull();
		savedComId2 = dto2.getComId();
		assertThat(savedComId2).isNotNull();
	}
	
	@Test
	@DisplayName("회사 목록 조회 (검색/페이징)")
	void testSelectAll() {
		CompanySearchRequest req = CompanySearchRequest.builder()
				.industryGrpCode("G")
				.keyword("t")
				.pstartno(0)
				.onepagelist(10)
				.build();
		
		List<ComResponse> list = mapper.selectAll(req);
 
		assertThat(list.get(0).getComName()).isEqualTo("test");
	}
	
	@Test
	@DisplayName("회사 목록 총 건수 조회")
	void testListTotal() {
		CompanySearchRequest req = CompanySearchRequest.builder()
				.keyword("123")
				.build();
 
		int total = mapper.listTotal(req);
 
		assertThat(total).isGreaterThanOrEqualTo(2);
	}
	
	@Test
	@DisplayName("회사명/사업자번호 자동완성 검색")
	void testSelectSuggest() {
		List<ComResponse> list = mapper.selectSuggest("t");
 
		assertThat(list.size()).isEqualTo(1);
	}
	
	@Test
	@DisplayName("회사 등록")
	void testInsert() {
		ComRequest dto = ComRequest.builder()
				.industryGrpCode("S")
				.industryCode("54321")
				.comName("insert-test")
				.comCeo("홍길동")
				.bizNo("999-99-99999")
				.build();
 
		int res = mapper.insert(dto);
 
		assertThat(res).isEqualTo(1);
		assertThat(dto.getComId()).isNotNull(); 
	}
	
	@Test
	@DisplayName("사업자번호로 단건 조회")
	void testSelectByBizNo() {
		ComResponse response = mapper.selectByBizNo("152-45-12345");
 
		assertThat(response).isNotNull();
		assertThat(response.getComName()).isEqualTo("test");
		assertThat(response.getComCeo()).isEqualTo("도훈");
	}
	
	@Test
	@DisplayName("com_id로 단건 조회")
	void testSelectOneById() {
		ComResponse response = mapper.selectOneById(savedComId1);
 
		assertThat(response).isNotNull();
		assertThat(response.getComId()).isEqualTo(savedComId1);
		assertThat(response.getComName()).isEqualTo("test");
	}
	
	@Test
	@DisplayName("회사 정보 수정")
	void testUpdate() {
		ComRequest updateDto = ComRequest.builder()
				.comId(savedComId1)
				.comName("updated-name")
				.comCeo("김수정")
				.build();
 
		int res = mapper.update(updateDto);
		assertThat(res).isEqualTo(1);
 
		ComResponse response = mapper.selectOneById(savedComId1);
		assertThat(response.getComName()).isEqualTo("updated-name");
		assertThat(response.getComCeo()).isEqualTo("김수정");
		// <if> 로 넘기지 않은 필드는 기존 값 유지 확인
		assertThat(response.getBizNo()).isEqualTo("152-45-12345");
	}
	
	@Test
	@DisplayName("회사 삭제")
	void testDelete() {
		int res = mapper.delete(savedComId1);
		assertThat(res).isEqualTo(1);
 
		ComResponse response = mapper.selectOneById(savedComId1);
		assertThat(response).isNull();
	}
	
	@Test
	@DisplayName("회사 통계 조회")
	void testSelectStats() {
		StatsComResponse stats = mapper.selectStats();
 
		assertThat(stats).isNotNull();
		assertThat(stats.getComTotal()).isGreaterThanOrEqualTo(1);
	}
	
	@Test
	@DisplayName("사원 id로 소속 회사 조회")
	void testSelectOneByEmpId() {
	    // savedComId1 소속 사원을 하나 등록
	    EmpRequest empDto = EmpRequest.builder()
	            .empNo("EMP-TEST-001")
	            .empPass("test1234")
	            .empName("테스트사원")
	            .deptId(1L)   // TODO: 실제 존재하는 department.dept_id 값으로 교체
	            .posId(1L)    // TODO: 실제 존재하는 emp_position.pos_id 값으로 교체
	            .comId(savedComId1)
	            .empEmail("test-emp-" + System.currentTimeMillis() + "@test.com")
	            .empMobile("010-0000-0000")
	            .empStatus("재직")   // TODO: 실제 코드 값(예: '재직' 등) 확인 필요
	            .hireDate("2026-08-07")
	            .build();

	    int res = empMapper.insert(empDto);
	    assertThat(res).isEqualTo(1);
	    long empId = empDto.getEmpId();

	    // 방금 등록한 사원의 empId로 소속 회사 조회
	    ComResponse response = mapper.selectOneByEmpId(empId);

	    assertThat(response).isNotNull();
	    assertThat(response.getComId()).isEqualTo(savedComId1);
	}
}
