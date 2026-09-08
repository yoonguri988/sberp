package com.sb.erp.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.dto.response.ComResponse;
import com.sb.erp.com.repository.CompanyMapper;
import com.sb.erp.dept.dto.request.DeptRequest;
import com.sb.erp.dept.dto.request.DeptTransferLogRequest;
import com.sb.erp.dept.dto.request.DeptTransferLogSearchRequest;
import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.dto.response.DeptTransferLogResponse;
import com.sb.erp.dept.repository.DeptMapper;
import com.sb.erp.dept.repository.DeptTransferLogMapper;
import com.sb.erp.dept.repository.DeptTransferMapper;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.emp.repository.EmpMapper;
import com.sb.erp.pos.dto.request.PosRequest;
import com.sb.erp.pos.dto.response.PosResponse;
import com.sb.erp.pos.repository.PosMapper;

/**
 * NOTE
 * DeptTransferLogRequest / DeptTransferLogSearchRequest 소스 파일은 공유되지 않아, deptlog-mapper.xml의
 * #{...} 플레이스홀더(comId, originDeptId, targetDeptId, empId, aiRecommended, aiReason,
 * handoverSnapshot, createdBy / originDeptId, targetDeptId, aiRecommended, dateFrom, dateTo,
 * pstartno, onepagelist)를 그대로 필드명으로 사용했습니다. 생성자는 이 프로젝트의 모든 DTO가 공통으로
 * 가지고 있는 기본 생성자 + setter 방식으로만 만들어서, Builder 유무와 상관없이 컴파일되도록 했습니다.
 *
 * insertTransferLog가 생성된 log_id를 돌려주지 않고, 조회용 selectCurrentSeq류 메서드도 없어서, 삽입 후에는
 * searchTransferLogs로 다시 조회해 검증합니다.
 */
@SpringBootTest
@Transactional
class BackApplicationTests_DeptTransferLog {

	@Autowired DeptMapper mapper;
	@Autowired CompanyMapper comMapper;
	@Autowired DeptTransferMapper deptTrasfer;
	@Autowired DeptTransferLogMapper deptTrasferLog;
	@Autowired EmpMapper empMapper;
	@Autowired PosMapper posMapper;

	// 테스트에서 공통으로 재사용할 PK
	private long savedComId;
	private long savedDeptId;      // 원부서
	private long savedTargetDeptId; // 대상부서
	private long savedPosId;
	private long savedEmpId;

	// 이관 대상 사원 / 이관 처리자(승인자) 사원
	private long targetEmpId;
	private long createdByEmpId;

	@BeforeEach
	void setUp() {
		// 매 테스트 실행 전, 조회/수정/삭제 테스트에서 사용할 기준 데이터를 등록해둔다.
		savedComId = insertCompany();
		savedPosId = insertPosition(savedComId);
		savedDeptId = insertDepartment(savedComId, "원부서", 0L, 1L, 1L);
		savedTargetDeptId = insertDepartment(savedComId, "대상부서", 0L, 1L, 2L);
		savedEmpId = insertEmployee(savedComId, savedDeptId, savedPosId, "테스트사원", "010-0000-0001");
		targetEmpId = insertEmployee(savedComId, savedDeptId, savedPosId, "이관대상사원", "010-0000-0002");
		createdByEmpId = insertEmployee(savedComId, savedDeptId, savedPosId, "이관처리자", "010-0000-0003");
	}

	// ─── 픽스처 생성 헬퍼 (전부 제공된 Mapper만 사용) ────────────────────────────────

	private long insertCompany() {
		String bizNo = "BIZ-" + System.nanoTime();
		ComRequest dto = ComRequest.builder()
				.industryGrpCode("IT")
				.industryCode("SW")
				.comName("테스트회사")
				.comCeo("홍길동")
				.bizNo(bizNo)
				.comTel("02-1234-5678")
				.build();

		int inserted = comMapper.insert(dto);
		assertThat(inserted).isEqualTo(1);

		ComResponse saved = comMapper.selectByBizNo(bizNo);
		assertThat(saved).isNotNull();
		return saved.getComId();
	}

	private long insertPosition(long comId) {
		String posCode = "POS-" + System.nanoTime();
		PosRequest dto = PosRequest.builder()
				.comId(comId)
				.posCode(posCode)
				.posName("사원")
				.posOrder(1)
				.build();

		int inserted = posMapper.insert(dto);
		assertThat(inserted).isEqualTo(1);

		PosResponse saved = posMapper.selectAll(comId).stream()
				.filter(p -> posCode.equals(p.getPosCode()))
				.findFirst()
				.orElse(null);
		assertThat(saved).isNotNull();
		return saved.getPosId();
	}

