package com.sb.erp.resv.dto.response;

import java.time.LocalDateTime;

import com.sb.erp.resv.entity.Reservation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResvResponse {
	private Long revId;
	private Long resId;
	private Long comId;
	private Long empId;

	private Long quantity;
	private String status;

	// 추가 컬럼
	private LocalDateTime startDt;
	private LocalDateTime endDt;
	private LocalDateTime returnDt;
	private Long approvedEmpId;
	private LocalDateTime approvedAt;
	private String rejectReason;

	private String remark;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	//
	private String resName;
	private String resCode;
	private String resType;
	private String location;
	private Long resQuantity;
	private Long capacity;
	private String resStatus;

	private String empName;
	private String deptName;
	private String approvedEmpName;
	
	private LocalDateTime noshowAlertAt;

	// 이력 기반 위험도 스코어(0~1). 알림이 발송된 건만 값이 채워진다. NoShowRiskScorer 참고.
	private Double riskScore;

	public ResvResponse(Reservation reservation) {
		this.revId = reservation.getRevId();
		this.resId = reservation.getResource().getResId();
		this.comId = reservation.getCompany().getComId();
		this.empId = reservation.getEmployee().getEmpId();
		this.quantity = reservation.getQuantity();
		this.status = reservation.getStatus();
		this.startDt = reservation.getStartDt();
		this.endDt = reservation.getEndDt();
		this.returnDt = reservation.getReturnDt();
		this.rejectReason = reservation.getRejectReason();
		this.remark = reservation.getRemark();
		this.createdAt = reservation.getCreatedAt();
		this.updatedAt = reservation.getUpdatedAt();

		this.resName = reservation.getResource().getResName();
		this.resCode = reservation.getResource().getResCode();
		this.resType = reservation.getResource().getResType();
		this.location = reservation.getResource().getLocation();
		this.resQuantity = reservation.getResource().getQuantity();
		this.capacity = reservation.getResource().getCapacity();
		this.resStatus = reservation.getResource().getResStatus();

		this.empName = reservation.getEmployee().getEmpName();
		this.deptName = reservation.getEmployee().getDepartment() != null
				? reservation.getEmployee().getDepartment().getDeptName()
				: null;

		// 승인 전(WAI) 상태에서는 apprEmployee, approvedAt이 null인 게 정상 — 반드시 null 체크 필요
		if (reservation.getApprEmployee() != null) {
			this.approvedEmpId = reservation.getApprEmployee().getEmpId();
			this.approvedEmpName = reservation.getApprEmployee().getEmpName();
		}
		this.approvedAt = reservation.getApprovedAt();
		this.noshowAlertAt = reservation.getNoshowAlertAt();
		this.riskScore = reservation.getRiskScore();
	}
}