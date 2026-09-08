package com.sb.erp.sal.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 직책별 수당 정책 등록 요청.
 * pos는 Employee.position(Position 엔티티)의 posCode(직급코드)와 매칭한다.
 *
 * 필드명은 sal_pos_alw 테이블 컬럼명과 1:1로 동일하다(JSON 키도 동일).
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SalaryPositionAllowanceCreateRequest {

    @NotBlank(message = "직급코드(pos)는 필수입니다.")
    private String pos;

    @NotNull(message = "회사 정보는 필수입니다.")
    private Long comId;

    @NotNull(message = "지급액은 필수입니다.")
    @PositiveOrZero(message = "지급액은 0 이상이어야 합니다.")
    private Long amt;

    @NotNull(message = "적용 시작일은 필수입니다.")
    private LocalDate effFrom;
}
