package com.sb.erp.rec.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.apct.entity.Applicant;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
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
@Table(name = "RECRUIT")
public class Recruit { // 채용공고
	
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_recruit")
    @SequenceGenerator(name = "seq_recruit", sequenceName = "SEQ_RECRUIT", allocationSize = 1)
    @Column(name = "REC_ID", nullable = false)
    private Long recId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "COM_ID", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EMP_ID", nullable = false)
    private Employee employee;

    @Column(name = "REC_TITLE", nullable = false, length = 200)
    private String recTitle;

    @Column(name = "REC_DEPARTMENT", length = 100)
    private String recDepartment;

    @Column(name = "REC_POSITION", length = 100)
    private String recPosition;

    @Column(name = "REC_HEADCOUNT")
    private Long recHeadcount;

    @Column(name = "REC_EMPLOYMENT_TYPE", length = 50)
    private String recEmploymentType;

    @Lob
    @Column(name = "REC_DESCRIPTION")
    private String recDescription;

    @Column(name = "REC_START_DATE")
    private LocalDateTime recStartDate;

    @Column(name = "REC_END_DATE")
    private LocalDateTime recEndDate;

    @Column(name = "REC_STATUS", nullable = false, length = 20)
    private String recStatus;

    @Column(name = "CREATED_AT", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "recruit")
    @Builder.Default
    private List<Applicant> applicants = new ArrayList<>();
}