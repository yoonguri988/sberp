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
import com.sb.erp.com.dto.response.ComResponse;
import com.sb.erp.com.repository.CompanyMapper;
import com.sb.erp.dept.dto.request.DeptRequest;
import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.repository.DeptMapper;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.emp.repository.EmpMapper;
import com.sb.erp.pos.dto.request.PosRequest;
import com.sb.erp.pos.dto.response.PosResponse;
import com.sb.erp.pos.repository.PosMapper;
import com.sb.erp.res.dto.request.ResRequest;
import com.sb.erp.res.dto.response.ResResponse;
import com.sb.erp.res.repository.ResourceMapper;
import com.sb.erp.resv.dto.request.ResvRequest;
import com.sb.erp.resv.dto.request.ResvSearchRequest;
import com.sb.erp.resv.dto.response.ResvResponse;
import com.sb.erp.resv.dto.response.StatsResvResponse;
import com.sb.erp.resv.repository.ReservationMapper;

@SpringBootTest
@Transactional
class BackApplicationTests_Reservation {

	@Autowired CompanyMapper mapper;
	@Autowired DeptMapper deptMapper;
	@Autowired PosMapper posMapper;
	@Autowired EmpMapper empMapper;
	@Autowired ResourceMapper resMapper;
	@Autowired ReservationMapper resvMapper;

	// 여러 테스트에서 공통으로 재사용
	private long savedComId;
	private long savedDeptId;
	private long savedPosId;
	private long savedEmpId;         // 예약 신청자
	private long savedApproverEmpId; // 승인/반려 처리자
	private long savedResId;
	private long savedResvId;

	@BeforeEach
	void setUp() {
		// 매 테스트 실행 전, 조회/수정/삭제 테스트에서 사용할 기준 데이터를 하나 등록해둔다.
		savedComId = insertCompany();
		savedDeptId = insertDepartment(savedComId);
		savedPosId = insertPosition(savedComId);

		// 사원 - 예약 신청자
		savedEmpId = insertEmployee("테스트사원", "010-0000-0001");

		// 사원 - 승인권자
		savedApproverEmpId = insertEmployee("테스트승인자", "010-0000-0002");

		// 자원 (VEHICLE - 반납지연 노쇼 케이스 테스트용)
		savedResId = insertResource();

		// 예약 (WAI 상태 기준 데이터)
		savedResvId = insertReservation(savedResId, savedEmpId,
				LocalDateTime.now().plusDays(1).withSecond(0).withNano(0),
				LocalDateTime.now().plusDays(1).plusHours(2).withSecond(0).withNano(0),
				"기준 예약");
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

		int inserted = mapper.insert(dto);
		assertThat(inserted).isEqualTo(1);

		ComResponse saved = mapper.selectByBizNo(bizNo);
		assertThat(saved).isNotNull();
		return saved.getComId();
	}

	private long insertDepartment(long comId) {
		String deptCode = "DEPT-" + System.nanoTime();
		DeptRequest dto = DeptRequest.builder()
				.comId(comId)
				.deptName("테스트부서")
				.deptCode(deptCode)
				.depth(1L)
				.sortOrder(1L)
				.build();

		int inserted = deptMapper.insert(dto);
		assertThat(inserted).isEqualTo(1);

		DeptResponse saved = deptMapper.selectAllDeptsByComId(comId).stream()
				.filter(d -> deptCode.equals(d.getDeptCode()))
				.findFirst()
				.orElse(null);
		assertThat(saved).isNotNull();
		return saved.getDeptId();
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

	private long insertEmployee(String empName, String empMobile) {
		String uniqueKey = String.valueOf(System.nanoTime());
		EmpRequest dto = EmpRequest.builder()
				.empNo("EMP-" + uniqueKey)
				.empName(empName)
				.empPass("{noop}test1234")
				.empEmail("emp" + uniqueKey + "@test.com")
				.empMobile(empMobile)
				.empStatus("재직")
				.hireDate("2026-08-07")
				.comId(savedComId)
				.posId(savedPosId)
				.deptId(savedDeptId)
				.build();

		int inserted = empMapper.insert(dto);
		assertThat(inserted).isEqualTo(1);

		EmpResponse saved = empMapper.selectByEmpEmail(dto.getEmpEmail());
		assertThat(saved).isNotNull();
		return saved.getEmpId();
	}

	private long insertResource() {
		String resCode = "RES-" + System.nanoTime();
		ResRequest dto = ResRequest.builder()
				.comId(savedComId)
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
				ResRequest.builder().comId(savedComId).resCode(resCode).build());
		assertThat(saved).isNotNull();
		return saved.getResId();
	}

