package com.sb.erp.emp.dto;

import lombok.Data;

@Data
public class EmpDto {
	
	// ─── 사원 기본 정보 ──────────────────────────────────────
    private int empId;         // 시스템 PK (시퀀스 자동 채번)
    private String empNo;      // 사번 (회사 부여, 가변)
    private String empName;
    private String empPass;    // BCrypt
    private String empEmail;
    private String empMobile;
    private String empStatus;  // 재직 / 휴직 / 퇴직
    private String hireDate;   // 입사일

    
    // ─── 등록/수정일 ─────────────────────────────────────
    private String createdAt;
    private String updatedAt;

    
    // ─── FK ───────────────────────────────────────────
    private int deptId;        // department
    private int posId;         // emp_position
    private int comId;         // company

    
    // ─── 조인 조회용 표시 필드 ──────────────────────────────
    private String posName;    // 직급명
    private String deptName;   // 부서명
	  public String ComName;	// 회사명
	
	
}

/*

CREATE TABLE employee (
  emp_id      NUMBER(10)      NOT NULL,
  emp_no      VARCHAR2(20)    NOT NULL,
  emp_name    VARCHAR2(50)    NOT NULL,
  emp_pass    VARCHAR2(500)   NOT NULL,
  emp_email   VARCHAR2(100)   NOT NULL,
  emp_mobile  VARCHAR2(20)    NOT NULL,
  emp_status  VARCHAR2(10)    DEFAULT '재직',
  hire_date   DATE,
  created_at  DATE            DEFAULT SYSDATE,
  updated_at  DATE            DEFAULT SYSDATE,
  com_id      NUMBER(10)      NOT NULL,
  pos_id      NUMBER(10)      NOT NULL,
  dept_id     NUMBER(10)      NOT NULL,
  CONSTRAINT pk_emp PRIMARY KEY (emp_id),
  CONSTRAINT uq_emp_com_no UNIQUE (com_id, emp_no),
  CONSTRAINT uq_emp_email UNIQUE (emp_email),
  CONSTRAINT ck_emp_status CHECK (emp_status IN ('재직','휴직','퇴직')),
  CONSTRAINT fk_emp_com    FOREIGN KEY (com_id)  REFERENCES company(com_id),
  CONSTRAINT fk_emp_pos    FOREIGN KEY (pos_id)  REFERENCES emp_position(pos_id),
  CONSTRAINT fk_emp_dept    FOREIGN KEY (dept_id) REFERENCES department(dept_id)
);

*/