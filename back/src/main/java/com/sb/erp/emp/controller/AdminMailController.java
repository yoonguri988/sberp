package com.sb.erp.emp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.emp.service.MailSchedulerService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

// 관리자 수동 이메일 배치 트리거. 새벽 스케줄러 실패 시 관리자가 수동으로 재실행할 수 있게 열어둠

@RestController
@RequestMapping("/api/admin/mail")
@RequiredArgsConstructor
@Tag(name = "관리자 이메일 배치", description = "메일 스케줄러 수동 트리거 API (ROOT/ADMIN 전용)")
public class AdminMailController {

    private final MailSchedulerService mailSchedulerService;

    @Operation(summary = "3일차 안부 메일 수동 발송", description = "평일 09:00 스케줄러 실패 시 수동 재실행. 결과는 email_send_log 테이블에서 확인")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/trigger-followup-3day")
    public ResponseEntity<String> triggerFollowup3Day() {
        mailSchedulerService.triggerFollowup3Day();
        return ResponseEntity.ok("3일 차 안부 메일 배치를 수동 실행했습니다.");
    }

    @Operation(summary = "환영 메일 안전망 수동 발송", description = "afterCommit 실패로 누락된 환영 메일 복구. 최근 7일 내 미발송자 대상")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/trigger-welcome-orphans")
    public ResponseEntity<String> triggerWelcomeOrphans() {
        mailSchedulerService.triggerWelcomeOrphans();
        return ResponseEntity.ok("환영 메일 안전망 배치를 수동 실행했습니다.");
    }
}
