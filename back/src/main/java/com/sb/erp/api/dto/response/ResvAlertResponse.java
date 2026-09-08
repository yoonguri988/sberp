package com.sb.erp.api.dto.response;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ResvAlertResponse {
    private Long revId;        // 예약 PK
    private Long resId;        // 자원 PK
 
    private String resCode;    // 자원 코드 (예: 차량번호로 활용)
    private String resName;    // 자원명 (예: 아반떼, 3층 대회의실)
    private String resType;    // ROOM / VEHICLE / EQUIPMENT
 
    private Long empId;        // 신청자 사원 PK
    private String empName;    // 신청자 이름
    private String empMobile;  // 신청자 휴대폰 번호 (CoolSMS 발신 대상)
 
    private LocalDateTime startDt;
    private LocalDateTime endDt;
    private LocalDateTime returnDt;

    // 스케줄러가 조회 직후 NoShowRiskScorer로 계산해서 채워넣는 값들(DB 컬럼 아님).
    private Double riskScore;   // 0~1
    private String riskLevel;  // LOW / MEDIUM / HIGH
}
