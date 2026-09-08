package com.sb.erp.dept.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.sb.erp.com.entity.Company;
import com.sb.erp.emp.entity.Employee;

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
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.SequenceGenerator;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@ToString(exclude = {"parent", "children"}) // 순환참조 방지
public class Department {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_department")
	@SequenceGenerator(name = "seq_department", sequenceName = "SEQ_DEPARTMENT", allocationSize = 1)
	@Column(name = "DEPT_ID")
	private Long deptId;
	
	// 회사
	@ManyToOne
	@JoinColumn(name="COM_ID", nullable = false)
	private Company company;
		
	// 부서장(담당자)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "EMP_ID")
	private Employee employee;
	
	@Column(name = "DEPT_NAME", length = 100)
	private String deptName;
 
	@Column(name = "DEPT_CODE", length = 100)
	private String deptCode;
 
	@Column(name = "DEPTH")
	private Integer depth;
 
	@Column(name = "SORT_ORDER")
	private Integer sortOrder;
	
	@Column(name = "DEPT_STATUS", length = 100)
	private String deptStatus; // ACTIVE, PENDING_DELETE, DELETED
	
	@Column(name = "IS_DELETED")
	private boolean deleted=false;
	
	@Column(name="CREATED_AT", nullable=false)
	private LocalDateTime createdAt;
	
	@Column(name="UPDATED_AT", nullable=false)
	private LocalDateTime updatedAt;
	
	@PrePersist
	void onCreate() {
		this.createdAt = LocalDateTime.now();
		this.updatedAt = LocalDateTime.now();
		
		if (this.deptStatus == null) {
			this.deptStatus = "ACTIVE";
		}
		if (this.sortOrder == null) {
			this.sortOrder = 0;
		}
	}
	@PreUpdate
	void onUpdate() {
		this.updatedAt = LocalDateTime.now();		
	}
	
	// 상위 부서 (자기참조)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PARENT_ID")
	private Department parent;
	
	// 하위 부서 목록 (조직도 트리 구성용, DB 컬럼 아님)
	@OneToMany(mappedBy = "parent")
	@Builder.Default
	private List<Department> children = new ArrayList<>();

	// 부서 삭제 이관 - 이동 전 부서
	@OneToMany(mappedBy = "originDept", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<DeptTransferLog> originDepts = new ArrayList<>();

	// 부서 삭제 이관 - 이동 후 부서
	@OneToMany(mappedBy = "targetDept", cascade = CascadeType.ALL, orphanRemoval = true)
	@Builder.Default
	private List<DeptTransferLog> targetDepts = new ArrayList<>();
	
	
}
/*
IS_DELETED  NOT NULL BOOLEAN
DEPT_ID     NOT NULL NUMBER        
COM_ID      NOT NULL NUMBER        
PARENT_ID            NUMBER        
DEPT_NAME            VARCHAR2(100) 
DEPT_CODE            VARCHAR2(100) 
DEPTH                NUMBER        
SORT_ORDER           NUMBER        
EMP_ID               NUMBER        
DEPT_STATUS          VARCHAR2(100) 
CREATED_AT           DATE          
UPDATED_AT           DATE     
*/