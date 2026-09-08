package com.sb.erp.dept.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.nio.file.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.dept.dto.request.DeptTransferExecuteFormRequest;
import com.sb.erp.dept.dto.request.DeptTransferLogSearchRequest;
import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.dto.response.DeptTransferImpactResponse;
import com.sb.erp.dept.dto.response.DeptTransferLogResponse;
import com.sb.erp.dept.dto.response.PendingDeptResponse;
import com.sb.erp.dept.service.DeptService;
import com.sb.erp.dept.service.DeptTransferService;
import com.sb.erp.global.exception.DeptTransferException;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Department Transfer REST API", description = "부서 이관 관리 REST API")
@RestController
@RequestMapping("/api/dept/transfer")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class DeptTransferController {
	
	private final DeptTransferService service;
	private final DeptService deptService;
	private final AuthUserJwtService authUserJwtService;
	
	// 부서 해체(이관) 영향도 조회 GET /api/dept/transfer/impact?deptId=
	// 이관 대상 사원, 미처리 예약/결재, 이관 후보 부서, AI 추천까지 한 번에 반환
	@Operation(summary = "부서 이관 영향도 조회", description = "부서 삭제(해체) 시 이관해야 할 사원과 업무 영향도, 이관 후보 부서, AI 추천을 조회합니다.")
	@GetMapping("/impact")
	public ResponseEntity<?> getImpact(
			@Parameter(description = "이관 대상 부서 ID", example = "5", required = true) @RequestParam("deptId") long deptId,
			@Parameter(hidden = true) Authentication authentication) {

		long comId = authUserJwtService.getCurrentComId(authentication);
		try {
			DeptTransferImpactResponse impact = service.getImpact(comId, deptId);
			return ResponseEntity.ok(impact);
		} catch (AccessDeniedException e) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
		} catch (IllegalAccessException e) {
			return ResponseEntity.internalServerError().body(Map.of("message", "영향도 조회 중 오류가 발생했습니다."));
		}
	}
	
	// 이관 취소 POST /api/dept/transfer/{deptId}/cancel - 부서를 다시 ACTIVE 상태로 되돌림
	@Operation(summary = "부서 이관 취소", description = "이관 대기(PENDING_DELETE) 상태의 부서를 다시 활성(ACTIVE) 상태로 되돌립니다.")
	@PostMapping("/{deptId}/cancel")
	public ResponseEntity<Map<String, Object>> cancel(
			@Parameter(description = "취소할 부서 ID", example = "5", required = true) @PathVariable("deptId") long deptId,
			@Parameter(hidden = true) Authentication authentication) {

		long comId = authUserJwtService.getCurrentComId(authentication);
		Map<String, Object> result = new HashMap<>();
		try {
			int updated = service.cancelTransfer(comId, deptId);
			if (updated > 0) {
				result.put("success", true);
				result.put("message", "부서 삭제를 취소했습니다.");
				return ResponseEntity.ok(result);
			}
			result.put("success", false);
			result.put("message", "부서 이관 취소에 실패했습니다.");
			return ResponseEntity.internalServerError().body(result);
		} catch (AccessDeniedException e) {
			result.put("success", false);
			result.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
		} catch (IllegalAccessException e) {
			result.put("success", false);
			result.put("message", "이관 취소 중 오류가 발생했습니다.");
			return ResponseEntity.internalServerError().body(result);
		}
	}
	
	// 이관 최종 실행 POST /api/dept/transfer/execute (단일 트랜잭션, 실패 시 전체 롤백)
	// comId/empId는 화면 입력값을 신뢰하지 않고 로그인 사용자 기준으로 강제 세팅
	@Operation(summary = "부서 이관 최종 실행", description = "선택된 사원들을 각각 지정된 부서로 이관합니다. 이관 완료 후 남은 사원이 없으면 부서가 최종 삭제 처리됩니다.")
	@PostMapping("/execute")
	public ResponseEntity<Map<String, Object>> execute(@Valid @RequestBody DeptTransferExecuteFormRequest form,
			@Parameter(hidden = true) Authentication authentication) {

		long comId = authUserJwtService.getCurrentComId(authentication);
		long empId = authUserJwtService.getCurrentEmpId(authentication);
		form.setComId(comId);

		Map<String, Object> result = new HashMap<>();
		try {
			service.executeTransfer(form, empId);
			result.put("success", true);
			result.put("message", "사원 이관이 완료되었습니다.");
			return ResponseEntity.ok(result);
		} catch (AccessDeniedException e) {
			result.put("success", false);
			result.put("message", e.getMessage());
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
		} catch (DeptTransferException e) {
			// 실패 원인을 사용자에게 그대로 전달 (전체 롤백은 서비스의 @Transactional 이 보장)
			result.put("success", false);
			result.put("reason", e.getErrorCode());
			result.put("message", e.getMessage());
			return ResponseEntity.badRequest().body(result);
		} catch (IllegalAccessException e) {
			result.put("success", false);
			result.put("message", "이관 처리 중 오류가 발생했습니다.");
			return ResponseEntity.internalServerError().body(result);
		}
	}

	// 이관 대기(PENDING_DELETE) 부서 목록 조회 GET /api/dept/transfer/pending?keyword=
	// 이관 도중 다른 화면으로 이동했다가도, 어떤 부서가 이관 대기중인지 찾아 재진입할 수 있는 진입점
	@Operation(summary = "이관 대기 부서 목록 조회", description = "이관 대기(PENDING_DELETE) 상태인 부서 목록을 조회합니다.")
	@GetMapping("/pending")
	public ResponseEntity<List<PendingDeptResponse>> pendingList(
			@Parameter(description = "검색 키워드 (부서명, 부서코드)") @RequestParam(name = "keyword", required = false) String keyword,
			@Parameter(hidden = true) Authentication authentication) {

		long comId = authUserJwtService.getCurrentComId(authentication);
		return ResponseEntity.ok(service.getPendingTransferDepts(comId, keyword));
	}
	
	// 부서 이관 이력 조회 GET /api/dept/transfer/log
	// 원부서/대상부서/AI제안여부/기간 필터 - 기본 조회기간은 최근 30일 ~ 오늘
	@Operation(summary = "부서 이관 이력 조회", description = "부서 이관 처리 이력을 필터/페이징하여 조회합니다. 부서 선택 필터용 목록도 함께 반환합니다.")
	@GetMapping("/log")
	public ResponseEntity<Map<String, Object>> transferLog(
			@ParameterObject @ModelAttribute DeptTransferLogSearchRequest search,
			@Parameter(hidden = true) Authentication authentication) {
 
		long comId = authUserJwtService.getCurrentComId(authentication);
 
		if (search.getDateFrom() == null || search.getDateFrom().isBlank()) {
			search.setDateFrom(java.time.LocalDate.now().minusDays(30).toString());
		}
		if (search.getDateTo() == null || search.getDateTo().isBlank()) {
			search.setDateTo(java.time.LocalDate.now().toString());
		}
 
		int listTotal = service.listTotal(comId, search);
		List<DeptTransferLogResponse> logs = service.searchTransferLogs(comId, search);
		// 이관 이력 화면의 원부서/대상부서 필터 셀렉트박스용
		List<DeptResponse> deptOptions = deptService.getAllDeptsByComId(comId);
 
		Map<String, Object> response = new HashMap<>();
		response.put("total", listTotal);
		response.put("logs", logs);
		response.put("deptOptions", deptOptions);
		return ResponseEntity.ok(response);
	}
}
