package com.sb.erp.eval.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.eval.dto.request.EvalRequest;
import com.sb.erp.eval.dto.request.PeriodSearchRequest;
import com.sb.erp.eval.dto.response.EvalResponse;
import com.sb.erp.eval.dto.response.PeriodResponse;
import com.sb.erp.eval.service.EvalPeriodService;
import com.sb.erp.eval.service.EvalService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "평가 상세", description = "평가 작성 / 제출 / 조회")
@RestController
@RequestMapping("/api/eval")
@RequiredArgsConstructor
public class EvalController {

	private final EvalService evalService;
	private final EvalPeriodService evalPeriodService;
	private final AuthUserJwtService authUserJwtService;

	// 관리자 판별: getCurrentRoles()에 ROLE_ADMIN 또는 ROOT가 있는지 확인
	private boolean isAdmin(Authentication auth) {
		List<String> roles = authUserJwtService.getCurrentRoles(auth);
		return roles != null && (roles.contains("ROLE_ADMIN") || roles.contains("ROOT"));
	}


	// ─── 평가 대시보드 데이터 ─────────────────────────
	@Operation(summary = "평가 대시보드",
		description = "periodId 미지정 시 OPEN 회차 목록만 반환. 지정 시 해당 회차의 평가 대상 + 진행률.")
	@GetMapping("/dashboard")
	public ResponseEntity<Map<String, Object>> dashboard(
			Authentication auth,
			@RequestParam(name="periodId", required = false) Long periodId) {

		Long comId = authUserJwtService.getCurrentComId(auth);
		Long empId = authUserJwtService.getCurrentEmpId(auth);

		if (periodId == null) {
			PeriodSearchRequest search = new PeriodSearchRequest();
			search.setPeriodStatus("OPEN");
			List<PeriodResponse> openPeriods = evalPeriodService.search(search, comId);

			return ResponseEntity.ok(Map.of("openPeriods", openPeriods));
		}

		PeriodResponse period = evalPeriodService.selectByPeriodId(periodId, comId);
		if (period == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
					.body(Map.of("message", "존재하지 않는 회차입니다."));
		}

		List<EvalResponse> targets = evalService.selectTargetsByEvaluator(periodId, empId);
		int submittedCount = evalService.countSubmittedByEvaluator(periodId, empId);

		Map<String, Object> body = new HashMap<>();
		body.put("period", period);
		body.put("targets", targets);
		body.put("submittedCount", submittedCount);
		body.put("totalCount", targets.size());
		return ResponseEntity.ok(body);
	}


	// ─── 평가 단건 조회 ─────────────────────────────
	@Operation(summary = "평가 상세 조회", description = "평가자 본인 또는 관리자만 조회 가능")
	@GetMapping("/{evalId}")
	public ResponseEntity<?> detail(
			Authentication auth,
			@PathVariable("evalId") long evalId) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		EvalResponse eval = evalService.selectByEvalId(evalId, comId);
		if (eval == null) return ResponseEntity.notFound().build();

		Long loginEmpId = authUserJwtService.getCurrentEmpId(auth);
		if (!Objects.equals(eval.getEvaluatorId(), loginEmpId) && !isAdmin(auth)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "본인이 작성한 평가만 조회할 수 있습니다."));
		}

		return ResponseEntity.ok(eval);
	}


	// ─── 임시 저장 ────────────────────────────────
	@Operation(summary = "평가 임시 저장", description = "일부 점수만 채워도 저장 가능")
	@PostMapping("/draft")
	public ResponseEntity<Map<String, String>> saveDraft(
			Authentication auth,
			@RequestBody EvalRequest request) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		Long empId = authUserJwtService.getCurrentEmpId(auth);
		int result = evalService.saveDraft(request, empId, comId);
		return buildResultResponse(result, "임시 저장했습니다.");
	}


	// ─── 최종 제출 ────────────────────────────────
	@Operation(summary = "평가 최종 제출", description = "모든 점수 + 코멘트 필수")
	@PostMapping("/submit")
	public ResponseEntity<Map<String, String>> submit(
			Authentication auth,
			@jakarta.validation.Valid @RequestBody EvalRequest request) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		Long empId = authUserJwtService.getCurrentEmpId(auth);
		int result = evalService.submit(request, empId, comId);
		return buildResultResponse(result, "평가를 제출했습니다.");
	}


	// ─── 결과 코드 → HTTP 응답 매핑 ────────────────
	// Service의 int 반환 규약:
	//  1: 성공, -1: 회차 없음, -2: OPEN 아님, -3: 평가자 아님, -4: 필수 누락
	private ResponseEntity<Map<String, String>> buildResultResponse(int result, String successMsg) {
		switch (result) {
			case 1:
				return ResponseEntity.ok(Map.of("message", successMsg));
			case -1:
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body(Map.of("message", "존재하지 않는 회차입니다."));
			case -2:
				return ResponseEntity.status(HttpStatus.CONFLICT)
						.body(Map.of("message", "진행 중인 회차만 평가할 수 있습니다."));
			case -3:
				return ResponseEntity.status(HttpStatus.FORBIDDEN)
						.body(Map.of("message", "평가 대상이 잘못되었습니다."));
			case -4:
				return ResponseEntity.badRequest()
						.body(Map.of("message", "제출하려면 모든 점수와 코멘트를 입력해야 합니다."));
			default:
				return ResponseEntity.internalServerError()
						.body(Map.of("message", "처리 중 오류가 발생했습니다."));
		}
	}
}
