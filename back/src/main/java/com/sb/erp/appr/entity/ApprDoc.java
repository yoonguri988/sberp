package com.sb.erp.appr.entity;

import java.time.LocalDateTime;

import com.sb.erp.com.entity.Company;
import com.sb.erp.emp.entity.Employee;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appr_doc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApprDoc {
	
	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "appr_doc_seq")
	@SequenceGenerator(name = "appr_doc_seq", sequenceName = "appr_doc_seq", allocationSize = 1)
	@Column(name = "doc_id")
	private Long docId;
	
	// appr_form 복합키 두 컬럼 같이 묶기
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumns({
		@JoinColumn(name = "for_id", referencedColumnName = "for_id"),
		@JoinColumn(name = "for_version", referencedColumnName = "for_version")
	})
	private ApprForm apprForm;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "emp_id", nullable = false)
	private Employee employee;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "com_id", nullable = false)
	private Company company;
	
	@Column(name = "doc_title", nullable = false, length = 100)
	private String docTitle;
	
	@Lob
	@Column(name = "doc_content", nullable = false)
	private String docContent;
	
	@Column(name = "doc_status", nullable = false, length = 20)
	private String docStatus;
	
	@Column(name = "is_important", nullable = false)
	private boolean isImportant;
	
	@Version // 2차 프로젝트때 구현했던 낙관적 락 부분 여기에서 알아서 처리해줌
	@Column(name = "doc_revision", nullable = false)
	private Long docRevision;
	
	@Column(name = "created_at", nullable = false, insertable = false)
	private LocalDateTime createdAt;
	
	@Column(name = "updated_at", nullable = false, insertable = false)
	private LocalDateTime updatedAt;
	
}