package com.sb.erp.appr.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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
@Table(
	name = "appr_form_delegation_config",
	uniqueConstraints = @UniqueConstraint(
		name = "uq_form_deleg_cfg",
		columnNames = {"for_id", "for_version"}
	)
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprFormDelegationConfig {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "appr_form_deleg_cfg_seq")
	@SequenceGenerator(name = "appr_form_deleg_cfg_seq", sequenceName = "appr_form_deleg_cfg_seq")
	@Column(name = "cfg_id")
	private Long cfgId;

	// 복합키
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumns({
		@JoinColumn(name = "for_id", referencedColumnName = "for_id"),
		@JoinColumn(name = "for_version", referencedColumnName = "for_version")
	})
	private ApprForm apprForm;
	
	@Column(name = "enabled", nullable = false)
	@Builder.Default
	private boolean enabled = false;
	
	// for_schema 내 FieldEditor가 부여한 필드 id 참조
	@Column(name = "start_field_id", nullable = false, length = 20)
	private String startFieldId;
	
	@Column(name = "end_field_id", nullable = false, length = 20)
	private String endFieldId;
	
	@Column(name = "delegate_field_id", nullable = false, length = 20)
	private String delegateFieldId;
	
	@Column(name = "min_trigger_days", nullable = false)
	@Builder.Default
	private Integer minTriggerDays = 1;
	
	@Column(name = "created_at", nullable = false, insertable = false)
	private LocalDateTime createdAt;
	
	@Column(name = "updated_at", nullable = false, insertable = false)
	private LocalDateTime updatedAt;
}
