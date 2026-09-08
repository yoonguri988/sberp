package com.sb.erp.proj.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

import com.sb.erp.dashboard.member.dto.response.DashboardProjResponse;
import com.sb.erp.proj.dto.request.ProjRequest;
import com.sb.erp.proj.dto.request.ProjectSearchRequest;
import com.sb.erp.proj.dto.response.ProjResponse;
import com.sb.erp.proj.dto.response.ProjectAnalysisResponse;
import com.sb.erp.week.dto.response.WeeklyReportResponse;

@Mapper
public interface ProjectMapper {
	// 프로젝트 등록
	public int insert(ProjRequest dto);

	//프로젝트 상세보기
	public ProjResponse select(Long proId);
	
	//프로젝트 삭제
	public int deleteTaskByProjectId(Long proId);
	public int deleteMemberByProjectId(Long proId);
	public int deleteProject(Long proId);
	
	//프로젝트 수정
	public int update(ProjRequest dto);
	
	/* paging */
	public List<ProjResponse> selectAll(ProjectSearchRequest search);
	public int selectCnt(ProjectSearchRequest search);

	
	//Ai 프로젝트 분석용
	public ProjectAnalysisResponse projectAnalysis(Long proId);
	
	//주간 보고서용-팀장용
	public WeeklyReportResponse weeklyReport(Long proId);
	
	//주간 보고서용으로 가져올 프로젝트들
	public List<Integer>selectActiveProjectIds();
	
	// 대시보드용 - 내가 참여중인 진행중 프로젝트
	public List<DashboardProjResponse> selectMyProjects(@Param("empId") Long empId);
}