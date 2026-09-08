package com.sb.erp.apct.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.com.entity.Company;
import com.sb.erp.rec.entity.Recruit;
import com.sb.erp.rsm.entity.Resume;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor 
@Builder
@Table(name="APPLICANT",uniqueConstraints = @UniqueConstraint( // 한 공고에 중복 지원 불가
        name = "uq_applicant_provider",
        columnNames = {"REC_ID", "APCT_PROVIDER", "APCT_PROVIDER_ID"}))
public class Applicant { // 지원자 등록/관리
	
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_applicant")
    @SequenceGenerator(name = "seq_applicant", sequenceName = "SEQ_APPLICANT", allocationSize = 1)
	@Column(name="APCT_ID", nullable = false)
	private Long apctId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="COM_ID", nullable = false)
	private Company company;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="REC_ID", nullable = false)
	private Recruit recruit;
	
	@Column(name="APCT_NAME", nullable = false, length=50)
	private String apctName;
	
	@Column(name = "APCT_PROVIDER")
	private String provider;

	@Column(name = "APCT_PROVIDER_ID")
	private String providerId;
	
	@Column(name="APCT_EMAIL", nullable = false, length=100)
	private String apctEmail;
	
	@Column(name="APCT_PHONE", nullable = false, length=20)
	private String apctPhone;
	
	@Column(name="APCT_STATUS", nullable = false, length=20)
	private String apctStatus;
	
	@Column(name="APCT_DATE", insertable = false, updatable = false)
	private LocalDateTime apctDate;
	
	@Column(name = "CREATED_AT", insertable = false, updatable = false)
	private LocalDateTime createdAt;
	
	@Column(name = "UPDATED_AT", insertable = false, updatable = false)
	private LocalDateTime updatedAt;
	
	@OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Resume> resumes = new ArrayList<>();
    
}
