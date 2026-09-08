package com.sb.erp.emp.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.dto.request.EmpSearchRequest;
import com.sb.erp.emp.dto.request.PasswordChangeRequest;
import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.emp.service.EmpService;
import com.sb.erp.eval.dto.response.ReportResponse;
import com.sb.erp.eval.service.EvalReportService;
import com.sb.erp.util.dto.PagingUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/emp")
@RequiredArgsConstructor
@Tag(name = "사원 관리", description = "사원 CRUD, 비밀번호, 중복검사 API")
public class EmpController {

	private final EmpService empService;
	private final EvalReportService evalReportService;
	private final AuthUserJwtService authUserJwtService;

	// 관리자 판별: getCurrentRoles()에 ROLE_ADMIN 또는 ROOT가 있는지 확인
	private boolean isAdmin(Authentication auth) {
		List<String> roles = authUserJwtService.getCurrentRoles(auth);
		return roles != null && (roles.contains("ROLE_ADMIN") || roles.contains("ROOT"));
	}

	// ─── 목록 조회 (검색 + 페이징) ────────────────────────
	@Operation(summary = "사원 목록 조회", description = "검색 조건과 페이징을 적용한 사원 목록")
	@GetMapping
	public ResponseEntity<Map<String, Object>> list(
			Authentication auth,
			EmpSearchRequest search) {

		Long comId = authUserJwtService.getCurrentComId(auth);
		boolean isAdmin = isAdmin(auth);

		int currentPage = (search.getPage() == null || search.getPage() < 1)
				? 1 : search.getPage();

		int total = empService.selectCnt(search, comId);
		PagingUtil paging = new PagingUtil(total, currentPage);

		search.setPstartno(paging.getPstartno());
		search.setOnepagelist(paging.getOnepagelist());

		List<EmpResponse> list = empService.search(search, comId, isAdmin);

		return ResponseEntity.ok(Map.of(
				"list", list,
				"paging", paging
		));
	}


