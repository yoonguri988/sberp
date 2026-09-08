package com.sb.erp.proj.entity;

import java.time.LocalDate;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name="PROJECT_MEMBER")
public class ProjectMember {

	@Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_project_member")
    @SequenceGenerator(name = "seq_project_member", sequenceName = "SEQ_PROJECT_MEMBER", allocationSize = 1)
	@Column(name="PM_ID", nullable = false)	
	private Long pmId;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="PROJECT_PRO_ID", nullable = false)
	private Project project;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EMP_ID", nullable = false)
	private Employee employee;
	
	@Column(name="MEMBER_ROLE", nullable = false, length=50)	
	private String memberRole;
	
	@Column(name="JOINED_AT", nullable = false)	
	private LocalDate joinedAt;
	
}
