package com.sb.erp.sal.controller;

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
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.global.security.ActorContext;
import com.sb.erp.sal.dto.request.SalaryAccountCreateRequest;
import com.sb.erp.sal.dto.request.SalaryAccountUpdateRequest;
import com.sb.erp.sal.dto.response.SalaryAccountResponse;
import com.sb.erp.sal.service.SalaryAccountService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 급여 수령 계좌 관리.
 * emp 모듈(Employee)에는 계좌 컬럼이 없고 손댈 수 없으므로, sal 모듈 전용 테이블(sal_acct)로 별도 관리한다.
 * 급여 지급(SalPay) 등록 시점에 이 계좌 정보를 스냅샷으로 남긴다.
 */
@Tag(name = "Salary Account REST API", description = "직원 급여 수령 계좌(은행/계좌번호/예금주) 등록·조회·수정 API")
@RestController
@RequestMapping("/api/salacct")
@RequiredArgsConstructor
public class SalaryAccountController {

    private final SalaryAccountService salaryAccountService;
    private final AuthUserJwtService authUserJwtService;

    /** 급여 수령 계좌 등록 (직원당 1건) */
    @Operation(summary = "급여 수령 계좌 등록")
    @PostMapping
    public ResponseEntity<SalaryAccountResponse> register(
    		@Valid @RequestBody SalaryAccountCreateRequest request,
    		@Parameter(hidden = true) Authentication authentication) {
    	// 로그인한 본인만이 자신의 급여 수령 계좌를 등록할 수 있다.
    	Long empId = authUserJwtService.getCurrentEmpId(authentication);
    	
        SalaryAccountResponse response = salaryAccountService.register(empId, request, actor(authentication));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** 특정 직원의 계좌 조회 (ADMIN, comId 스코프) */
    @Operation(summary = "직원 급여 수령 계좌 조회", description = "ROLE_ADMIN만 조회 가능")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/{empId}")
    public ResponseEntity<SalaryAccountResponse> findByEmpId(
    		@PathVariable("empId") Long empId, 
    		@Parameter(hidden = true) Authentication authentication) {
        return ResponseEntity.ok(salaryAccountService.findByEmpId(empId, actor(authentication)));
    }

    /** 본인 계좌 조회 */
    @Operation(summary = "본인 급여 수령 계좌 조회")
    @GetMapping("/me")
    public ResponseEntity<SalaryAccountResponse> findMyAccount(
    		@Parameter(hidden = true) Authentication authentication) {
        return ResponseEntity.ok(salaryAccountService.findMyAccount(authUserJwtService.getCurrentEmpId(authentication)));
    }
    
    /** 본인 급여 수령 계좌 수정 */
    @Operation(summary = "급여 수령 계좌 수정(본인)")
    @PutMapping("/me")
    public ResponseEntity<SalaryAccountResponse> updateMyAccount(
            @Valid @RequestBody SalaryAccountUpdateRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        ActorContext actor = actor(authentication);
        return ResponseEntity.ok(salaryAccountService.update(actor.empId(), request, actor));
    }

    /** 급여 수령 계좌 수정 */
    @Operation(summary = "급여 수령 계좌 수정")
    @PutMapping("/{empId}")
    public ResponseEntity<SalaryAccountResponse> updateByAdmin(
    		@PathVariable("empId") Long empId,
    		@Valid @RequestBody SalaryAccountUpdateRequest request,
    		@Parameter(hidden = true) Authentication authentication) {
        return ResponseEntity.ok(salaryAccountService.update(empId, request, actor(authentication)));
    }

    private ActorContext actor(Authentication authentication) {
        return new ActorContext(
                authUserJwtService.getCurrentEmpId(authentication),
                authUserJwtService.getCurrentComId(authentication),
                authUserJwtService.isRoot(authentication));
    }
}
