package com.sb.erp.att.dto.request;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LeaveGrantRequest {

    // 부여/차감 대상 사원 ID
    @NotNull
    private Long empId;

    // 부여/차감 일수
    // 양수 = 부여 (15.00, 1.00)
    // 음수 = 차감 (-1.00, -0.50)
    // BigDecimal : 반차(0.5일) 처리
    @NotNull
    private BigDecimal grantDays;
    
    // 실제 휴가 사용일
    @NotNull
    private LocalDate leaveDate;

    // 부여 타입
    // "REG" = 정기 부여 (근로기준법 기반 자동 계산)
    // "CAR" = 이월 (전년도 미사용분)
    // "ADJ" = 수동 조정 (관리자 재량)
    // "USE" = 연차 사용 (차감 시, grantDays는 음수)
    @NotNull
    private String grantType;

    // 반차 구분 (선택)
    // grantDays가 -0.50일 때만 사용
    // "AM" = 오전 반차, "PM" = 오후 반차
    // 연차(-1.00)나 부여(양수)일 때는 null
    private String halfType;

    // 사유 (선택)
    // ADJ 타입일 때 "특별휴가 부여", "징계에 따른 차감" 등 기록
    // REG/USE 타입에서는 null 허용
    private String reason;
    

}
