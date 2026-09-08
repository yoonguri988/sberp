package com.sb.erp.emp.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.emp.dto.EmailSendLogDto;
import com.sb.erp.emp.dto.WelcomeMailTargetDto;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.emp.repository.EmailSendLogMapper;
import com.sb.erp.global.integration.EmailApi;
import com.sb.erp.global.integration.NaverEmailApi;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 온보딩 이메일 발송 구현체.
 *
 * <p>발송 라이프사이클:
 * <pre>
 *   1) log.upsertProcessing → 상태 'P'
 *   2) emailApi.sendMail(...)
 *   3-a) 성공 → log.updateSuccess → 'S'
 *   3-b) 실패 → log.updateFail → 'F' + error_msg
 * </pre>
 *
 * <p>이 클래스의 메서드는 {@code mailExecutor} 스레드 풀에서 비동기 실행되며,
 * 예외를 절대 밖으로 던지지 않는다 (호출자 트랜잭션에 영향 없음).
 */

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final EmailApi emailApi;
    private final NaverEmailApi naverEmailApi;
    private final EmailSendLogMapper logMapper;

    // 사원 등록 시점엔 회사명 조인 없이 저장하므로 fallback
    private static final String DEFAULT_COM_NAME = "SBerp";


    // ─── 환영 메일 ─────────────────────────────
    @Override
    @Async("mailExecutor")
    public void sendWelcomeMailAsync(EmpRequest emp) {
        long   empId    = emp.getEmpId();
        String empName  = emp.getEmpName();
        String empEmail = emp.getEmpEmail();
        String comName  = DEFAULT_COM_NAME;

        if (empEmail == null || empEmail.isBlank()) {
            log.warn("[EmailService] 환영 메일 스킵: empId=" + empId + " 이메일 없음");
            return;
        }

        try {
            logMapper.upsertProcessing(empId, EmailSendLogDto.TYPE_WELCOME);

            String subject = MailTemplates.welcomeSubject(comName, empName);
            String body    = MailTemplates.welcomeBody(comName, empName);

            emailApi.sendMail(subject, body, empEmail);

            logMapper.updateSuccess(empId, EmailSendLogDto.TYPE_WELCOME);
            log.info("[EmailService] 환영 메일 성공 empId=" + empId);

        } catch (Exception e) {
            String msg = truncate(e.getMessage(), 500);
            try {
                logMapper.updateFail(empId, EmailSendLogDto.TYPE_WELCOME, msg);
            } catch (Exception logEx) {
                log.error("[EmailService] 로그 업데이트 실패", logEx);
            }
            log.error("[EmailService] 환영 메일 실패 empId=" + empId, e);
        }
    }


    // ─── 3일 차 적응 확인 메일 ──────────────────

    @Override
    @Async("mailExecutor")
    public void sendFollowup3DayMailAsync(WelcomeMailTargetDto target) {
        long   empId    = target.getEmpId();
        String empName  = target.getEmpName();
        String empEmail = target.getEmpEmail();
        String comName  = (target.getComName() != null) ? target.getComName() : DEFAULT_COM_NAME;

        if (empEmail == null || empEmail.isBlank()) {
            log.warn("[EmailService] 3일 메일 스킵: empId=" + empId + " 이메일 없음");
            return;
        }

        try {
            logMapper.upsertProcessing(empId, EmailSendLogDto.TYPE_FOLLOWUP_3DAY);

            String subject = MailTemplates.followup3DaySubject(comName, empName);
            String body    = MailTemplates.followup3DayBody(comName, empName);

            emailApi.sendMail(subject, body, empEmail);

            logMapper.updateSuccess(empId, EmailSendLogDto.TYPE_FOLLOWUP_3DAY);
            log.info("[EmailService] 3일 메일 성공 empId=" + empId);

        } catch (Exception e) {
            String msg = truncate(e.getMessage(), 500);
            try {
                logMapper.updateFail(empId, EmailSendLogDto.TYPE_FOLLOWUP_3DAY, msg);
            } catch (Exception logEx) {
                log.error("[EmailService] 로그 업데이트 실패", logEx);
            }
            log.error("[EmailService] 3일 메일 실패 empId=" + empId, e);
        }
    }
    
    // ─── 비밀번호 재설정 안내 메일 ──────────────
    // 발송 로그 테이블(email_send_log)은 (emp_id, mail_type) UNIQUE 제약의 온보딩 메일
    // 전용이라 재설정 요청마다 반복 발송되는 이 메일에는 재사용하지 않는다(이력 필요 시
    // login_history/추후 별도 로그로 확장 가능). 실패해도 예외를 밖으로 던지지 않는다.
    @Override
    @Async("mailExecutor")
    public void sendPasswordResetMailAsync(EmpResponse emp, String resetLink) {
        if (emp == null || emp.getEmpEmail() == null || emp.getEmpEmail().isBlank()) {
            log.warn("[EmailService] 비밀번호 재설정 메일 스킵: 이메일 없음");
            return;
        }
        try {
            String comName = (emp.getComName() != null) ? emp.getComName() : DEFAULT_COM_NAME;
            String subject = MailTemplates.passwordResetSubject(comName);
            String body = MailTemplates.passwordResetBody(comName, emp.getEmpName(), resetLink);

            naverEmailApi.sendMail(subject, body, emp.getEmpEmail());
            log.info("[EmailService] 비밀번호 재설정 메일 성공 empId=" + emp.getEmpId());
        } catch (Exception e) {
            log.error("[EmailService] 비밀번호 재설정 메일 실패 empId=" + emp.getEmpId(), e);
        }
    }


    // ─── util ──────────────────

    private String truncate(String s, int max) {
        if (s == null) return "unknown";
        return s.length() <= max ? s : s.substring(0, max);
    }
}
