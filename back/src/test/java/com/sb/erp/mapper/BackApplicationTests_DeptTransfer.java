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

import com.sb.erp.appr.dto.request.ApprDocRequest;
import com.sb.erp.appr.dto.request.ApprFormRequest;
import com.sb.erp.appr.dto.response.ApprDocImpactResponse;
import com.sb.erp.appr.dto.response.ApprLineImpactResponse;
import com.sb.erp.appr.repository.ApprDocMapper;
import com.sb.erp.appr.repository.ApprFormMapper;
import com.sb.erp.appr.repository.ApprLineMapper;
import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.dto.response.ComResponse;
import com.sb.erp.com.repository.CompanyMapper;
import com.sb.erp.dept.dto.request.DeptRequest;
import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.dto.response.PendingDeptResponse;
import com.sb.erp.dept.repository.DeptMapper;
import com.sb.erp.dept.repository.DeptTransferMapper;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.emp.dto.response.EmpTransferResponse;
import com.sb.erp.emp.repository.EmpMapper;
import com.sb.erp.pos.dto.request.PosRequest;
import com.sb.erp.pos.dto.response.PosResponse;
import com.sb.erp.pos.repository.PosMapper;
import com.sb.erp.res.dto.request.ResRequest;
import com.sb.erp.res.dto.response.ResResponse;
import com.sb.erp.res.repository.ResourceMapper;
import com.sb.erp.resv.dto.request.ResvRequest;
import com.sb.erp.resv.dto.request.ResvSearchRequest;
import com.sb.erp.resv.dto.response.ResvImpactResponse;
import com.sb.erp.resv.dto.response.ResvResponse;
import com.sb.erp.resv.repository.ReservationMapper;

@SpringBootTest
@Transactional
class BackApplicationTests_DeptTransfer {

	@Autowired DeptMapper mapper;
	@Autowired CompanyMapper comMapper;
	@Autowired DeptTransferMapper deptTrasfer;
	@Autowired EmpMapper empMapper;
	@Autowired PosMapper posMapper;
	@Autowired ResourceMapper resMapper;
	@Autowired ReservationMapper resvMapper;
	@Autowired ApprDocMapper docMapper;
	@Autowired ApprFormMapper formMapper;
	@Autowired ApprLineMapper lineMapper;

	// 테스트에서 공통으로 재사용할 PK
	private long savedComId;
	private long savedDeptId;
	private long savedPosId;
	private long savedEmpId;

