package com.sb.erp.att.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sb.erp.att.entity.LeaveGrant;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LeaveGrantResponse {

    private Long grantId; // PK
    private Long empId;
    private String empName;
    private String empNo;


    // ── 부여/차감 정보 ──
    private BigDecimal grantDays;      // +15.00 (부여) / -1.00 (사용) / -0.50 (반차)
    private String grantType;          // REG / CAR / ADJ / USE
    private LocalDateTime grantedAt;   // 부여 시각 — @PrePersist로 자동 세팅
    private LocalDate expireAt;        // 만료일 — 당해 연도 말 또는 null
    private String reason;             // 사유 (ADJ일 때 주로 사용)


    public static LeaveGrantResponse from(LeaveGrant grant) {
        LeaveGrantResponse res = new LeaveGrantResponse();

        res.grantId   = grant.getGrantId();
        res.grantDays = grant.getGrantDays();
        res.grantType = grant.getGrantType();
        res.grantedAt = grant.getGrantedAt();
        res.expireAt  = grant.getExpireAt();
        res.reason    = grant.getReason();

        // Employee 관련 표시용 필드
        res.empId   = grant.getEmployee().getEmpId();
        res.empName = grant.getEmployee().getEmpName();
        res.empNo   = grant.getEmployee().getEmpNo();

        return res;
    }
}
