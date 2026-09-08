package com.sb.erp.task.service;

import java.util.List;

import com.sb.erp.task.dto.request.TaskRequest;
import com.sb.erp.task.dto.request.TaskSearchRequest;
import com.sb.erp.task.dto.response.TaskResponse;
import com.sb.erp.week.dto.response.MyWeeklyReportResponse;

public interface TaskService {
	
	//태스크 추가
	public int insert(TaskRequest dto);
	
	//태스크 참여 명단 조회
	public List<TaskResponse> selectAll(TaskSearchRequest search);
	
	//태스크 개수 카운트
	public int selectCnt(Long proId);
	
	//태스크 삭제
	public int delete(Long taskId);
	
	//태스크 수정
	public int update(TaskRequest dto);
	
	//태스크 상세 조회
	public TaskResponse select(Long taskId);
	
	//태스크 수정뷰
	public TaskResponse taskEditView(Long taskId);
	
	//태스크 주간 보고서
	public MyWeeklyReportResponse myWeeklyReport(Long empId);
	
	//지연 태스크 목록
	public List<String>delayedTaskNames(Long empId);
	
	//pdf보고서 생성
	public byte[] createMyWeeklyReport(MyWeeklyReportResponse dto);
	
	//내 태스크 목록조회
	public List<TaskResponse> selectMyTasks(TaskSearchRequest search);
	public int selectMyTasksCount(TaskSearchRequest search);
	
	//태스크 목록
	public List<TaskResponse> selectTaskList(Long proId);
}
