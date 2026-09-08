package com.sb.erp.proj.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.com.entity.Company;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.task.entity.Task;

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
@Table(name="PROJECT")
public class Project {
	
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_project")
    @SequenceGenerator(name = "seq_project", sequenceName = "SEQ_PROJECT", allocationSize = 1)
	@Column(name="PRO_ID", nullable = false)
	private Long proId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="COM_ID", nullable = false)
	private Company company;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EMP_ID", nullable = false)
	private Employee employee;
	
	@Column(name="PRO_STATUS", nullable = false, length=20)
	private String proStatus;
	
	@Column(name="PRO_NAME", nullable = false, length=100)
	private String proName;
	
	@Column(name="PRO_DESC", length=1000)
	private String proDesc;
	
	@Column(name="START_DATE", nullable = false)
	private LocalDate startDate;
	
	@Column(name="END_DATE", nullable = false)
	private LocalDate endDate;
	
	// 날짜 컬럼들 모두 DB에서 처리 / 순수조회용
	
	@Column(name="ACTUAL_START_DATE", insertable = false, updatable = false)
	private LocalDate actualStartDate; 

	@Column(name="ACTUAL_END_DATE", insertable = false, updatable = false)
	private LocalDate actualEndDate; 

	@Column(name = "CREATED_AT", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "UPDATED_AT", insertable = false, updatable = false)
	private LocalDateTime updatedAt;

	
	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<ProjectMember> members = new ArrayList<>();

	@OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Task> tasks = new ArrayList<>();
	
//	@Column(name="EMP_NAME")
//	private String empName;
//	ㄴproject.getEmployee().getName()
//-- Repository --
//	@Query("SELECT COUNT(pm) FROM ProjectMember pm WHERE pm.project.id = :proId")
//	int countMembersByProjectId(@Param("proId") Long proId);
//	
//	@Column(name="MEMBERCNT")
//	private Integer memberCnt; 
	
}
