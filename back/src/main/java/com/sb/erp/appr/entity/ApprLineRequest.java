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
@Table(name = "appr_line_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprLineRequest {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "appr_lcr_seq")
	@SequenceGenerator(name = "appr_lcr_seq", sequenceName = "appr_lcr_seq", allocationSize = 1)
	@Column(name = "req_id")
	private Long reqId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "doc_id", nullable = false)
	private ApprDoc apprDoc;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "lin_id", nullable = false)
	private ApprLine apprLine;
	
	// 기존 결재자
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ori_emp_id", nullable = false)
	private Employee oriEmp;
	
	// 대결자
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "new_emp_id")
	private Employee newEmp;
	
	// 요청자
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "req_emp_id", nullable = false)
	private Employee reqEmp;
	
	// 요청 승인/반려 처리자
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "pro_emp_id")
	private Employee proEmp;
	
	@Column(name = "req_reason", length = 500)
	private String reqReason;
	
	@Column(name = "req_status", nullable = false, length = 10)
	@Builder.Default
	private String reqStatus = "REQ";
	
	@Column(name = "created_at", nullable = false, insertable = false)
	private LocalDateTime createdAt;
	
	@Column(name = "processed_at")
	private LocalDateTime processedAt;
}