	private long insertDepartment(long comId, String deptName, long parentId, long depth, long sortOrder) {
		String deptCode = "DEPT-" + System.nanoTime();
		DeptRequest dto = DeptRequest.builder()
				.comId(comId)
				.parentId(parentId)
				.deptName(deptName)
				.deptCode(deptCode)
				.depth(depth)
				.sortOrder(sortOrder)
				.build();

		int inserted = mapper.insert(dto);
		assertThat(inserted).isEqualTo(1);

		DeptResponse saved = mapper.selectAllDeptsByComId(comId).stream()
				.filter(d -> deptCode.equals(d.getDeptCode()))
				.findFirst()
				.orElse(null);
		assertThat(saved).isNotNull();
		return saved.getDeptId();
	}

	private long insertEmployee(long comId, long deptId, long posId, String empName, String empMobile) {
		String uniqueKey = String.valueOf(System.nanoTime());
		EmpRequest dto = EmpRequest.builder()
				.empNo("EMP-" + uniqueKey)
				.empName(empName)
				.empPass("{noop}test1234")
				.empEmail("emp" + uniqueKey + "@test.com")
				.empMobile(empMobile)
				.empStatus("ACTIVE")
				.hireDate("2026-08-07")
				.comId(comId)
				.posId(posId)
				.deptId(deptId)
				.build();

		int inserted = empMapper.insert(dto);
		assertThat(inserted).isEqualTo(1);

		EmpResponse saved = empMapper.selectByEmpEmail(dto.getEmpEmail());
		assertThat(saved).isNotNull();
		return saved.getEmpId();
	}

	private int insertTransferLog(long comId, long originDeptId, long targetDeptId, long empId,
			String aiRecommended, String aiReason, String handoverSnapshot, long createdBy) {
		DeptTransferLogRequest dto = new DeptTransferLogRequest();
		dto.setComId(comId);
		dto.setOriginDeptId(originDeptId);
		dto.setTargetDeptId(targetDeptId);
		dto.setEmpId(empId);
		dto.setAiRecommended(aiRecommended);
		dto.setAiReason(aiReason);
		dto.setHandoverSnapshot(handoverSnapshot);
		dto.setCreatedBy(createdBy);

		return deptTrasferLog.insertTransferLog(dto);
	}

	private DeptTransferLogSearchRequest emptySearch(int pstartno, int onepagelist) {
		DeptTransferLogSearchRequest search = new DeptTransferLogSearchRequest();
		search.setPstartno(pstartno);
		search.setOnepagelist(onepagelist);
		return search;
	}

	@Test
	@DisplayName("부서 이관 로그 삽입 성공")
	void insertTransferLog_success() {
		int inserted = insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"Y", "AI 추천 사유 테스트", "인수인계 스냅샷 테스트", createdByEmpId);

