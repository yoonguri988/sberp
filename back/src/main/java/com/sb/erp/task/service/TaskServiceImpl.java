package com.sb.erp.task.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.global.integration.ReportApi;
import com.sb.erp.task.dto.request.TaskRequest;
import com.sb.erp.task.dto.request.TaskSearchRequest;
import com.sb.erp.task.dto.response.TaskResponse;
import com.sb.erp.task.repository.TaskMapper;
import com.sb.erp.week.dto.response.MyWeeklyReportResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskServiceImpl implements TaskService {
	private final TaskMapper dao;
	private final ReportApi reportApi;
		
	//태스크 추가
	@Override
	@Transactional
	public int insert(TaskRequest dto) {  return dao.insert(dto); }

	/*paging*/
	@Override public List<TaskResponse> selectAll(TaskSearchRequest search) {  return dao.selectAll(search); }
	@Override public int selectCnt(Long proId) {  return dao.selectCnt(proId); }
	
	//태스크 삭제
	@Override 
	@Transactional
	public int delete(Long taskId) {  return dao.delete(taskId); }
	
	//태스크 수정
	@Override 
	@Transactional
	public int update(TaskRequest dto) {  return dao.update(dto); }
	
	//태스크 상세조회
	@Override public TaskResponse select(Long taskId) {  return dao.select(taskId); }
	
	//태스크 수정뷰
	@Override public TaskResponse taskEditView(Long taskId) { return dao.select(taskId); }

	//태스크 주간 보고서
	@Override public MyWeeklyReportResponse myWeeklyReport(Long empId) {  return dao.myWeeklyReport(empId); }

	//지연 태스크 목록
	@Override public List<String> delayedTaskNames(Long empId) {  return dao.delayedTaskNames(empId); }
	
	//pdf보고서 생성
	@Override public byte[] createMyWeeklyReport(MyWeeklyReportResponse dto) {
	    return reportApi.createMyWeeklyReport(dto); }
	
	//내 태스크 목록조회 paging
	@Override public List<TaskResponse> selectMyTasks(TaskSearchRequest search) {  return dao.selectMyTasks(search); }
	@Override public int selectMyTasksCount(TaskSearchRequest search) {  return dao.selectMyTasksCount(search); }

	//태스크 목록
	@Override public List<TaskResponse> selectTaskList(Long proId) {  return dao.selectTaskList(proId); }


	
	
	
}
