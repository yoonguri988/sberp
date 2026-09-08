package com.sb.erp.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.repository.CompanyMapper;
import com.sb.erp.dept.dto.request.DeptRequest;
import com.sb.erp.dept.dto.request.DeptSearchRequest;
import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.dto.response.StatsDeptResponse;
import com.sb.erp.dept.repository.DeptMapper;

@SpringBootTest
@MapperScan({"com.sb.erp.dept.repository", "com.sb.erp.com.repository"})
@Transactional
class BackApplicationTests_Department {

	@Autowired DeptMapper mapper;
	@Autowired CompanyMapper comMapper;
	
	// 여러 테스트에서 공통으로 재사용할 등록된 회사의 PK
	private long savedComId;
	
	private long savedRootDeptId;
	private long savedChildDeptId;
	
	@BeforeEach
	void setUp() {
		// 매 테스트 실행 전, 조회/수정/삭제 테스트에서 사용할 기준 회사 데이터를 등록해둔다.
		ComRequest dto1 = ComRequest.builder()
				.industryGrpCode("G")
				.industryCode("12345")
				.comName("test")
				.comCeo("도훈")
				.bizNo("152-45-12345")
				.build();

		int res1 = comMapper.insert(dto1);
		assertThat(res1).isEqualTo(1);

		savedComId = dto1.getComId();
		assertThat(savedComId).isNotNull();
		
		// 기준 부서 트리 등록: root(depth:0) -> child{depth:1)
		DeptRequest root = DeptRequest.builder()
				.comId(savedComId).parentId(0).deptName("베이스부서").deptCode("BASE0").depth(0).sortOrder(1).build();
		savedRootDeptId = insertDeptAndGetId(root);
 
		DeptRequest child = DeptRequest.builder()
				.comId(savedComId).parentId(savedRootDeptId).deptName("베이스하위부서").deptCode("BASE1").depth(1).sortOrder(1).build();
		savedChildDeptId = insertDeptAndGetId(child);
	}
	
	private long insertDeptAndGetId(DeptRequest dto) {
		int res = mapper.insert(dto);
		assertThat(res).isEqualTo(1);
		assertThat(dto.getDeptId()).isGreaterThan(0);
		return dto.getDeptId();
	}

	
	@Test
	@DisplayName("해당 회사가 가지고 있는 부서 갯수 조회")
	void testCountActiveDepts() {
		long count = mapper.countActiveDepts(savedComId);
		assertThat(count).isEqualTo(2);
	}
	
	@Test
	@DisplayName("부서 전체 조회 - 계층 구조 전개")
	void testSelectAll() {
		// 기준 트리(루트+자식) 2개에 루트 아래 형제 부서 2개를 추가
		DeptRequest child1 = DeptRequest.builder()
		                     .comId(savedComId).parentId(savedRootDeptId).deptName("1팀").deptCode("T1").depth(1).sortOrder(2).build();
		DeptRequest child2 = DeptRequest.builder()
						     .comId(savedComId).parentId(savedRootDeptId).deptName("2팀").deptCode("T2").depth(1).sortOrder(3).build();
		insertDeptAndGetId(child1);
		insertDeptAndGetId(child2);
		
		List<DeptResponse> result = mapper.selectAll(savedComId);
		assertThat(result).hasSize(4);
		assertThat(result.get(0).getDeptName()).isEqualTo("베이스부서");
	}
	
	@Test
	@DisplayName("id로 부서 단건 조회 - 상위부서/부서장 정보 포함")
	void testSelectOneById() {
		// setUp에서 만들어둔 기준 트리(루트-자식)를 그대로 활용
		DeptResponse found = mapper.selectOneById(savedChildDeptId);
 
		assertThat(found).isNotNull();
		assertThat(found.getDeptName()).isEqualTo("베이스하위부서");
		assertThat(found.getParentId()).isEqualTo(savedRootDeptId);
		assertThat(found.getParentName()).isEqualTo("베이스부서");
	}
	
	
	@Test
	@DisplayName("부서 정렬 순서(sort_order) 최대값 조회")
	void testMaxSortOrder() {
		// savedRootDeptId 아래에는 이미 기준 자식(sort_order=1)이 있음. 형제 부서 2개를 추가.
		DeptRequest d1 = DeptRequest.builder()
				.comId(savedComId).parentId(savedRootDeptId).deptName("팀A").deptCode("A").depth(1).sortOrder(2).build();
		DeptRequest d2 = DeptRequest.builder()
				.comId(savedComId).parentId(savedRootDeptId).deptName("팀B").deptCode("B").depth(1).sortOrder(3).build();
		insertDeptAndGetId(d1);
		insertDeptAndGetId(d2);
 
		long max = mapper.maxSortOrder(savedRootDeptId, savedComId);
		assertThat(max).isEqualTo(3);
	}
	
