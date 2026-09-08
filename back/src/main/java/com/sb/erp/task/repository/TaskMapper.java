package com.sb.erp.task.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.task.dto.request.TaskRequest;
import com.sb.erp.task.dto.request.TaskSearchRequest;
import com.sb.erp.task.dto.response.TaskResponse;
import com.sb.erp.week.dto.response.MyWeeklyReportResponse;

@Mapper
public interface TaskMapper {
	//태스크 등록
	public int insert(TaskRequest dto);
	
	//해당 프로젝트-태스크 페이징
	public List<TaskResponse> selectAll(TaskSearchRequest search);
	public int selectCnt (Long proId);
	
	//태스크 삭제
	public int delete(Long taskId);
	
	//태스크 수정
	public int update(TaskRequest dto);
	
	//태스크 상세
	public TaskResponse select(Long taskId);
	
	//태스크 주간 보고서
	public MyWeeklyReportResponse myWeeklyReport(@Param("empId") Long empId);
	
	//지연 태스크 목록
	public List<String>delayedTaskNames(@Param("empId")Long empId);
	
	//pdf보고서 생성
	public byte[] createMyWeeklyReport(MyWeeklyReportResponse dto);
	
	//내 태스크 목록조회
	public List<TaskResponse> selectMyTasks(TaskSearchRequest search);
	public int selectMyTasksCount(TaskSearchRequest search);
	
	//태스크 목록
	public List<TaskResponse> selectTaskList(Long proId);
	
}
