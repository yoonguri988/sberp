package com.sb.erp.proj.dto.response;

import java.time.LocalDate;

import com.sb.erp.proj.entity.ProjectMember;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter	@NoArgsConstructor
public class ProjmemResponse {
	private Long pmId;
	private Long projectProId;
	private Long empId;
	private String empName;
	private String proName;
	private String deptName;
	private String memberRole;
	private LocalDate joinedAt;

	// insert, update, select 결과물 - Entity 변환용
	public ProjmemResponse(ProjectMember member) {
		this.pmId = member.getPmId();
		this.projectProId = member.getProject().getProId();
		this.empId = member.getEmployee().getEmpId();
		this.empName = member.getEmployee().getEmpName();
		this.proName = member.getProject().getProName();
		this.memberRole = member.getMemberRole();
		this.joinedAt = member.getJoinedAt();
	}

	// 목록 조회(JOIN, native query)용 - deptName까지 채운 생성자
	public ProjmemResponse(ProjectMember member, String deptName) {
		this(member);
		this.deptName = deptName;
	}
}
