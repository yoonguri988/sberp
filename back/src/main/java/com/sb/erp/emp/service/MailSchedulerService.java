package com.sb.erp.emp.service;

import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.sb.erp.emp.dto.WelcomeMailTargetDto;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.repository.EmailSendLogMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailSchedulerService {

    private final EmailSendLogMapper logMapper;
    private final EmailService emailService;

    private final AtomicBoolean followup3DayRunning = new AtomicBoolean(false);
    private final AtomicBoolean welcomeOrphanRunning = new AtomicBoolean(false);


    // ─── 3일 차 안부 메일 (평일 오전 9시에만) ───
    @Scheduled(cron = "0 0 9 * * MON-FRI", zone = "Asia/Seoul")
    public void sendFollowup3DayEmails() {
        if (!followup3DayRunning.compareAndSet(false, true)) {
            log.info("[MailScheduler] 3일 메일 배치 이미 실행 중 - 스킵");
            return;
        }
        try {
            log.info("[MailScheduler] === 3일 차 안부 메일 배치 시작 ===");
            List<WelcomeMailTargetDto> targets = logMapper.selectFollowup3DayTargets();

            if (targets == null || targets.isEmpty()) {
                log.info("[MailScheduler] 3일 메일 대상자 없음");
                return;
            }

            log.info("[MailScheduler] 3일 메일 대상자 {}명", targets.size());
            for (WelcomeMailTargetDto target : targets) {
                // 개별 발송은 EmailService @Async로 위임 → 스레드 풀에서 병렬 처리
                emailService.sendFollowup3DayMailAsync(target);
            }

            log.info("[MailScheduler] === 3일 차 안부 메일 배치 종료 (예약 완료) ===");
        } finally {
            followup3DayRunning.set(false);
        }
    }


    // ─── 환영 메일 안전망 (매일 01:30) ───

    /**
     * afterCommit 콜백 실행 실패로 누락된 환영 메일을 복구 발송.
     * 예: DB 커밋은 성공했으나 그 직후 서버 다운 → 비동기 스레드 실행 안 됨.
     */
    @Scheduled(cron = "0 30 1 * * ?", zone = "Asia/Seoul")
    public void sendWelcomeOrphans() {
        if (!welcomeOrphanRunning.compareAndSet(false, true)) {
            log.info("[MailScheduler] 환영 메일 안전망 배치 이미 실행 중 - 스킵");
            return;
        }
        try {
            log.info("[MailScheduler] === 환영 메일 안전망 배치 시작 ===");
            List<WelcomeMailTargetDto> orphans = logMapper.selectWelcomeOrphans();

            if (orphans == null || orphans.isEmpty()) {
                log.info("[MailScheduler] 환영 메일 누락자 없음");
                return;
            }

            log.info("[MailScheduler] 환영 메일 누락자 {}명", orphans.size());
            for (WelcomeMailTargetDto orphan : orphans) {
                // 안전망 배치: WelcomeMailTargetDto를 EmpRequest로 변환 후 위임
                EmpRequest emp = new EmpRequest();
                emp.setEmpId(orphan.getEmpId());
                emp.setEmpName(orphan.getEmpName());
                emp.setEmpEmail(orphan.getEmpEmail());
                emailService.sendWelcomeMailAsync(emp);
            }

            log.info("[MailScheduler] === 환영 메일 안전망 배치 종료 (예약 완료) ===");
        } finally {
            welcomeOrphanRunning.set(false);
        }
    }


    // ─── 수동 트리거용 공개 메서드 (Controller에서 호출) ───

    /* 관리자 강제 실행: 3일 메일 배치. */
    public void triggerFollowup3Day() { sendFollowup3DayEmails(); }

    /* 관리자 강제 실행: 환영 메일 안전망 배치. */
    public void triggerWelcomeOrphans() { sendWelcomeOrphans(); }

}
