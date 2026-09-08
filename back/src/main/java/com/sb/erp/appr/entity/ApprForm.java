package com.sb.erp.appr.entity;

import java.time.LocalDateTime;

import com.sb.erp.com.entity.Company;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appr_form")
@IdClass(ApprFormId.class) // 복합 키
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprForm {
	
	@Id
	@Column(name = "for_id")
	private Long forId;
	
	@Id
	@Column(name = "for_version")
	private Long forVersion;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "com_id", nullable = false)
	private Company company;
	
	@Column(name = "for_code", nullable = false, length = 50)
	private String forCode;
	
	@Column(name = "for_title", nullable = false, length = 50)
	private String forTitle;
	
	@Lob
	@Column(name = "for_content")
	private String forContent;
	
	@Lob
	@Column(name = "for_schema")
	private String forSchema;
	
	@Column(name = "for_status", nullable = false)
	private Boolean forStatus;
	
	@Column(name = "is_deleted", nullable = false)
	private boolean isDeleted;
	
	@Column(name = "created_at", nullable = false, insertable = false)
	private LocalDateTime createdAt;
	
	@Column(name = "updated_at", nullable = false, insertable = false)
	private LocalDateTime updatedAt;
	
	@Column(name = "for_category", nullable = false, length = 20)
	@Builder.Default
	private String forCategory = "GENERAL";
}
		  