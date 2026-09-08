package com.sb.erp.eval.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.eval.dto.ReportProgressDto;
import com.sb.erp.eval.dto.request.PeriodRequest;
import com.sb.erp.eval.dto.request.PeriodSearchRequest;
import com.sb.erp.eval.dto.response.PeriodResponse;
import com.sb.erp.eval.service.EvalPeriodService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/eval-period")
@RequiredArgsConstructor
@Tag(name = "평가 회차", description = "회차 CRUD, 상태 전환, 진행률 조회 API")
public class EvalPeriodController {

	private final EvalPeriodService evalPeriodService;
	private final AuthUserJwtService authUserJwtService;


	// ─── 목록 조회 (필터) ─────────────────────────
	@Operation(summary = "회차 목록 조회")
	@GetMapping
	public ResponseEntity<Map<String, Object>> list(
			Authentication auth,
			PeriodSearchRequest search) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		List<PeriodResponse> list = evalPeriodService.search(search, comId);
		Map<String, Integer> stats = evalPeriodService.countByStatusAll(comId);
		return ResponseEntity.ok(Map.of(
				"periodList", list,
				"stats", stats
		));
	}


	// ─── 상세 조회 ───────────────────────────────
	@Operation(summary = "회차 상세 조회")
	@GetMapping("/{periodId}")
	public ResponseEntity<?> detail(
			Authentication auth,
			@PathVariable("periodId") long periodId) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		PeriodResponse period = evalPeriodService.selectByPeriodId(periodId, comId);
		if (period == null) return ResponseEntity.notFound().build();

		int evalCount = evalPeriodService.countEvalsByPeriodId(periodId);
		int reportCount = evalPeriodService.countReportsByPeriodId(periodId);

		return ResponseEntity.ok(Map.of(
				"period", period,
				"evalCount", evalCount,
				"reportCount", reportCount
		));
	}


	// ─── 등록 ────────────────────────────────────
	@Operation(summary = "회차 등록")
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping
	public ResponseEntity<?> add(
			Authentication auth,
			@jakarta.validation.Valid @RequestBody PeriodRequest request) {

		Long comId = authUserJwtService.getCurrentComId(auth);

		if (evalPeriodService.isDuplicate(request.getEvalYear(), request.getEvalTerm(), comId)) {
			return ResponseEntity.status(HttpStatus.CONFLICT)
					.body(Map.of("message", "이미 등록된 회차입니다."));
		}

		int result = evalPeriodService.insert(request, comId);
		if (result > 0) {
			PeriodResponse saved = evalPeriodService.selectByPeriodId(request.getPeriodId(), comId);
			return ResponseEntity.status(HttpStatus.CREATED).body(saved);
		}
		return ResponseEntity.badRequest()
				.body(Map.of("message", "회차 등록에 실패했습니다."));
	}


	// ─── 수정 ────────────────────────────────────
	@Operation(summary = "회차 수정")
	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{periodId}")
	public ResponseEntity<?> edit(
			Authentication auth,
			@PathVariable("periodId") long periodId,
			@jakarta.validation.Valid @RequestBody PeriodRequest request) {

		Long comId = authUserJwtService.getCurrentComId(auth);

		PeriodResponse current = evalPeriodService.selectByPeriodId(periodId, comId);
		if (current == null) return ResponseEntity.notFound().build();

		request.setPeriodId(periodId);
		// 연도/학기는 등록 시 확정 → 수정 시 원본값 유지 (중복 검사 우회 방지)
		request.setEvalYear(current.getEvalYear());
		request.setEvalTerm(current.getEvalTerm());

		int result = evalPeriodService.update(request, comId);
		if (result > 0) {
			PeriodResponse updated = evalPeriodService.selectByPeriodId(periodId, comId);
			return ResponseEntity.ok(updated);
		}
		return ResponseEntity.badRequest()
				.body(Map.of("message", "회차 수정에 실패했습니다."));
	}


	// ─── 상태 전환 ───────────────────────────────
	@Operation(summary = "회차 열기 (READY -> OPEN)")
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/{periodId}/open")
	public ResponseEntity<Map<String, String>> open(
			Authentication auth,
			@PathVariable("periodId") long periodId) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		int result = evalPeriodService.openPeriod(periodId, comId);
		if (result == -1) return ResponseEntity.notFound().build();
		if (result == -2) return ResponseEntity.badRequest().body(Map.of("message", "READY 상태의 회차만 열 수 있습니다."));
		return ResponseEntity.ok(Map.of("message", "회차를 열었습니다."));
	}

	@Operation(summary = "회차 마감 (OPEN -> CLOSED)")
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/{periodId}/close")
	public ResponseEntity<Map<String, String>> close(
			Authentication auth,
			@PathVariable("periodId") long periodId) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		int result = evalPeriodService.closePeriod(periodId, comId);
		if (result == -1) return ResponseEntity.notFound().build();
		if (result == -2) return ResponseEntity.badRequest().body(Map.of("message", "OPEN 상태의 회차만 마감할 수 있습니다."));
		if (result == -3) return ResponseEntity.badRequest().body(Map.of("message", "미제출 평가가 있어 마감할 수 없습니다."));
		return ResponseEntity.ok(Map.of("message", "회차를 마감했습니다."));
	}

	@Operation(summary = "AI 분석 시작 (CLOSED -> REPORTING)")
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/{periodId}/report")
	public ResponseEntity<Map<String, String>> report(
			Authentication auth,
			@PathVariable("periodId") long periodId) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		int result = evalPeriodService.reportPeriod(periodId, comId);
		if (result == -1) return ResponseEntity.notFound().build();
		if (result == -2) return ResponseEntity.badRequest().body(Map.of("message", "현재 상태에서는 AI 분석을 시작할 수 없습니다."));
		return ResponseEntity.ok(Map.of("message", "AI 분석을 시작합니다."));
	}


	// ─── 리포트 진행률 (폴링용) ───────────────────
	@Operation(summary = "리포트 생성 진행률 조회")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/{periodId}/status")
	public ResponseEntity<ReportProgressDto> getReportProgress(
			Authentication auth,
			@PathVariable("periodId") long periodId) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		PeriodResponse period = evalPeriodService.selectByPeriodId(periodId, comId);
		if (period == null) {
			return ResponseEntity.ok(new ReportProgressDto("NOT_FOUND", 0, 0));
		}

		int completed = evalPeriodService.countReportsByPeriodId(periodId);
		int total = evalPeriodService.countDistinctTargetsByPeriodId(periodId);

		return ResponseEntity.ok(new ReportProgressDto(period.getPeriodStatus(), completed, total));
	}


	// ─── 중복 확인 ───────────────────────────────
	@Operation(summary = "회차 중복 확인")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/check-duplicate")
	public ResponseEntity<Map<String, Boolean>> checkDuplicate(
			Authentication auth,
			@RequestParam("evalYear") int evalYear,
			@RequestParam("evalTerm") String evalTerm) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		return ResponseEntity.ok(
				Map.of("duplicate", evalPeriodService.isDuplicate(evalYear, evalTerm, comId)));
	}
}
