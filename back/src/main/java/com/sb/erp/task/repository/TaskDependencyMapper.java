package com.sb.erp.task.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.sb.erp.task.dto.request.TaskRequest;
import com.sb.erp.task.dto.response.TaskResponse;

@Mapper
public interface TaskDependencyMapper {
	
   //선행 태스크를 지정하여 태스크 생성
   public int insertWithParent(TaskRequest dto);
   
   //태스크 의존성 트리 조회
   public List<TaskResponse> selectTaskDependencies(Long proId);
   
   //태스크 일정 및 선행 태스크 수정
   public int updateTaskSchedule(TaskRequest dto);
   
   //벌크 연쇄 업데이트
   public void updateBatchTaskSchedule(List<TaskResponse> list);
   
   //후속 작업
   public List<TaskResponse> selectImpactTasks(Long taskId);
   
   //병목 탐색기
   public List<TaskResponse> findCriticalPath(Long proId);
   
   //동일 프로젝트의 태스크를 수정하는 동안 다른 사용자의 동시 수정을 방지하기 위해 행 잠금 획득
   public List<Long> lockProjectTasks(Long taskId);
	
}
