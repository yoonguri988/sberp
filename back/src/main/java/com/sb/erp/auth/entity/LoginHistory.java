package com.sb.erp.auth.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 로그인 이력 관리
 * - 로그인 성공/실패를 모두 기록한다 (시스템 관리자 확인 페이지용).
 */
@Entity
@Table(name = "login_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginHistory {

    public static final String STATUS_SUCCESS = "S";
    public static final String STATUS_FAIL = "F";

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_login_history")
    @SequenceGenerator(name = "seq_login_history", sequenceName = "SEQ_LOGIN_HISTORY", allocationSize = 1)
    @Column(name = "login_id")
    private Long loginId;

    // 로그인 시도에 입력된 이메일을 그대로 기록 (존재하지 않는 계정이어도 기록됨 - 무차별 대입 추적용)
    @Column(name = "emp_email", length = 100, nullable = false)
    private String empEmail;

    // 이메일이 실제 사원과 매칭된 경우에만 채워짐
    @Column(name = "emp_id")
    private Long empId;

    @Column(name = "emp_name", length = 50)
    private String empName;

    // 'S' 성공 / 'F' 실패
    @Column(name = "status", length = 1, nullable = false)
    private String status;

    // 실패 사유 (예: "비밀번호 불일치", "존재하지 않는 계정")
    @Column(name = "fail_reason", length = 200)
    private String failReason;

    @Column(name = "login_ip", length = 45)
    private String loginIp;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "login_at", nullable = false)
    private LocalDateTime loginAt;

    @PrePersist
    public void onCreate() {
        if (this.loginAt == null) {
            this.loginAt = LocalDateTime.now();
        }
    }
}