		assertThat(inserted).isEqualTo(1);
	}

	@Test
	@DisplayName("검색조건 없이 전체 이관 로그 조회 시 조인 데이터까지 정상 매핑된다")
	void searchTransferLogs_nofilter() {
		insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"Y", "AI 추천 사유 테스트", "인수인계 스냅샷 테스트", createdByEmpId);

		List<DeptTransferLogResponse> result = deptTrasferLog.searchTransferLogs(savedComId, emptySearch(0, 10));

		assertThat(result).isNotEmpty();
		DeptTransferLogResponse found = result.stream()
				.filter(r -> r.getEmpId() == targetEmpId)
				.findFirst()
				.orElse(null);

		assertThat(found).isNotNull();
		assertThat(found.getComId()).isEqualTo(savedComId);
		assertThat(found.getOriginDeptId()).isEqualTo(savedDeptId);
		assertThat(found.getOriginDeptName()).isEqualTo("원부서");
		assertThat(found.getTargetDeptId()).isEqualTo(savedTargetDeptId);
		assertThat(found.getTargetDeptName()).isEqualTo("대상부서");
		assertThat(found.getEmpName()).isEqualTo("이관대상사원");
		assertThat(found.getCreatedBy()).isEqualTo(createdByEmpId);
		assertThat(found.getCreatedByName()).isEqualTo("이관처리자");
		assertThat(found.getAiRecommended()).isEqualTo("Y");
		assertThat(found.getAiReason()).isEqualTo("AI 추천 사유 테스트");
		assertThat(found.getHandoverSnapshot()).isEqualTo("인수인계 스냅샷 테스트");
	}

	@Test
	@DisplayName("origin/target 부서ID로 필터링하여 조회한다")
	void searchTransferLogs_deptId() {
		long otherOriginDeptId = insertDepartment(savedComId, "다른원부서", 0L, 1L, 3L);
		long otherTargetDeptId = insertDepartment(savedComId, "다른대상부서", 0L, 1L, 4L);

		insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"Y", "로그1", "스냅샷1", createdByEmpId);
		insertTransferLog(savedComId, otherOriginDeptId, otherTargetDeptId, targetEmpId,
				"N", "로그2", "스냅샷2", createdByEmpId);

		DeptTransferLogSearchRequest byOrigin = emptySearch(0, 10);
		byOrigin.setOriginDeptId(savedDeptId);
		List<DeptTransferLogResponse> originResult = deptTrasferLog.searchTransferLogs(savedComId, byOrigin);

		assertThat(originResult).extracting("targetDeptId").contains(savedTargetDeptId);
		assertThat(originResult).extracting("targetDeptId").doesNotContain(otherTargetDeptId);

		DeptTransferLogSearchRequest byTarget = emptySearch(0, 10);
		byTarget.setTargetDeptId(otherTargetDeptId);
		List<DeptTransferLogResponse> targetResult = deptTrasferLog.searchTransferLogs(savedComId, byTarget);

		assertThat(targetResult).extracting("originDeptId").contains(otherOriginDeptId);
		assertThat(targetResult).extracting("originDeptId").doesNotContain(savedDeptId);
	}

	@Test
	@DisplayName("aiRecommended 값으로 필터링하여 조회한다")
	void searchTransferLogs_aiRecommended() {
		insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"Y", "AI추천됨", "스냅샷Y", createdByEmpId);
		insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"N", "AI추천안됨", "스냅샷N", createdByEmpId);

		DeptTransferLogSearchRequest onlyY = emptySearch(0, 10);
		onlyY.setAiRecommended("Y");
		List<DeptTransferLogResponse> result = deptTrasferLog.searchTransferLogs(savedComId, onlyY);

		assertThat(result).isNotEmpty();
		assertThat(result).allMatch(r -> "Y".equals(r.getAiRecommended()));
		assertThat(result.stream().anyMatch(r -> "스냅샷Y".equals(r.getHandoverSnapshot()))).isTrue();
		assertThat(result.stream().anyMatch(r -> "스냅샷N".equals(r.getHandoverSnapshot()))).isFalse();
	}

	@Test
	@DisplayName("dateFrom ~ dateTo 기간으로 필터링하여 조회한다")
	void searchTransferLogs_date() {
		insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"Y", "날짜필터테스트", "스냅샷날짜", createdByEmpId);

		DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
		String yesterday = LocalDate.now().minusDays(1).format(fmt);
		String tomorrow = LocalDate.now().plusDays(1).format(fmt);

		DeptTransferLogSearchRequest withinRange = emptySearch(0, 10);
		withinRange.setDateFrom(yesterday);
		withinRange.setDateTo(tomorrow);
		List<DeptTransferLogResponse> included = deptTrasferLog.searchTransferLogs(savedComId, withinRange);
		assertThat(included.stream().anyMatch(r -> "스냅샷날짜".equals(r.getHandoverSnapshot()))).isTrue();

		DeptTransferLogSearchRequest outOfRange = emptySearch(0, 10);
		outOfRange.setDateFrom(tomorrow);
		List<DeptTransferLogResponse> excluded = deptTrasferLog.searchTransferLogs(savedComId, outOfRange);
		assertThat(excluded.stream().anyMatch(r -> "스냅샷날짜".equals(r.getHandoverSnapshot()))).isFalse();
	}

	@Test
	@DisplayName("listTotal은 검색조건이 동일할 때 실제 목록 건수와 일치한다")
	void listTotal_count() {
		insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"Y", "카운트테스트1", "스냅샷카운트1", createdByEmpId);
		insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"N", "카운트테스트2", "스냅샷카운트2", createdByEmpId);

		DeptTransferLogSearchRequest search = emptySearch(0, 100);
		int total = deptTrasferLog.listTotal(savedComId, search);
		List<DeptTransferLogResponse> fullList = deptTrasferLog.searchTransferLogs(savedComId, search);

		assertThat(total).isEqualTo(fullList.size());
		assertThat(total).isGreaterThanOrEqualTo(2);
	}

	@Test
	@DisplayName("OFFSET/FETCH 페이징이 정상 동작한다")
	void searchTransferLogs_paging() {
		insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"Y", "페이징1", "스냅샷페이징1", createdByEmpId);
		insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"Y", "페이징2", "스냅샷페이징2", createdByEmpId);
		insertTransferLog(savedComId, savedDeptId, savedTargetDeptId, targetEmpId,
				"Y", "페이징3", "스냅샷페이징3", createdByEmpId);

		int total = deptTrasferLog.listTotal(savedComId, emptySearch(0, 100));
		assertThat(total).isGreaterThanOrEqualTo(3);

		List<DeptTransferLogResponse> page1 = deptTrasferLog.searchTransferLogs(savedComId, emptySearch(0, 1));
		List<DeptTransferLogResponse> page2 = deptTrasferLog.searchTransferLogs(savedComId, emptySearch(1, 1));

		assertThat(page1).hasSize(1);
		assertThat(page2).hasSize(1);
		// 페이지가 다르면 서로 다른 로그가 반환되어야 한다
		assertThat(page1.get(0).getHandoverSnapshot()).isNotEqualTo(page2.get(0).getHandoverSnapshot());
	}

}