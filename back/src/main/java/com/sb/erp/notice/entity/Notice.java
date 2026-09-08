package com.sb.erp.notice.entity;

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
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name="NOTICE")
public class Notice {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_notice")
    @SequenceGenerator(name = "seq_notice", sequenceName = "SEQ_NOTICE", allocationSize = 1)
	@Column(name="BNO", nullable = false)
	private Long bno; 
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="COM_ID", nullable = false)
	private Company company;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EMP_ID", nullable = false)
	private Employee employee;
	
	@Column(name="BTITLE", nullable = false, length=200)
	private String btitle;   
	
	@Lob
	@Column(name="BCONTENT", nullable = false)
	private String bcontent;  
	
	@Column(name="BHIT", nullable = false)
	private Integer bhit;         
	
	@Lob
	@Column(name="BFILE")
	private String bfile;    
	
	@Column(name = "CREATED_AT", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "UPDATED_AT", insertable = false, updatable = false)
	private LocalDateTime updatedAt;

}
