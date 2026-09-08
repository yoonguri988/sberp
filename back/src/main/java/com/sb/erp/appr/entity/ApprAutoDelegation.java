package com.sb.erp.appr.entity;

import java.time.LocalDate;
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


/**
 * 스코프 제외 - 위임전결 자동화
 * 미구현으로 배포 대상에서 제외됨. 인가 모델(ROOT → comId 스코프 ADMIN) 마이그레이션도
 * 적용 안 된 상태로 코드만 보존. 재개 시 ApprFormController와 동일한 패턴으로 맞출 것.
 */
@Entity
@Table(name = "appr_auto_delegation")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprAutoDelegation {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "appr_auto_deleg_seq")
	@SequenceGenerator(name = "appr_auto_deleg_seq", sequenceName = "appr_auto_deleg_seq")
	@Column(name = "auto_deleg_id")
	private Long autoDelegId;
	
	// 위임을 발동시킨 원본 결재문서
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "doc_id", nullable = false)
	private ApprDoc apprDoc;
	
	// 위임자
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "del_emp_id", nullable = false)
	private Employee delEmp;
	
	// 수임자
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "new_emp_id", nullable = false)
	private Employee newEmp;
	
	@Column(name = "start_date", nullable = false)
	private LocalDate startDate;
	
	@Column(name = "end_date", nullable = false)
	private LocalDate endDate;
	
	// ACT(활성) / EXP(만료) / CANC_REQ(취소요청중) / CANC(취소완료) / SKIP(중복으로 미적용)
	@Column(name = "deleg_status", nullable = false, length = 20)
	@Builder.Default
	private String delegStatus = "ACT";
	
	@Column(name = "canc_reason", length = 500)
	private String cancReason;
	
	// 취소 용청을 최종 승/반 한 관리자
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "proc_emp_id")
	private Employee procEmp;
	
	@Column(name = "created_at", nullable = false, insertable = false)
	private LocalDateTime createdAt;
	
	@Column(name = "processed_at")
	private LocalDateTime processedAt;
}