	private long insertReservation(long resId, long empId, LocalDateTime startDt, LocalDateTime endDt, String remark) {
		ResvRequest dto = ResvRequest.builder()
				.resId(resId)
				.comId(savedComId)
				.empId(empId)
				.quantity(1L)
				.startDt(startDt)
				.endDt(endDt)
				.remark(remark)
				.build();

		int inserted = resvMapper.insert(dto);
		assertThat(inserted).isEqualTo(1);

		// insert()가 생성된 rev_id를 돌려주지 않으므로, 방금 만든 예약이 항상 최신(rev_id DESC 1번째)이라는
		// 점을 이용해 조회해서 가져온다.
		List<ResvResponse> result = resvMapper.selectAll(ResvSearchRequest.builder()
				.comId(savedComId)
				.empId(empId)
				.pstartno(0)
				.onepagelist(1)
				.build());
		assertThat(result).isNotEmpty();
		return result.get(0).getRevId();
	}

	@Test
	@DisplayName("예약 목록: 회사별 + 상태필터 + 페이징, resource/employee 조인해서 이름까지 표시")
	void testSelectAll() {
		ResvSearchRequest search = ResvSearchRequest.builder()
				.comId(savedComId)
				.pstartno(0)
				.onepagelist(10)
				.build();

		List<ResvResponse> result = resvMapper.selectAll(search);

		assertThat(result).isNotEmpty();
		ResvResponse found = result.stream()
				.filter(r -> r.getRevId().equals(savedResvId))
				.findFirst()
				.orElse(null);
		assertThat(found).isNotNull();
		assertThat(found.getStatus()).isEqualTo("WAI");
		assertThat(found.getResName()).isEqualTo("테스트차량");
		assertThat(found.getEmpName()).isEqualTo("테스트사원");
		assertThat(found.getDeptName()).isEqualTo("테스트부서");

		// 상태 필터
		ResvSearchRequest waiOnly = ResvSearchRequest.builder()
				.comId(savedComId)
				.status("WAI")
				.pstartno(0)
				.onepagelist(10)
				.build();
		List<ResvResponse> waiResult = resvMapper.selectAll(waiOnly);
		assertThat(waiResult).allMatch(r -> "WAI".equals(r.getStatus()));
	}

	@Test
	@DisplayName("예약 전체 개수 (페이징 계산용)")
	void testSelectCount() {
		ResvSearchRequest search = ResvSearchRequest.builder()
				.comId(savedComId)
				.build();

		int count = resvMapper.selectCount(search);

		assertThat(count).isGreaterThanOrEqualTo(1);
	}

	@Test
	@DisplayName("예약 상세")
	void testSelectById() {
		ResvResponse result = resvMapper.selectById((int) savedResvId);

		assertThat(result).isNotNull();
		assertThat(result.getRevId()).isEqualTo(savedResvId);
		assertThat(result.getResId()).isEqualTo(savedResId);
		assertThat(result.getEmpId()).isEqualTo(savedEmpId);
		assertThat(result.getStatus()).isEqualTo("WAI");
		assertThat(result.getResName()).isEqualTo("테스트차량");
		assertThat(result.getEmpName()).isEqualTo("테스트사원");
	}

	@Test
	@DisplayName("예약 등록: 사용자가 자원을 신청하면 상태는 항상 'WAI'(대기)로 시작")
	void testInsert() {
		LocalDateTime start = LocalDateTime.now().plusDays(3).withSecond(0).withNano(0);
		LocalDateTime end = start.plusHours(2);

		long newRevId = insertReservation(savedResId, savedEmpId, start, end, "신규 예약 테스트");

		ResvResponse newResv = resvMapper.selectById((int) newRevId);
		assertThat(newResv.getStatus()).isEqualTo("WAI");
		assertThat(newResv.getResId()).isEqualTo(savedResId);
		assertThat(newResv.getQuantity()).isEqualTo(1L);
	}

