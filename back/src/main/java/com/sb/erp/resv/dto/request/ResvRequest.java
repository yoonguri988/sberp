package com.sb.erp.resv.dto.request;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResvRequest {
	@Schema(hidden = true)
	private Long revId;

	@NotNull(message = "자원 정보는 필수입니다")
	private Long resId;

	@Schema(hidden = true)
//	@NotNull(message = "회사 정보는 필수입니다")
	private Long comId;

	@Schema(hidden = true)
//	@NotNull(message = "사원 정보는 필수입니다")
	private Long empId;

	@NotNull(message = "수량은 필수입니다")
	private Long quantity;

	private String status;

	// 추가 컬럼
	@NotNull(message = "예약 시작일시는 필수입니다")
	private LocalDateTime startDt;

	@NotNull(message = "예약 종료일시는 필수입니다")
	private LocalDateTime endDt;

	private LocalDateTime returnDt;
	private Long approvedEmpId;
	private LocalDateTime approvedAt;
	private String rejectReason;

	private String remark;
	
	@Schema(hidden = true)
	private LocalDateTime createdAt;
	@Schema(hidden = true)
	private LocalDateTime updatedAt;
	
	// 알림발송관련 컬럼
	@Schema(hidden = true)
	private LocalDateTime noshowAlertAt;
}