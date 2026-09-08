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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table( name = "appr_line",
	uniqueConstraints = @UniqueConstraint(name = "uq_appr_line_doc_order",
										  columnNames = {"doc_id", "lin_order"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprLine {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "appr_line_seq")
	@SequenceGenerator(name = "appr_line_seq", sequenceName = "appr_line_seq", allocationSize = 1)
	@Column(name = "lin_id")
	private Long linId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "doc_id", nullable = false)
	private ApprDoc apprDoc;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "emp_id", nullable = false)
	private Employee employee;
	
	@Column(name = "lin_order", nullable = false)
	private Integer linOrder;
	
	@Column(name ="lin_status", nullable = false, length = 20)
	private String linStatus;
	
	@Column(name = "lin_approved")
	private LocalDateTime linApproved;
}
