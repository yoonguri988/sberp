package com.sb.erp.com.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.appr.entity.ApprDoc;
import com.sb.erp.appr.entity.ApprForm;
import com.sb.erp.dept.entity.Department;
import com.sb.erp.dept.entity.DeptTransferLog;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.notice.entity.Notice;
import com.sb.erp.auth.entity.Authority;
import com.sb.erp.pos.entity.Position;
import com.sb.erp.proj.entity.Project;
import com.sb.erp.res.entity.Resource;
import com.sb.erp.resv.entity.Reservation;
import com.sb.erp.task.entity.Task;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Company {
	@Id // jakarta.persistence.Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_company")
	@SequenceGenerator(name="seq_company", sequenceName="SEQ_COMPANY", allocationSize=1)
	@Column(name="COM_ID")
	private Long comId;
	
	@Column(length = 100, nullable = false)
	private String industryGrpCode;
	@Column(length = 100, nullable = false)
	private String industryCode;
	@Column(length = 100, nullable = false)
	private String comName;
	@Column(length = 100, nullable = false)
	private String comCeo;
	@Column(length = 45, nullable = false)
	private String bizNo;
	
	@Column(length = 100)
	private String comTel;
	@Lob // 대용량 처리 - 이미지
	private String comLogo;

	// 회사 삭제 요청 시, 연관된 하위 데이터(부서/직원/전자결재 등)가 하나도 없으면 진짜 DELETE,
	// 하나라도 남아있으면 이 값을 INACTIVE로 바꾸는 비활성화(soft delete)로 대신 처리한다.
	// ACTIVE / INACTIVE 두 값만 사용.
	@Column(name = "COM_STATUS", length = 20)
	private String comStatus;

	@Column(name="CREATED_AT", nullable=false)
	private LocalDateTime createdAt;
	@Column(name="UPDATED_AT", nullable=false)
	private LocalDateTime updatedAt;

	@PrePersist
	void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
		if (this.comStatus == null) {
			this.comStatus = "ACTIVE";
		}
	}
	@PreUpdate
	void onUpdate() {
		this.updatedAt = LocalDateTime.now();		
	}
	
	// 연관 관계
	// 부서
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Department> depts = new ArrayList<>();
		
	// 부서 이관 로그
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<DeptTransferLog> deptTransferLog = new ArrayList<>();
	
	// 권한 authority
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Authority> auths = new ArrayList<>();
	
	// emp_position
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Position> empPositions = new ArrayList<>();

	// 직원
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Employee> employees = new ArrayList<>();
	
	//evaluation_period
//	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
//	@Builder.Default
//	private List<EvaluationPeriod> evalPeriods = new ArrayList<>();

	// 결재 문서
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<ApprDoc> apprDocs = new ArrayList<>();
	
	// 결재 양식
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<ApprForm> apprForms = new ArrayList<>();
	
	// 프로젝트
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Project> projects = new ArrayList<>();
	
	// 태스크
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Task> tasks = new ArrayList<>();
	
	// 공지
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Notice> notices = new ArrayList<>();
	
	//자원
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Resource> resources = new ArrayList<>();
	
	//자원예약
	@OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<Reservation> reservations = new ArrayList<>();
}
/*
 * COM_ID            NOT NULL NUMBER        
 * INDUSTRY_GRP_CODE NOT NULL VARCHAR2(100) 
 * INDUSTRY_CODE     NOT NULL VARCHAR2(100) 
 * COM_NAME          NOT NULL VARCHAR2(100) 
 * COM_CEO           NOT NULL VARCHAR2(100) 
 * BIZ_NO            NOT NULL VARCHAR2(45)  
 * COM_TEL                    VARCHAR2(100)
 * COM_LOGO                   VARCHAR2(500)
 * COM_STATUS                 VARCHAR2(20)   -- ACTIVE / INACTIVE (신규)
 * CREATED_AT        NOT NULL DATE
 * UPDATED_AT        NOT NULL DATE
 */