	@Test
	@DisplayName("예약 수정: 대기(WAI) 상태에서만 가능, 시간대까지 변경 가능하도록 반영")
	void testUpdate() {
		LocalDateTime newStart = LocalDateTime.now().plusDays(5).withSecond(0).withNano(0);
		LocalDateTime newEnd = newStart.plusHours(3);

		ResvRequest dto = ResvRequest.builder()
				.revId(savedResvId)
				.quantity(2L)
				.startDt(newStart)
				.endDt(newEnd)
				.remark("수정된 예약")
				.build();

		int updated = resvMapper.update(dto);
		assertThat(updated).isEqualTo(1);

		ResvResponse result = resvMapper.selectById((int) savedResvId);
		assertThat(result.getQuantity()).isEqualTo(2L);
		assertThat(result.getRemark()).isEqualTo("수정된 예약");
		assertThat(result.getStartDt()).isEqualTo(newStart);
		assertThat(result.getEndDt()).isEqualTo(newEnd);

		// WAI 상태가 아니면 수정되지 않는다
		resvMapper.updateApprove(ResvRequest.builder()
				.revId(savedResvId)
				.approvedEmpId(savedApproverEmpId)
				.build());

		int updatedAfterApproval = resvMapper.update(dto);
		assertThat(updatedAfterApproval).isEqualTo(0);
	}

	@Test
	@DisplayName("예약 승인")
	void testUpdateApprove() {
		ResvRequest dto = ResvRequest.builder()
				.revId(savedResvId)
				.approvedEmpId(savedApproverEmpId)
				.build();

		int updated = resvMapper.updateApprove(dto);
		assertThat(updated).isEqualTo(1);

		ResvResponse result = resvMapper.selectById((int) savedResvId);
		assertThat(result.getStatus()).isEqualTo("APP");
		assertThat(result.getApprovedEmpId()).isEqualTo(savedApproverEmpId);
		assertThat(result.getApprovedAt()).isNotNull();

		// 이미 승인된 건은 다시 승인되지 않는다 (WAI 상태만 대상)
		int secondApprove = resvMapper.updateApprove(dto);
		assertThat(secondApprove).isEqualTo(0);
	}

	@Test
	@DisplayName("예약 반려: 반려 사유는 remark가 아닌 reject_reason에 별도 저장")
	void testUpdateReject() {
		ResvRequest dto = ResvRequest.builder()
				.revId(savedResvId)
				.approvedEmpId(savedApproverEmpId)
				.rejectReason("자원 점검 예정으로 반려합니다")
				.build();

		int updated = resvMapper.updateReject(dto);
		assertThat(updated).isEqualTo(1);

		ResvResponse result = resvMapper.selectById((int) savedResvId);
		assertThat(result.getStatus()).isEqualTo("REJ");
		assertThat(result.getRejectReason()).isEqualTo("자원 점검 예정으로 반려합니다");
		assertThat(result.getApprovedEmpId()).isEqualTo(savedApproverEmpId);
		// remark는 반려 사유로 덮어써지지 않아야 한다
		assertThat(result.getRemark()).isEqualTo("기준 예약");
	}

	@Test
	@DisplayName("상태별 개수 (관리자 대시보드 통계카드: 전체 / 대기 / 승인 / 반려)")
	void testCountByStats() {
		ResvSearchRequest search = ResvSearchRequest.builder()
				.comId(savedComId)
				.build();

		StatsResvResponse before = resvMapper.countByStats(search);
		assertThat(before.getResvTotal()).isGreaterThanOrEqualTo(1);
		assertThat(before.getWaiTotal()).isGreaterThanOrEqualTo(1);

		resvMapper.updateApprove(ResvRequest.builder()
				.revId(savedResvId)
				.approvedEmpId(savedApproverEmpId)
				.build());

		StatsResvResponse after = resvMapper.countByStats(search);
		assertThat(after.getAppTotal()).isEqualTo(before.getAppTotal() + 1);
		assertThat(after.getWaiTotal()).isEqualTo(before.getWaiTotal() - 1);
		assertThat(after.getResvTotal()).isEqualTo(before.getResvTotal());
	}

