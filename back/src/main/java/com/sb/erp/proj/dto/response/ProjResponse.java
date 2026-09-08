package com.sb.erp.proj.dto.response;

import java.time.LocalDate;

import com.sb.erp.proj.entity.Project;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class ProjResponse {
	private Long proId;
	private Long comId;
	private Long empId;
	private String proStatus;
	private String proName;
	private String proDesc;
	private LocalDate startDate;
	private LocalDate endDate;
	private LocalDate actualStartDate;
	private LocalDate actualEndDate;
	private String createdAt;
	private String updatedAt;

	// 조회(JOIN) 결과 전용 - DB에 없는 컬럼
	private String empName;
	private Integer memberCnt;

	// insert, update, select 결과물 - Entity 전체 필드를 그대로 옮김
	public ProjResponse(Project project) {
		this.proId = project.getProId();
		this.comId = project.getCompany().getComId();
		this.empId = project.getEmployee().getEmpId();
		this.proStatus = project.getProStatus();
		this.proName = project.getProName();
		this.proDesc = project.getProDesc();
		this.startDate = project.getStartDate();
		this.endDate = project.getEndDate();
		this.actualStartDate = project.getActualStartDate();
		this.actualEndDate = project.getActualEndDate();
		this.createdAt = project.getCreatedAt() != null ? project.getCreatedAt().toString() : null;
		this.updatedAt = project.getUpdatedAt() != null ? project.getUpdatedAt().toString() : null;
	}

	// 목록 조회(JOIN, native query)용 - empName, memberCnt까지 채운 생성자
	public ProjResponse(Project project, String empName, Integer memberCnt) {
		this(project);
		this.empName = empName;
		this.memberCnt = memberCnt;
	}
}
