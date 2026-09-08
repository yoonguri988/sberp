package com.sb.erp.eval.dto;

import lombok.Data;

/**
 * 리포트 발행 진행률 응답 DTO.
 * - GET /eval/period/{periodId}/status 반환값
 * - 프론트 폴링 스크립트가 이 필드 이름을 참조하므로 변경 시 프론트 동기화 필요
 */

@Data
public class ReportProgressDto {
    private String status;      // READY / OPEN / CLOSED / REPORTING / REPORTED / REPORTING_FAILED
    private int completed;      // 생성 완료된 리포트 수
    private int total;          // 대상 총원
    private int percentage;     // 0~100
    
    public ReportProgressDto() {}
    
    public ReportProgressDto(String status, int completed, int total) {
        this.status = status;
        this.completed = completed;
        this.total = total;
        this.percentage = (total == 0) ? 0 : (int) Math.round(completed * 100.0 / total);
    }
  
}