	@Test
	@DisplayName("자원 삭제 전에 \"진행 중인\" 예약(대기/승인)이 있는지 확인. 반려 건은 제외")
	void testCountReservationsByResourceId() {
		// WAI 상태 기준 데이터 존재 -> 1건 이상
		int inProgress = resvMapper.countReservationsByResourceId((int) savedResId);
		assertThat(inProgress).isGreaterThanOrEqualTo(1);

		// 반려 처리하면 진행 중인 예약에서 제외되어야 한다
		resvMapper.updateReject(ResvRequest.builder()
				.revId(savedResvId)
				.approvedEmpId(savedApproverEmpId)
				.rejectReason("삭제 테스트용 반려")
				.build());

		int afterReject = resvMapper.countReservationsByResourceId((int) savedResId);
		assertThat(afterReject).isEqualTo(inProgress - 1);
	}

	@Test
	@DisplayName("특정 자원의 특정 기간에 이미 예약(대기+승인)된 수량 합계")
	void testSelectReservedQuantity() {
		// 기준 예약(WAI, quantity=1)과 겹치는 기간으로 조회
		ResvSearchRequest search = ResvSearchRequest.builder()
				.resId(savedResId)
				.startDt(LocalDateTime.now())
				.endDt(LocalDateTime.now().plusDays(3))
				.build();

		int reservedQty = resvMapper.selectReservedQuantity(search);
		assertThat(reservedQty).isGreaterThanOrEqualTo(1);

		// 자기 자신을 제외하면 겹치는 예약이 없어야 한다 (기준데이터 1건뿐이므로)
		ResvSearchRequest excludeSelf = ResvSearchRequest.builder()
				.resId(savedResId)
				.excludeRevId(savedResvId)
				.startDt(LocalDateTime.now())
				.endDt(LocalDateTime.now().plusDays(3))
				.build();

		int reservedQtyExcludingSelf = resvMapper.selectReservedQuantity(excludeSelf);
		assertThat(reservedQtyExcludingSelf).isEqualTo(reservedQty - 1);
	}

	@Test
	@DisplayName("알림 발송 대상 조회")
	void testSelectNoShowTargets() {
		// 1) WAI 상태에서 종료시간을 과거로 이동 (update는 WAI 상태에서만 허용됨)
		LocalDateTime pastStart = LocalDateTime.now().minusHours(3).withSecond(0).withNano(0);
		LocalDateTime pastEnd = LocalDateTime.now().minusHours(1).withSecond(0).withNano(0);
		int updated = resvMapper.update(ResvRequest.builder()
				.revId(savedResvId)
				.startDt(pastStart)
				.endDt(pastEnd)
				.build());
		assertThat(updated).isEqualTo(1);

		// 2) 승인 처리 (VEHICLE + 종료시간 경과 + return_dt 없음 = 반납지연 노쇼 조건)
		resvMapper.updateApprove(ResvRequest.builder()
				.revId(savedResvId)
				.approvedEmpId(savedApproverEmpId)
				.build());

		assertThat(resvMapper.selectNoShowTargets())
				.extracting("revId")
				.contains(savedResvId);
	}

	@Test
	@DisplayName("알림 발송 완료 처리 (중복 발송 방지 플래그 세팅)")
	void testUpdateAlertSent() {
		// 노쇼 대상 조건 재현
		LocalDateTime pastStart = LocalDateTime.now().minusHours(3).withSecond(0).withNano(0);
		LocalDateTime pastEnd = LocalDateTime.now().minusHours(1).withSecond(0).withNano(0);
		resvMapper.update(ResvRequest.builder()
				.revId(savedResvId)
				.startDt(pastStart)
				.endDt(pastEnd)
				.build());
		resvMapper.updateApprove(ResvRequest.builder()
				.revId(savedResvId)
				.approvedEmpId(savedApproverEmpId)
				.build());

		assertThat(resvMapper.selectNoShowTargets())
				.extracting("revId")
				.contains(savedResvId);

		int updated = resvMapper.updateAlertSent(savedResvId, null);
		assertThat(updated).isEqualTo(1);

		// noshow_alert_at이 세팅되면 알림 대상 조회에서 제외되어야 한다
		assertThat(resvMapper.selectNoShowTargets())
				.extracting("revId")
				.doesNotContain(savedResvId);
	}

}