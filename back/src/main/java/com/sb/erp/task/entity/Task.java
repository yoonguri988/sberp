package com.sb.erp.task.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.com.entity.Company;
import com.sb.erp.proj.entity.Project;
import com.sb.erp.proj.entity.ProjectMember;


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
@Table(name="TASK")
public class Task {
	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_task")
    @SequenceGenerator(name = "seq_task", sequenceName = "SEQ_TASK", allocationSize = 1)
	@Column(name="TASK_ID", nullable = false)
	private Long taskId;
	
	@ManyToOne(fetch = FetchType.LAZY) 
	@JoinColumn(name="PRO_ID", nullable = false)
	private Project project;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="PM_ID", nullable = false)
	private ProjectMember projectMember;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="COM_ID", nullable = false)
	private Company company;
	
	// 부모 태스크
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PARENT_TASK_ID")
	private Task parent;
	
    // 자식 태스크
    @OneToMany(mappedBy = "parent")
    @Builder.Default
    private List<Task> children = new ArrayList<>();
	
	@Column(name="TASK_NAME", length=100, nullable = false)
	private String taskName;
	
	@Column(name="TASK_DESC", length=1000, nullable = false)
	private String taskDesc;
	
	@Column(name="TASK_STATUS", nullable = false, length=20)
	private String taskStatus;

	@Column(name="TASK_START_DATE", nullable = false)
	private LocalDate taskStartDate;
	
	@Column(name="TASK_END_DATE", nullable = false)
	private LocalDate taskEndDate;
	
	@Column(name="ACTUAL_START_DATE", insertable = false, updatable = false)
	private LocalDate actualStartDate; // 실제 착수일
	
	@Column(name="ACTUAL_END_DATE", insertable = false, updatable = false)
	private LocalDate actualEndDate; //실제 완요일
	
	@Column(name="CREATED_AT", insertable = false, updatable = false)
	private LocalDateTime createdAt;
	
	@Column(name="UPDATED_AT", insertable = false, updatable = false)
	private LocalDateTime updatedAt;

}
