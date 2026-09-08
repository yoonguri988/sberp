package com.sb.erp.resv.entity;

import java.time.LocalDateTime;

import com.sb.erp.com.entity.Company;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.res.entity.Resource;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "RESERVATION")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reservation {
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_reservation")
	@SequenceGenerator(name = "seq_reservation", sequenceName = "SEQ_RESERVATION", allocationSize = 1)
	@Column(name = "REV_ID")
	private Long revId;
	
	// 자원
	@ManyToOne
	@JoinColumn(name="RES_ID", nullable=false)
	private Resource resource;
	
	// 회사
	@ManyToOne
	@JoinColumn(name="COM_ID", nullable = false)
	private Company company;
	
	// 예약 신청 직원
	@ManyToOne
	@JoinColumn(name = "EMP_ID", nullable=false)
	private Employee employee;
	
	@Column(name = "QUANTITY", nullable=false)
	private Long quantity;
	
	@Column(name = "STATUS", nullable=false, length = 10)
	private String status; // WAI(대기), APP(승인), REJ(반려), NORET(미반납)
	
	@Column(name="START_DT", nullable=false)
	private LocalDateTime startDt;
	
	@Column(name="END_DT", nullable=false)
	private LocalDateTime endDt;

	@Column(name="RETURN_DT")
	private LocalDateTime returnDt;
	
	// 승인 처리한 직원
	@ManyToOne
	@JoinColumn(name = "APPROVED_EMP_ID")
	private Employee apprEmployee;
	
	@Column(name="APPROVED_AT")
	private LocalDateTime approvedAt;
	
	@Column(name = "REJECT_REASON", length = 500)
	private String rejectReason;
	
	@Column(name = "REMARK", length = 255)
	private String remark;
	
	@Column(name="CREATED_AT", nullable=false)
	private LocalDateTime createdAt;
	
	@Column(name="UPDATED_AT", nullable=false)
	private LocalDateTime updatedAt;
	
	@Column(name="NOSHOW_ALERT_AT")
	private LocalDateTime noshowAlertAt;

	// 노쇼/미반납 알림 발송 시점에 함께 계산해서 남겨두는 "이력 기반 위험도" 스코어(0~1).
	// 학습된 확률 모델의 출력이 아니라 규칙 기반 가중합 결과다. NoShowRiskScorer 참고.
	@Column(name="RISK_SCORE")
	private Double riskScore;
}
/*
REV_ID          NOT NULL NUMBER        
RES_ID          NOT NULL NUMBER        
COM_ID          NOT NULL NUMBER        
EMP_ID          NOT NULL NUMBER        
QUANTITY        NOT NULL NUMBER        
STATUS          NOT NULL VARCHAR2(10)  
START_DT        NOT NULL TIMESTAMP(6)  
END_DT          NOT NULL TIMESTAMP(6)  
RETURN_DT                TIMESTAMP(6)  
APPROVED_EMP_ID          NUMBER        
APPROVED_AT              DATE          
REJECT_REASON            VARCHAR2(500) 
REMARK                   VARCHAR2(255) 
CREATED_AT      NOT NULL DATE          
UPDATED_AT               DATE
noshow_alert_at          DATE
risk_score               NUMBER(5,4)
*/