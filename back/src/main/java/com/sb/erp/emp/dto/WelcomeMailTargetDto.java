package com.sb.erp.emp.dto;


import lombok.Data;

/**
 * 배치 스케줄러가 발송 대상 사원 조회 시 반환하는 최소 정보.
 * - employee + company 조인 결과 담기
 * - EmpDto 전체 대신 최소 필드만 사용 (스케줄 성능 + 관심사 분리)
 */

@Data
public class WelcomeMailTargetDto {
    private long   empId;
    private String empName;
    private String empEmail;
    private String comName;
    private String createdAt;   // TO_CHAR (참고용)
}