	@Test
	@DisplayName("부서 등록 - selectKey로 채번된 deptId가 dto에 채워진다")
	void testInsert() {
		DeptRequest dto = DeptRequest.builder()
				.comId(savedComId).parentId(0).deptName("기획팀").deptCode("PLAN").depth(1).sortOrder(2).build();
 
		int res = mapper.insert(dto);
		assertThat(res).isEqualTo(1);
		assertThat(dto.getDeptId()).isGreaterThan(0); // selectKey(BEFORE)로 채번됨
 
		DeptResponse found = mapper.selectOneById(dto.getDeptId());
		assertThat(found.getDeptId()).isEqualTo(dto.getDeptId());
		assertThat(found.getDeptName()).isEqualTo("기획팀");
		assertThat(found.getComId()).isEqualTo(savedComId);
	}
	
	@Test
	@DisplayName("부서 등록 - 상위부서 없음(parentId=0/null)이면 parent_id는 NULL로 저장된다")
	void testInsert_withoutParent() {
		DeptRequest dto = DeptRequest.builder()
				.comId(savedComId).parentId(0).deptName("최상위부서").deptCode("ROOT2").depth(0).sortOrder(2).build();
 
		long deptId = insertDeptAndGetId(dto);
 
		DeptResponse found = mapper.selectOneById(deptId);
		assertThat(found).isNotNull();
		// parent_id가 NULL이면 parentName도 없어야 한다
		assertThat(found.getParentName()).isNull();
	}
	
	@Test
	@DisplayName("하위 부서 존재 여부(countChildren) 확인")
	void testCountChildren() {
		// 기준 자식 1개가 이미 savedRootDeptId 밑에 있음
		long countBefore = mapper.countChildren(savedRootDeptId);
		assertThat(countBefore).isEqualTo(1);
 
		DeptRequest child = DeptRequest.builder()
				.comId(savedComId).parentId(savedRootDeptId).deptName("하위팀").deptCode("SUB").depth(1).sortOrder(2).build();
		insertDeptAndGetId(child);
 
		long countAfter = mapper.countChildren(savedRootDeptId);
		assertThat(countAfter).isEqualTo(2);
	}
	
	@Test
	@DisplayName("부서 삭제(hard delete)")
	void testDelete() {
		DeptRequest dto = DeptRequest.builder()
				.comId(savedComId).parentId(0).deptName("삭제될부서").deptCode("DEL").depth(1).sortOrder(2).build();
		long deptId = insertDeptAndGetId(dto);
 
		int res = mapper.delete(deptId);
		assertThat(res).isEqualTo(1);
 
		DeptResponse found = mapper.selectOneById(deptId);
		assertThat(found).isNull();
	}
	
	@Test
	@DisplayName("부서 수정")
	void testUpdate() {
		// 기준 자식 부서(savedChildDeptId)를 그대로 수정 대상으로 사용
		DeptRequest updateDto = DeptRequest.builder()
				.deptId(savedChildDeptId)
				.deptName("수정후")
				.deptCode("UPD2")
				.parentId(savedRootDeptId)
				.depth(1)
				.build();
 
		int res = mapper.update(updateDto);
		assertThat(res).isEqualTo(1);
 
		DeptResponse found = mapper.selectOneById(savedChildDeptId);
		assertThat(found.getDeptName()).isEqualTo("수정후");
		assertThat(found.getDeptCode()).isEqualTo("UPD2");
	}
	
	@Test
	@DisplayName("하위 부서 id 목록 조회")
	void testSelectAllChildIds() {
		// savedRootDeptId 밑에는 이미 기준 자식(savedChildDeptId)이 있음. 형제 2개를 추가.
		DeptRequest child1 = DeptRequest.builder()
				.comId(savedComId).parentId(savedRootDeptId).deptName("자식1").deptCode("CHILD1").depth(1).sortOrder(2).build();
		DeptRequest child2 = DeptRequest.builder()
				.comId(savedComId).parentId(savedRootDeptId).deptName("자식2").deptCode("CHILD2").depth(1).sortOrder(3).build();
		long child1Id = insertDeptAndGetId(child1);
		long child2Id = insertDeptAndGetId(child2);
 
		// xml은 SELECT dept_id 컬럼만 조회하므로, 반환되는 DeptResponse 객체들은
		// deptId 외 나머지 필드(deptName 등)는 비어있다(0/null).
		List<DeptResponse> children = mapper.selectAllChildIds(savedRootDeptId);
 
		assertThat(children).extracting(DeptResponse::getDeptId)
				.containsExactlyInAnyOrder(savedChildDeptId, child1Id, child2Id);
	}
	
