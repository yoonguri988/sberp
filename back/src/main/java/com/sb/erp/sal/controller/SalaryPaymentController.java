package com.sb.erp.sal.controller;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.global.security.ActorContext;
import com.sb.erp.sal.dto.request.SalaryPaymentCreateRequest;
import com.sb.erp.sal.dto.request.SalaryPaymentItemAdjustRequest;
import com.sb.erp.sal.dto.request.SalaryPaymentStatusChangeRequest;
import com.sb.erp.sal.dto.request.SalaryPaymentUpdateRequest;
import com.sb.erp.sal.dto.response.SalaryItemCodeResponse;
import com.sb.erp.sal.dto.response.SalaryPaymentResponse;
import com.sb.erp.sal.entity.type.PaymentStatus;
import com.sb.erp.sal.entity.type.SalaryItemCode;
import com.sb.erp.sal.service.SalaryPaymentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** 7. 급여 지급 관리 */
@Tag(name = "Salary Payment REST API", description = "급여 산정 등록/조회/수정/상태변경/삭제(취소) API")
@RestController
@RequestMapping("/api/salpay")
@RequiredArgsConstructor
public class SalaryPaymentController {

    private final SalaryPaymentService salaryPaymentService;
    private final AuthUserJwtService authUserJwtService;

    /** 7-1 급여등록(산정) */
    @Operation(summary = "급여 지급 내역 등록(산정)")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping
    public ResponseEntity<SalaryPaymentResponse> register(
    		@Valid @RequestBody SalaryPaymentCreateRequest request,
    		@Parameter(hidden = true) Authentication authentication) {
        SalaryPaymentResponse response = salaryPaymentService.register(request, actor(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** 7-2 급여조회(전체) - 직원명/부서/지급월/지급상태 필터, 페이지네이션. ROOT가 아니면 소속 회사로 스코프 제한 */
    @Operation(summary = "급여 지급 내역 전체 조회")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<Page<SalaryPaymentResponse>> findAll(
    		@Parameter(description = "사원 이름", example = "", required = false) @RequestParam(value="empName", required = false) String empName,
    		@Parameter(description = "부서명", example = "", required = false)  @RequestParam(value="department", required = false) String department,
    		@Parameter(description = "지급월", example = "", required = false)@RequestParam(value="paymentMonth", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate paymentMonth,
    		@Parameter(description = "지급상태필터", example = "", required = false) @RequestParam(value="status", required = false) PaymentStatus status,
            Authentication authentication,
            @ParameterObject Pageable pageable) {
        return ResponseEntity.ok(
                salaryPaymentService.findAll(empName, department, paymentMonth, status, actor(authentication), pageable));
    }

    /** 7-3 급여조회(본인) - 급여 명세서 */
    @Operation(summary = "본인 급여 명세서 조회")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<Page<SalaryPaymentResponse>> findMyPayments(
    		@Parameter(hidden = true) Authentication authentication, 
    		@ParameterObject Pageable pageable) {
        return ResponseEntity.ok(
                salaryPaymentService.findMyPayments(authUserJwtService.getCurrentEmpId(authentication), pageable));
    }

    /** 7-4 급여 재산정 (관리자가 항목 금액을 직접 입력하지 않는다 - 계산 엔진을 다시 호출해 최신 급여기준으로 재산정) */
    @Operation(summary = "급여 재산정 (대기 상태 건만 가능, SalaryCalculationService 재호출)")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{payId}")
    public ResponseEntity<SalaryPaymentResponse> update(
    		@PathVariable("payId") Long payId,
            @RequestBody(required = false) SalaryPaymentUpdateRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        SalaryPaymentResponse response = salaryPaymentService.update(payId, request, actor(authentication));
        return ResponseEntity.ok(response);
    }

    /** 7-4-1 급여 산정 결과 개별 항목 수동 조정 (급여 산정 엔진 도입, 2026-08-20) */
    @Operation(summary = "급여 산정 결과 개별 항목 수동 조정 (대기 상태 건만 가능, 사유 필수)")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping("/{payId}/items/{itemId}")
    public ResponseEntity<SalaryPaymentResponse> adjustItem(
    		@PathVariable("payId") Long payId,
            @PathVariable("itemId") Long itemId,
            @Valid @RequestBody SalaryPaymentItemAdjustRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        SalaryPaymentResponse response = salaryPaymentService.adjustItem(payId, itemId, request, actor(authentication));
        return ResponseEntity.ok(response);
    }

    /** 7-5 급여상태변경 */
    @Operation(summary = "급여 지급 상태 변경 (대기→승인→지급완료 또는 반려)")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PatchMapping("/{payId}/status")
    public ResponseEntity<SalaryPaymentResponse> changeStatus(
    		@PathVariable("payId") Long payId,
            @Valid @RequestBody SalaryPaymentStatusChangeRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        SalaryPaymentResponse response = salaryPaymentService.changeStatus(payId, request, actor(authentication));
        return ResponseEntity.ok(response);
    }

    /** 7-6 급여삭제(취소) */
    @Operation(summary = "급여 지급 내역 삭제(취소) (지급완료 건은 불가)")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{payId}")
    public ResponseEntity<Void> delete(
    		@PathVariable("payId") Long payId, 
    		@Parameter(hidden = true) Authentication authentication) {
        salaryPaymentService.delete(payId, actor(authentication));
        return ResponseEntity.noContent().build();
    }

    /**
     * 사전 정의된 수당/공제 항목 코드 전체 조회 (프론트엔드 드롭다운 구성용).
     * 로그인한 사용자라면 누구나 조회 가능 - 급여 등록 화면(ADMIN)뿐 아니라 급여 명세서 화면에서도 참고할 수 있다.
     */
    @Operation(summary = "급여 수당/공제 항목 코드 목록 조회")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/item-codes")
    public ResponseEntity<List<SalaryItemCodeResponse>> findItemCodes() {
        return ResponseEntity.ok(Arrays.stream(SalaryItemCode.values())
                .map(SalaryItemCodeResponse::from)
                .toList());
    }

    private ActorContext actor(Authentication authentication) {
        return new ActorContext(
                authUserJwtService.getCurrentEmpId(authentication),
                authUserJwtService.getCurrentComId(authentication),
                authUserJwtService.isRoot(authentication));
    }
}
