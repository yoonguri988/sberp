package com.sb.erp.dept.controller;

import java.util.List;
import java.util.Map;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.dept.dto.request.DeptRequest;
import com.sb.erp.dept.dto.request.DeptSearchRequest;
import com.sb.erp.dept.dto.response.DeptDetailResponse;
import com.sb.erp.dept.dto.response.DeptListResponse;
import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.service.DeptService;
import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.emp.service.EmpService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Department REST API", description = "부서 관리 REST API")
@RestController
@RequestMapping("/api/dept")
@RequiredArgsConstructor
public class DeptController {

	private final DeptService service;
	private final EmpService empService;
	private final AuthUserJwtService authUserJwtService;
	
	@SuppressWarnings("unchecked")
	private List<String> ancestorChainOf(long deptId) {
		return (List<String>) service.getAncestorChain(deptId);
	}
 
	@SuppressWarnings("unchecked")
	private List<DeptResponse> flattenOf(long comId) {
		return (List<DeptResponse>) service.flattenOrgTree(comId);
	}
	
	// 부서 목록(조직도) 조회 GET /api/dept?comId=
	// comId 미지정 또는 관리자가 아니면 로그인한 사용자의 소속 회사로 제한 (구버전 /dept/list 로직 이식)
	@Operation(summary = "부서 조직도 조회", description = "회사 ID로 부서 조직도(트리) + 부서 통계를 조회합니다. "
			+ "comId를 생략하면 로그인한 사용자의 소속 회사를 조회하며, ROOT가 아니면 다른 회사의 comId를 지정할 수 없습니다.")
	@GetMapping
	public ResponseEntity<?> list(
			@Parameter(description = "조회할 회사 ID (생략 시 로그인한 사용자의 소속 회사, ROOT만 다른 회사 지정 가능)", example = "1")
			@RequestParam(value = "comId", required = false) Long comId,
			@Parameter(hidden = true) Authentication authentication) {
 
		if (comId == null) {
			comId = authUserJwtService.getCurrentComId(authentication);
		} else if (authUserJwtService.isForbiddenCompanyAccess(authentication, comId)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "본인 소속 회사만 조회할 수 있습니다."));
		}
 
		DeptListResponse response = DeptListResponse.builder()
				.comId(comId)
				.stats(service.selectStats(comId))
				.items(service.selectOrgTree(comId))
				.build();
 
		return ResponseEntity.ok(response);
	}

	// 부서 목록(평탄화) 조회 GET /api/dept/flat?comId=
	// 트리 구조가 아니라 depth 정보만 포함된 1차원 리스트 - 셀렉트박스 등에서 사용
	@Operation(summary = "부서 목록 평탄화 조회", description = "조직도를 depth 정보가 포함된 1차원 리스트로 조회합니다. (드롭다운/셀렉트박스용)")
	@GetMapping("/flat")
	public ResponseEntity<?> flat(
			@Parameter(description = "조회할 회사 ID", example = "1", required = true)
			@RequestParam("comId") long comId,
			@Parameter(hidden = true) Authentication authentication) {
 
		if (authUserJwtService.isForbiddenCompanyAccess(authentication, comId)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "본인 소속 회사만 조회할 수 있습니다."));
		}
 
		return ResponseEntity.ok(flattenOf(comId));
	}

	// 부서 등록 기능 POST /api/dept
	// comId는 ROOT만 임의 지정 가능, 그 외(ADMIN)는 본인 소속 회사로 강제 세팅
	// DeptServiceImpl.insert() 에서 상위부서(parentId)가 다른 회사 소속이면 IllegalArgumentException
	@Operation(summary = "부서 등록", description = "새로운 부서를 등록합니다. 상위부서(parentId) 기준으로 depth/정렬순서가 자동 계산됩니다. ADMIN 또는 ROOT 권한이 필요합니다.")
	@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
	@PostMapping
	public ResponseEntity<?> add(
			@Valid @RequestBody DeptRequest dto,
			@Parameter(hidden = true) Authentication authentication) {
 
		if (!authUserJwtService.isRoot(authentication)) {
			dto.setComId(authUserJwtService.getCurrentComId(authentication));
		}
 
		try {
			int result = service.insert(dto);
			if (result > 0) {
				return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "부서 등록에 성공하였습니다."));
			}
			return ResponseEntity.badRequest().body(Map.of("message", "부서 등록에 실패하였습니다."));
		} catch (IllegalArgumentException e) {
			// 존재하지 않는 상위부서, 다른 회사 소속 상위부서 지정 등
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	// 부서 상세 조회 GET /api/dept/{deptId}
	// 계층 경로(ancestorChain) 함께 반환 - 구버전 상세화면의 breadcrumb 용도
	@Operation(summary = "부서 상세 조회", description = "부서 ID로 부서 정보 + 상위 계층 경로(breadcrumb)를 조회합니다.")
	@GetMapping("/{deptId}")
	public ResponseEntity<?> detail(
			@Parameter(description = "조회할 부서 ID", example = "1", required = true) @PathVariable("deptId") long deptId,
			@Parameter(hidden = true) Authentication authentication) {

		DeptResponse dept = service.selectOneById(deptId);
		if (dept == null) {
			return ResponseEntity.notFound().build();
		}
		if (authUserJwtService.isForbiddenCompanyAccess(authentication, dept.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "본인 소속 회사의 부서만 조회할 수 있습니다."));
		}

		DeptDetailResponse response = DeptDetailResponse.builder().dept(dept).ancestorChain(ancestorChainOf(deptId))
				.build();

		return ResponseEntity.ok(response);
	}
	
	// 내 부서 상세 조회 GET /api/dept/my
	// JWT 클레임엔 deptId가 없어서(empId, comId, empEmail, roles 뿐) empId 기준으로 소속 부서를 조회
	// (DeptMapper.selectByEmpId 신규 추가: employee.dept_id 조인)
	@Operation(summary = "내 부서 상세 조회", description = "로그인한 사용자가 소속된 부서 정보를 조회합니다.")
	@GetMapping("/my")
	public ResponseEntity<?> myDept(@Parameter(hidden = true) Authentication authentication) {
 
		Long empId = authUserJwtService.getCurrentEmpId(authentication);
		DeptResponse dept = service.selectByEmpId(empId);
		if (dept == null) {
			return ResponseEntity.notFound().build();
		}
 
		DeptDetailResponse response = DeptDetailResponse.builder()
				.dept(dept)
				.ancestorChain(ancestorChainOf(dept.getDeptId()))
				.build();
 
		return ResponseEntity.ok(response);
	}
	
	// 부서 수정 기능 PUT /api/dept/{deptId}
	@Operation(summary = "부서 수정", description = "부서 정보를 수정합니다. 상위부서 변경 시 순환참조(하위 부서로 이동) 및 타사 부서 이동 여부를 검증합니다. ADMIN 또는 ROOT 권한이 필요합니다.")
	@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
	@PutMapping("/{deptId}")
	public ResponseEntity<?> update(
			@Parameter(description = "수정할 부서 ID", example = "1", required = true) @PathVariable("deptId") long deptId,
			@Valid @RequestBody DeptRequest dto, @Parameter(hidden = true) Authentication authentication) {

		DeptResponse existing = service.selectOneById(deptId);
		if (existing == null) {
			return ResponseEntity.notFound().build();
		}
		if (authUserJwtService.isForbiddenCompanyAccess(authentication, existing.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "본인 소속 회사의 부서만 수정할 수 있습니다."));
		}

		dto.setDeptId(deptId);
		try {
			int result = service.update(dto);
			if (result > 0) {
				return ResponseEntity.ok(Map.of("message", "부서 수정에 성공하였습니다."));
			}
			return ResponseEntity.badRequest().body(Map.of("message", "부서 수정에 실패하였습니다."));
		} catch (IllegalArgumentException e) {
			// 순환참조(하위 부서로 이동 시도), 다른 회사 부서로 이동 시도 등 검증 실패
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}
		
	// 부서 삭제 기능 DELETE /api/dept/{deptId}
	// 소속 사원이 0명이면 완전 삭제, 있으면 PENDING_DELETE 로 전환(이관 대기)
	@Operation(summary = "부서 삭제", description = "부서를 삭제합니다. 소속 사원이 0명이면 완전 삭제되고, 있으면 삭제 대신 이관 대기 상태로 전환됩니다. ADMIN 또는 ROOT 권한이 필요합니다.")
	@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
	@DeleteMapping("/{deptId}")
	public ResponseEntity<?> delete(
			@Parameter(description = "삭제할 부서 ID", example = "1", required = true) @PathVariable("deptId") long deptId,
			@Parameter(hidden = true) Authentication authentication) {

		DeptResponse existing = service.selectOneById(deptId);
		if (existing == null) {
			return ResponseEntity.notFound().build();
		}
		if (authUserJwtService.isForbiddenCompanyAccess(authentication, existing.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "본인 소속 회사의 부서만 삭제할 수 있습니다."));
		}

		long empCount = service.countEmployees(deptId);

		if (empCount == 0) {
			try {
				service.delete(deptId);
				return ResponseEntity.ok(Map.of("message", "부서 삭제에 성공하였습니다."));
			} catch (IllegalStateException e) {
				// 하위 부서 존재 등 삭제 불가 사유
				return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
			}
		}

		service.softDelete(deptId);
		return ResponseEntity
				.ok(Map.of("message", "사원이 존재해 삭제 대신 이관 대기 상태로 전환되었습니다.", "pendingTransfer", true, "deptId", deptId));
	}

	// 부서 코드 중복 체크 GET /api/dept/check-deptcode
	// comId는 클라이언트 값을 신뢰하지 않고 로그인 사용자 기준으로 강제 세팅
	@Operation(summary = "부서코드 중복확인", description = "부서 코드 중복 여부를 확인합니다.")
	@GetMapping("/check-deptcode")
	public ResponseEntity<Map<String, Object>> checkDeptCode(@ParameterObject @ModelAttribute DeptSearchRequest search,
			@Parameter(hidden = true) Authentication authentication) {

		search.setComId(authUserJwtService.getCurrentComId(authentication));
		boolean duplicate = service.isDuplicateDeptCode(search) != null;
		return ResponseEntity.ok(Map.of("duplicate", duplicate));
	}

	// 상위 계층 부서 목록 GET /api/dept/{deptId}/ancestors
	// KJY 조직도 범위 제한 - 특정 부서 기준 상위 조상 부서들만 반환 (셀렉트박스 범위 제한용)
	@Operation(summary = "상위 계층 부서 목록", description = "특정 부서 기준 상위 계층(조상) 부서 목록을 조회합니다. (조직도 범위 제한용 셀렉트박스에서 사용)")
	@GetMapping("/{deptId}/ancestors")
	public ResponseEntity<?> ancestors(
			@Parameter(description = "기준 부서 ID", example = "5", required = true)
			@PathVariable("deptId") long deptId,
			@Parameter(hidden = true) Authentication authentication) {
 
		DeptResponse dept = service.selectOneById(deptId);
		if (dept == null) {
			return ResponseEntity.notFound().build();
		}
		if (authUserJwtService.isForbiddenCompanyAccess(authentication, dept.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "본인 소속 회사의 부서만 조회할 수 있습니다."));
		}
 
		return ResponseEntity.ok(service.selectAncestorDepts(deptId));
	}
	
	@Operation(summary = "부서 소속 사원 목록 조회", description = "해당 부서 및 하위 부서 소속 사원 목록을 조회합니다.")
	@GetMapping("/{deptId}/emp")
	public ResponseEntity<?> deptEmpList(
	        @PathVariable("deptId") long deptId,
	        @Parameter(hidden = true) Authentication authentication) {

	    DeptResponse dept = service.selectOneById(deptId);
	    if (dept == null) return ResponseEntity.notFound().build();
	    if (authUserJwtService.isForbiddenCompanyAccess(authentication, dept.getComId())) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "본인 소속 회사의 부서만 조회할 수 있습니다."));
	    }

	    return ResponseEntity.ok(Map.of("list", empService.selectByDeptId(deptId)));
	}
}