	@Test
	@DisplayName("부서 통계 조회")
	void testSelectStats() {
		// 기준 트리: 루트(depth=0) 1개 + 자식(depth=1) 1개가 이미 존재
		DeptRequest d1 = DeptRequest.builder()
				.comId(savedComId).parentId(savedRootDeptId).deptName("팀").deptCode("S1").depth(2).sortOrder(2).build();
		insertDeptAndGetId(d1);
 
		StatsDeptResponse stats = mapper.selectStats(savedComId);
 
		assertThat(stats.getDeptTotal()).isEqualTo(3);  // 루트 + 기준자식 + 신규
		assertThat(stats.getDept1Total()).isEqualTo(1); // depth = 1: 기준 자식
		assertThat(stats.getDept2Total()).isEqualTo(1); // depth in (2,3): 신규 d1
	}
	
	//TODO: EmployeeMapper 제공 시, savedChildDeptId로 직원을 등록한 뒤
	// countByDept(savedChildDeptId) == 1 이 되는 케이스를 추가로 검증할 것.
	@Test
	@DisplayName("부서별 소속 직원 수 카운트 (countByDept)")
	void testCountByDept() {
//		long count = mapper.countByDept(savedChildDeptId);
//		assertThat(count).isEqualTo(1);
	}
	
	@Test
	@DisplayName("부서 임시 삭제(soft delete) - DEPT_STATUS를 PENDING_DELETE로 변경")
	void testSoftDelete() {
		DeptRequest dto = DeptRequest.builder()
				.comId(savedComId).parentId(0).deptName("보류부서").deptCode("PEND").depth(1).sortOrder(2).build();
		long deptId = insertDeptAndGetId(dto);
 
		int res = mapper.softDelete(deptId);
		assertThat(res).isEqualTo(1);
 
		// countActiveDepts는 DEPT_STATUS != 'DELETED' 조건만 걸려있어 PENDING_DELETE도 여전히 집계된다
		// (설계상 의도된 동작인지 확인 필요)
		long activeCount = mapper.countActiveDepts(savedComId);
		assertThat(activeCount).isEqualTo(3); // 기준 2개 + PENDING_DELETE 1개
 
		// 반면 selectAllDeptsByComId는 상태 조건이 없으므로 항상 조회된다
		List<DeptResponse> all = mapper.selectAllDeptsByComId(savedComId);
		assertThat(all).extracting(DeptResponse::getDeptName).contains("보류부서");
	}
	
	@Test
	@DisplayName("이관 이력 필터용 - 상태 무관 회사 전체 부서 조회")
	void testSelectAllDeptsByComId() {
		DeptRequest dto = DeptRequest.builder()
				.comId(savedComId).parentId(0).deptName("전체조회용부서").deptCode("ALL1").depth(1).sortOrder(2).build();
		insertDeptAndGetId(dto);
 
		List<DeptResponse> all = mapper.selectAllDeptsByComId(savedComId);
		assertThat(all).extracting(DeptResponse::getDeptName)
				.contains("베이스부서", "베이스하위부서", "전체조회용부서");
	}
	
	@Test
	@DisplayName("부서 코드 중복 체크")
	void testSelectDeptCode() {
		// 기준 트리의 루트 부서 코드("BASE0")로 바로 중복 체크 검증 가능
		DeptSearchRequest search = DeptSearchRequest.builder()
				.comId(savedComId).deptCode("BASE0").build();
		DeptResponse found = mapper.selectDeptCode(search);
 
		assertThat(found).isNotNull();
		assertThat(found.getDeptName()).isEqualTo("베이스부서");
 
		// 존재하지 않는 코드는 null 이어야 한다
		DeptSearchRequest notExist = DeptSearchRequest.builder()
				.comId(savedComId).deptCode("NOPE").build();
		assertThat(mapper.selectDeptCode(notExist)).isNull();
	}
}
