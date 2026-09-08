package com.sb.erp.appr.entity;

import java.time.LocalDate;

import com.sb.erp.appr.entity.ApprDoc;
import com.sb.erp.emp.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "leave_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveRequest {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "lev_req_seq")
	@SequenceGenerator(name = "lev_req_seq", sequenceName = "lev_req_seq", allocationSize = 1)
	@Column(name = "req_id")
	private Long reqId;
	
	// appr_doc 1:1 doc_id 유니크제약
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "doc_id", nullable = false, unique = true)
	private ApprDoc apprDoc;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "emp_id", nullable = false)
	private Employee emp;
	
	// 시 분 초 제외하려고 LocalDateTime 대신 LocalDate 사용
	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;
	
	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;
	
	// 반차 소수 단위 고려 (NUMBER(4,1)) / 일단 반차만 반반차이런거 X
	@Column(name = "req_days", nullable = false)
	private Double reqDays;
	
	@Column(name = "req_status", nullable = false, length = 20)
	@Builder.Default
	private String reqStatus = "PEN";
}
