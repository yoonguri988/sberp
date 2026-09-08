package com.sb.erp.emp.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



import com.sb.erp.pos.entity.Position;
import com.sb.erp.dept.entity.Department;
import com.sb.erp.com.entity.Company;


@Entity
@Table(name = "employee")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_employee")
    @SequenceGenerator(name = "seq_employee", sequenceName = "SEQ_EMPLOYEE", allocationSize = 1)
    @Column(name = "emp_id")
    private Long empId;

    @Column(name = "emp_no", length = 20, nullable = false)
    private String empNo;

    @Column(name = "emp_pass", length = 200, nullable = false)
    private String empPass;

    @Column(name = "emp_name", length = 50, nullable = false)
    private String empName;

    @Column(name = "emp_email", length = 100)
    private String empEmail;

    @Column(name = "emp_mobile", length = 20)
    private String empMobile;

    @Column(name = "emp_status", length = 10, nullable = false)
    private String empStatus;

    // 최초 가입/관리자 초기화 등으로 비밀번호가 "사번"으로 세팅된 상태인지 여부.
    // 'Y'면 로그인 시 즉시 정상 로그인을 허용하지 않고 비밀번호 변경 화면으로 강제 이동시킨다.
    // 본인이 새 비밀번호로 변경(EmpService.changePassword / updatePassByEmpIdOnly)하면 'N'으로 갱신.
    // 기존 데이터 호환을 위해 nullable 허용 — null은 'N'(변경 불필요)과 동일하게 취급한다.
    @Column(name = "must_change_pwd", length = 1)
    private String mustChangePwd;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    
    
    // ── 연관관계 ──

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pos_id", nullable = false)
    private Position position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "com_id", nullable = false)
    private Company company;

}
