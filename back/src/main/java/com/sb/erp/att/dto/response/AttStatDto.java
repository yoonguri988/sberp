package com.sb.erp.att.dto.response;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

// 평가 리포트용 근태 통계 DTO
// AttendanceRepository 네이티브 쿼리 결과를 매핑

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AttStatDto {
    private Long empId;
    private Integer workDays;          // 실 출근일
    private Integer lateCount;         // 지각
    private Integer earlyLeaveCount;   // 조퇴
    private Integer absentCount;       // 결근
    private BigDecimal annualUsed;     // 연차 사용일 (반차 0.5 환산)
    private Integer totalWorkMin;      // 총 근로시간(분)
    private Integer overtimeMin;       // 총 연장근로시간(분)
    // attRate(출근율)는 영업일 수 기반이므로 서비스 계층에서 계산하기!

    
    // 네이티브 쿼리 Object[] → DTO 변환.
    // SELECT 순서와 반드시 일치하게.
    /**
      resultType="map"을 쓰는 MyBatis의 selectAggregatesByPeriod는 
      agg.get("empName")처럼 컬럼 alias를 key로 꺼낼 수 있지만, 
      JPA 네이티브 쿼리의 Object[] 반환은 그런 이름 매핑이 없다...
      컬럼 이름 기반 매핑도 있는데 설정이 길어서 고민을 좀
    */
    public static AttStatDto from(Object[] row) {
        return AttStatDto.builder()
                .empId(((Number) row[0]).longValue())
                .workDays(((Number) row[1]).intValue())
                .lateCount(((Number) row[2]).intValue())
                .earlyLeaveCount(((Number) row[3]).intValue())
                .absentCount(((Number) row[4]).intValue())
                .annualUsed(new BigDecimal(row[5].toString()))
                .totalWorkMin(((Number) row[6]).intValue())
                .overtimeMin(((Number) row[7]).intValue())
                .build();
    }
}