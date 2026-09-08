package com.sb.erp.att.dto.response;

import java.math.BigDecimal;

import com.sb.erp.att.entity.LeaveBalance;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LeaveBalanceResponse {

    private Long balanceId;       // PK
    private Long empId;
    private String empName;
    private String empNo;

    // ── 연차 현황 ──
    private Integer year;              // 연도 (2026)
    private BigDecimal totalDays;      // 총 발생 연차 (15.00)
    private BigDecimal usedDays;       // 사용한 연차  (3.00)
    private BigDecimal remainingDays;  // 잔여 연차    (12.00) — Entity의 getRemainingDays() 호출

    public static LeaveBalanceResponse from(LeaveBalance lb) {
        LeaveBalanceResponse res = new LeaveBalanceResponse();

        res.balanceId     = lb.getBalanceId();
        res.year          = lb.getYear();
        res.totalDays     = lb.getTotalDays();
        res.usedDays      = lb.getUsedDays();
        res.remainingDays = lb.getRemainingDays();  // Entity 내부에서 totalDays - usedDays 계산

        res.empId   = lb.getEmployee().getEmpId();
        res.empName = lb.getEmployee().getEmpName();
        res.empNo   = lb.getEmployee().getEmpNo();

        return res;
    }

}