	// ─── 상세 조회 ────────────────────────────────────
	@Operation(summary = "사원 상세 조회")
	@GetMapping("/{empId}")
	public ResponseEntity<Map<String, Object>> detail(
			Authentication auth,
			@Parameter(description = "사원 ID") @PathVariable("empId") long empId) {

		Long comId = authUserJwtService.getCurrentComId(auth);
		Long loginEmpId = authUserJwtService.getCurrentEmpId(auth);
		boolean isAdmin = isAdmin(auth);

		// 본인 또는 관리자만 조회 가능
		if (empId != loginEmpId && !isAdmin) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "접근 권한이 없습니다."));
		}

		EmpResponse emp = empService.selectByEmpId(empId, comId);
		if (emp == null) {
			return ResponseEntity.notFound().build();
		}

		ReportResponse latestReport = evalReportService.selectLatestByEmpId(empId, comId);

		// HashMap 사용: null 허용 + 키 생략 가능
		// Map.of()는 null 값 → NPE, 빈 문자열 → 프론트에서 타입 혼동
		Map<String, Object> result = new HashMap<>();
		result.put("emp", emp);
		result.put("isAdmin", isAdmin);
		result.put("isSelf", empId == loginEmpId);
		if (latestReport != null) {
			result.put("latestReport", latestReport);
		}

		return ResponseEntity.ok(result);
	}


	// ─── 사원 등록 ────────────────────────────────────
	@Operation(summary = "사원 등록")
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping
	public ResponseEntity<?> add(
			Authentication auth,
			@jakarta.validation.Valid @RequestBody EmpRequest request) {

		Long comId = authUserJwtService.getCurrentComId(auth);
		int result = empService.insert(request, comId);

		if (result > 0) {
			EmpResponse saved = empService.selectByEmpId(request.getEmpId(), comId);
			return ResponseEntity.status(HttpStatus.CREATED).body(saved);
		}
		return ResponseEntity.badRequest()
				.body(Map.of("message", "등록에 실패했습니다."));
	}


	// ─── 사원 정보 수정 (관리자 전용) ───────────────────
	// 정책: 사원은 본인 정보를 직접 수정할 수 없다. 관리자에게 요청하여 수정한다.
	// 비밀번호 변경(editPassword)만 본인이 직접 수행한다.
	@Operation(summary = "사원 정보 수정 (관리자)")
	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{empId}")
	public ResponseEntity<?> edit(
			Authentication auth,
			@PathVariable("empId") long empId,
			@RequestBody EmpRequest request) {

		Long comId = authUserJwtService.getCurrentComId(auth);

		request.setEmpId(empId);

		empService.update(request, comId);
		EmpResponse updated = empService.selectByEmpId(empId, comId);
		return ResponseEntity.ok(updated);
	}


	// ─── 비밀번호 변경 (본인) ─────────────────────────
	@Operation(summary = "비밀번호 변경 (본인)")
	@PutMapping("/{empId}/password")
	public ResponseEntity<Map<String, String>> editPassword(
			Authentication auth,
			@PathVariable("empId") long empId,
			@RequestBody PasswordChangeRequest request) {

		Long comId = authUserJwtService.getCurrentComId(auth);
		Long loginEmpId = authUserJwtService.getCurrentEmpId(auth);

		if (empId != loginEmpId) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "본인만 변경할 수 있습니다."));
		}

		// 새 비밀번호 확인 불일치
		if (!request.getNewPass().equals(request.getCheckPass())) {
			return ResponseEntity.badRequest()
					.body(Map.of("message", "새 비밀번호가 일치하지 않습니다."));
		}

		int result = empService.changePassword(empId, request.getCurrentPass(), request.getNewPass(), comId);

		if (result == -1) {
			return ResponseEntity.notFound().build();
		}
		if (result == 0) {
			return ResponseEntity.badRequest()
					.body(Map.of("message", "현재 비밀번호가 일치하지 않습니다."));
		}
		return ResponseEntity.ok(Map.of("message", "비밀번호가 변경되었습니다."));
	}


	// ─── 비밀번호 초기화 (관리자) ─────────────────────
	@Operation(summary = "비밀번호 초기화 (관리자)")
	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{empId}/reset-password")
	public ResponseEntity<Map<String, String>> resetPassword(
			Authentication auth,
			@PathVariable("empId") long empId) {

		Long comId = authUserJwtService.getCurrentComId(auth);
		int result = empService.resetPassByEmpNo(empId, comId);
		if (result > 0) {
			return ResponseEntity.ok(Map.of("message", "비밀번호가 사번으로 초기화되었습니다."));
		}
		return ResponseEntity.notFound().build();
	}


	// ─── 중복 검사 ────────────────────────────────────
	// 이메일/연락처: 전역 유니크 → comId 불필요
	// 사번: 회사 내에서만 유니크 → comId 필요
	@Operation(summary = "이메일 중복 검사")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/check-email")
	public ResponseEntity<Map<String, Boolean>> checkEmail(
			@RequestParam("email") String empEmail) {
		return ResponseEntity.ok(
				Map.of("duplicate", empService.isEmailDuplicate(empEmail)));
	}

	@Operation(summary = "연락처 중복 검사")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/check-mobile")
	public ResponseEntity<Map<String, Boolean>> checkMobile(
			@RequestParam("mobile") String empMobile) {
		return ResponseEntity.ok(
				Map.of("duplicate", empService.isMobileDuplicate(empMobile)));
	}

	@Operation(summary = "사번 중복 검사")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/check-empno")
	public ResponseEntity<Map<String, Boolean>> checkEmpNo(
			Authentication auth,
			@RequestParam("empNo") String empNo) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		return ResponseEntity.ok(
				Map.of("duplicate", empService.isEmpNoDuplicate(empNo, comId)));
	}
}