	@BeforeEach
	void setUp() {
		// 매 테스트 실행 전, 조회/수정/삭제 테스트에서 사용할 기준 데이터를 등록해둔다.
		savedComId = insertCompany();
		savedPosId = insertPosition(savedComId);
		savedDeptId = insertDepartment(savedComId, "테스트부서", 0L, 1L, 1L);
		savedEmpId = insertEmployee(savedComId, savedDeptId, savedPosId, "테스트사원", "010-0000-0001");
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

	private long insertResource(long comId) {
		String resCode = "RES-" + System.nanoTime();
		ResRequest dto = ResRequest.builder()
				.comId(comId)
				.resCode(resCode)
				.resName("테스트차량")
				.resType("VEHICLE")
				.quantity(3L)
				.location("본사 지하주차장")
				.resStatus("AVAILABLE")
				.build();

		int inserted = resMapper.insertResource(dto);
		assertThat(inserted).isEqualTo(1);

		ResResponse saved = resMapper.selectByResCode(
				ResRequest.builder().comId(comId).resCode(resCode).build());
		assertThat(saved).isNotNull();
		return saved.getResId();
	}

	private long insertPendingReservation(long comId, long resId, long empId) {
		ResvRequest dto = ResvRequest.builder()
				.resId(resId)
				.comId(comId)
				.empId(empId)
				.quantity(1L)
				.startDt(LocalDateTime.now().plusDays(1).withSecond(0).withNano(0))
				.endDt(LocalDateTime.now().plusDays(1).plusHours(2).withSecond(0).withNano(0))
				.remark("이관 테스트용 예약")
				.build();

		int inserted = resvMapper.insert(dto);
		assertThat(inserted).isEqualTo(1);

		List<ResvResponse> result = resvMapper.selectAll(ResvSearchRequest.builder()
				.comId(comId)
				.empId(empId)
				.pstartno(0)
				.onepagelist(1)
				.build());
		assertThat(result).isNotEmpty();
		return result.get(0).getRevId();
	}

	private long insertApprForm(long comId) {
		ApprFormRequest req = new ApprFormRequest();
		req.setComId(comId);
		req.setForCode("FORM-" + System.nanoTime());
		req.setForTitle("테스트양식");
		req.setForContent("<form></form>");
		req.setForStatus(true);

		int inserted = formMapper.insertForm(req);
		assertThat(inserted).isEqualTo(1);

		Long forId = formMapper.selectCurrentFormSeq();
		assertThat(forId).isNotNull();
		return forId;
	}

	private long insertApprDoc(long comId, long empId, long forId, long forVersion, String docTitle) {
		ApprDocRequest req = new ApprDocRequest();
		req.setForId(forId);
		req.setForVersion(forVersion);
		req.setDocTitle(docTitle);
		req.setDocContent("테스트 결재 문서 내용");
		req.setApproverEmpIds(List.of(empId));

		int inserted = docMapper.insertDoc(req, empId, comId);
		assertThat(inserted).isEqualTo(1);

		Long docId = docMapper.selectCurrentDocSeq();
		assertThat(docId).isNotNull();
		return docId;
	}

	private void insertApprLine(long docId, long empId, int linOrder, String linStatus) {
		int inserted = lineMapper.insertLine(docId, empId, linOrder, linStatus);
		assertThat(inserted).isEqualTo(1);
	}

	@Test
	@DisplayName("해당 부서가 자신이 속한 회사의 부서가 맞는지 확인")
	void testCountDeptInCompany() {
		int count = deptTrasfer.countDeptInCompany(savedDeptId, savedComId);
		assertThat(count).isEqualTo(1);

		long otherComId = insertCompany();
		int countForOtherCompany = deptTrasfer.countDeptInCompany(savedDeptId, otherComId);
		assertThat(countForOtherCompany).isEqualTo(0);
	}

	@Test
	@DisplayName("삭제 대기중인 부서 목록 조회")
	void testSelectOneById() {
		mapper.softDelete(savedDeptId);
		
		DeptResponse result = deptTrasfer.selectOneById(savedDeptId);

		assertThat(result).isNotNull();
		assertThat(result.getDeptId()).isEqualTo(savedDeptId);
		assertThat(result.getComId()).isEqualTo(savedComId);
		assertThat(result.getDeptName()).isEqualTo("테스트부서");
	}

	@Test
	@DisplayName("이관 대상 사원")
	void testFindEmployeesByDept() {
		List<EmpTransferResponse> result = deptTrasfer.findEmployeesByDept(savedDeptId);
		assertThat(result).hasSize(1);
	}

	@Test
	@DisplayName("사원 기준 미처리 예약")
	void testFindPendingResvByDept() {
		long resId = insertResource(savedComId);
		long revId = insertPendingReservation(savedComId, resId, savedEmpId);

		List<ResvImpactResponse> result = deptTrasfer.findPendingResvByDept(savedDeptId);

		assertThat(result).isNotEmpty();
		assertThat(result.stream().anyMatch(r -> r.getRevId() != null && r.getRevId() == revId)).isTrue();
	}

	@Test
	@DisplayName("사원 기준 미완료 결재라인")
	void testFindPendingApprLineByDept() {
		long forId = insertApprForm(savedComId);
		long docId = insertApprDoc(savedComId, savedEmpId, forId, 1L, "결재라인 테스트 문서");
		insertApprLine(docId, savedEmpId, 1, "WAI");

		List<ApprLineImpactResponse> result = deptTrasfer.findPendingApprLineByDept(savedDeptId);

		assertThat(result).isNotEmpty();
	}

	@Test
	@DisplayName("사원이 기안한 진행중 결재문서")
	void testFindPendingApprDocsByDept() {
		long forId = insertApprForm(savedComId);
		insertApprDoc(savedComId, savedEmpId, forId, 1L, "진행중 결재문서 테스트");

		List<ApprDocImpactResponse> result = deptTrasfer.findPendingApprDocsByDept(savedDeptId);

		assertThat(result).isNotEmpty();
	}

	@Test
	@DisplayName("사원이 기안한 진행중 결재문서 제목 요약 — AI 프롬프트 재료 겸 dept_transfer_log.handover_snapshot 원본")
	void testFindPendingApprDocTitles() {
		long forId = insertApprForm(savedComId);
		String docTitle = "제목요약 테스트 문서";
		insertApprDoc(savedComId, savedEmpId, forId, 1L, docTitle);

		String titles = deptTrasfer.findPendingApprDocTitles(savedDeptId);

		assertThat(titles).isNotBlank();
		assertThat(titles).contains(docTitle);
	}

	@Test
	@DisplayName("필터링: (1) 동일 상위조직(형제 부서) OR (2) 해체 대상 부서의 상위 부서 자체")
	void testFindCandidateDepartments() {
		long parentDeptId = insertDepartment(savedComId, "상위부서", 0L, 1L, 1L);
		long childDeptA = insertDepartment(savedComId, "자식부서A", parentDeptId, 2L, 1L);
		long childDeptB = insertDepartment(savedComId, "자식부서B", parentDeptId, 2L, 2L);

		List<DeptResponse> candidates = deptTrasfer.findCandidateDepartments(childDeptA, savedComId);

		assertThat(candidates).extracting("deptId").doesNotContain(childDeptA);
		assertThat(candidates.stream()
				.anyMatch(d -> d.getDeptId() == childDeptB || d.getDeptId() == parentDeptId))
				.isTrue();
	}

	@Test
	@DisplayName("필터링: 필터링 실패 시 폴백용 전체 목록")
	void testFindActiveDeptsExcluding() {
		long anotherDeptId = insertDepartment(savedComId, "다른부서", 0L, 1L, 2L);

		List<DeptResponse> result = deptTrasfer.findActiveDeptsExcluding(savedDeptId, savedComId);

		assertThat(result).extracting("deptId").doesNotContain(savedDeptId);
		assertThat(result).extracting("deptId").contains(anotherDeptId);
	}

	@Test
	@DisplayName("이관 취소 업데이트")
	void testUpdateActiveById() {
		int res = mapper.softDelete(savedDeptId);
		assertThat(res).isEqualTo(1);
		
		DeptResponse pending = mapper.selectOneById(savedDeptId);
		assertThat(pending.getDeptStatus()).isEqualTo("PENDING_DELETE");

		int updated = deptTrasfer.updateActiveById(savedDeptId);
		assertThat(updated).isEqualTo(1);

		DeptResponse active = mapper.selectOneById(savedDeptId);
		assertThat(active.getDeptStatus()).isEqualTo("ACTIVE");
	}

	@Test
	@DisplayName("부서 이관 확정")
	void testMarkDeleted() {
		mapper.softDelete(savedDeptId);

		int updated = deptTrasfer.markDeleted(savedDeptId);
		assertThat(updated).isEqualTo(1);
	}

	@Test
	@DisplayName("부서 이관 진행 (사원 부서 업데이트)")
	void testUpdateEmployeeDept() {
		long newDeptId = insertDepartment(savedComId, "새부서", 0L, 1L, 3L);

		int updated = deptTrasfer.updateEmployeeDept(savedEmpId, newDeptId);
		assertThat(updated).isEqualTo(1);

		EmpResponse empAfter = empMapper.selectByEmpId(savedEmpId, savedComId);
		assertThat(empAfter.getDeptName()).isEqualTo("새부서");
	}

	@Test
	@DisplayName("이관 대기(PENDING_DELETE) 부서 목록")
	void testFindPendingTransferDepts() {
		mapper.softDelete(savedDeptId);

		List<PendingDeptResponse> result = deptTrasfer.findPendingTransferDepts(savedComId, null);
		assertThat(result).extracting("deptId").contains(savedDeptId);

		List<PendingDeptResponse> keywordMatch = deptTrasfer.findPendingTransferDepts(savedComId, "테스트부서");
		assertThat(keywordMatch).extracting("deptId").contains(savedDeptId);

		List<PendingDeptResponse> keywordNoMatch = deptTrasfer.findPendingTransferDepts(savedComId, "존재하지않는키워드XYZ");
		assertThat(keywordNoMatch).extracting("deptId").doesNotContain(savedDeptId);
	}

}