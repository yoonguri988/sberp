package com.sb.erp.appr.entity;

import java.time.LocalDateTime;

import com.sb.erp.emp.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appr_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprLog {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "appr_audit_log_seq")
	@SequenceGenerator(name = "appr_audit_log_seq", sequenceName = "appr_audit_log_seq", allocationSize = 1)
	@Column(name = "log_id")
	private Long logId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "doc_id", nullable = false)
	private ApprDoc apprDoc;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "auto_deleg_id")
	private ApprAutoDelegation autoDeleg;
	
	// 원래 결재선상의 결재자
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ori_emp_id", nullable = false)
	private Employee oriEmp;
	
	// 실제로 대결 처리한 사람
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "act_emp_id", nullable = false)
	private Employee actEmp;
	
	// 위임을 승인한 관리자
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "per_emp_id", nullable = false)
	private Employee perEmp;
	
	@Column(name = "created_at", nullable = false, insertable = false)
	private LocalDateTime createdAt;
}
