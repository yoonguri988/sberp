package com.sb.erp.proj.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.global.integration.DiscordApi;
import com.sb.erp.global.integration.OpenAiGpt;
import com.sb.erp.global.integration.ReportApi;
import com.sb.erp.proj.dto.request.ProjRequest;
import com.sb.erp.proj.dto.request.ProjectSearchRequest;
import com.sb.erp.proj.dto.response.ProjResponse;
import com.sb.erp.proj.dto.response.ProjectAnalysisResponse;
import com.sb.erp.proj.repository.ProjectMapper;
import com.sb.erp.week.dto.response.WeeklyReportResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService{
	private final ProjectMapper dao;
	private final OpenAiGpt openAi;
	private final DiscordApi discordApi;
	private final ReportApi reportApi;

	//프로젝트 등록
	@Override
	@Transactional
	public int insert(ProjRequest dto) {  return dao.insert(dto); }

	//프로젝트 상세보기
	@Override public ProjResponse select(Long proId) {  return dao.select(proId); }
	
	//프로젝트 삭제
	@Override 
	@Transactional //세 쿼리 다 성공 → 트랜잭션 커밋 (전부 반영)
	public int delete(Long proId) {  
		 // 1. 태스크 삭제
		  dao.deleteTaskByProjectId(proId);

	     // 2. 프로젝트 멤버 삭제
		  dao.deleteMemberByProjectId(proId);

		 // 3. 프로젝트 삭제
		return  dao.deleteProject(proId); }
	
	//프로젝트 수정
	@Override 
	@Transactional
	public int edit(ProjRequest dto) {  return dao.update(dto); }
	
	//프로젝트 수정뷰
	@Override public ProjResponse editView(Long proId) {  return dao.select(proId); }

	/*paging*/
	@Override public List<ProjResponse> selectAll(ProjectSearchRequest search) {
		search.setPstartno((search.getPstartno()-1) * search.getOnepagelist());
		return dao.selectAll(search);
	}
	
    @Override public int selectCnt(ProjectSearchRequest search) { return dao.selectCnt(search); }

	//Ai 결과 보고서
	@Override public ProjectAnalysisResponse projectAnalysis(Long proId) {
		ProjectAnalysisResponse dto = dao.projectAnalysis(proId);
		if(dto==null) {return null;}
		long remainDays = ChronoUnit.DAYS.between(LocalDate.now(), dto.getEndDate());
		if(remainDays<0) {remainDays=0;}
		dto.setRemainDays(remainDays);
		return dto;
	}
	//디스코드 알람 전송
	@Override public String analyzeProject(Long proId) {
		ProjectAnalysisResponse dto = projectAnalysis(proId);
		if(dto==null) {return "프로젝트 정보를 찾을 수 없습니다.";}
		String result = openAi.analyzeProject(dto);
		if(result.contains("HIGH")) {discordApi.sendMessage("🚨 프로젝트 위험 감지 🚨\n\n" + result);}
				return result;
	}
	//주간 보고서
	@Override public WeeklyReportResponse weeklyReport(Long proId) {
		WeeklyReportResponse dto = dao.weeklyReport(proId);
	    if (dto == null) { return null; }
	    long remainDays = ChronoUnit.DAYS.between(LocalDate.now(), dto.getEndDate());
	    if (remainDays < 0) { remainDays = 0; }
	    dto.setRemainDays(remainDays);
	    return dto;
	} 
	
	//주간 보고서용으로 가져올 프로젝트들
	@Override public List<Integer> selectActiveProjectIds() {  return dao.selectActiveProjectIds(); }
	
}
