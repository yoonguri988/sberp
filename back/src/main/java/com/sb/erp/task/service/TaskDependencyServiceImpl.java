package com.sb.erp.task.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.proj.dto.response.ProjResponse;
import com.sb.erp.proj.repository.ProjectMapper;
import com.sb.erp.task.dto.request.TaskRequest;
import com.sb.erp.task.dto.response.TaskResponse;
import com.sb.erp.task.repository.TaskDependencyMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskDependencyServiceImpl implements TaskDependencyService{
	private final TaskDependencyMapper dao;
	private final ProjectMapper projectMapper;
	
	//선행 태스크를 지정하여 태스크 생성
	@Override 
	@Transactional
	public int insertWithParent(TaskRequest dto) {  
		
		//프로젝트 done이면 태스크 못넣게
		ProjResponse project = projectMapper.select(dto.getProId());
		if (project != null && "DONE".equals(project.getProStatus())) {
			throw new IllegalStateException("완료된 프로젝트에는 태스크를 추가할 수 없습니다.");
		}
		if(dto.getParentTaskId()!=null) {
			List<TaskResponse> tasks=dao.selectTaskDependencies(dto.getProId());
			TaskResponse parent = tasks.stream()
							.filter(t->t.getTaskId().equals(dto.getParentTaskId()))
							.findFirst()
							.orElseThrow(()->new IllegalArgumentException("지정한 선행 태스크가 존재하지 않습니다."));
			if(dto.getTaskStartDate().isBefore(parent.getTaskEndDate())) {
				throw new IllegalArgumentException("비지니스 제약 오류:시작일은 선행 작업 종료일 이후여야 합니다.");
			}
		}
		
		return dao.insertWithParent(dto); 
		}
	
	//태스크 의존성 트리 조회
	@Override public List<TaskResponse> selectTaskDependencies(Long proId) {  return dao.selectTaskDependencies(proId); }
	
	//태스크 일정 및 선행 태스크 수정
	@Override 
	@Transactional
	public int updateTaskSchedule(TaskRequest dto) {  
		
		 // 연쇄 일정 계산 중 동시 수정 방지를 위해, 수정 대상 태스크 + 자손만 잠금(FOR UPDATE WAIT 5)
		 // (프로젝트 전체를 잠그면 관계없는 태스크 수정까지 막혀서 범위를 좁힘 - START WITH ~ CONNECT BY)
		 // FOR UPDATE WAIT 5: 5초 넘게 락이 안 풀리면 무한 대기 대신 예외를 던지도록 타임아웃 설정
	    try {
	        dao.lockProjectTasks(dto.getTaskId());
	    } catch (Exception e) {
    	 // 여기서는 Exception으로 잡아도 안전함: 이 시점에 터질 수 있는 예외는 
         // "락 획득 실패(타임아웃)" 딱 하나뿐이라 의미가 명확하기 때문.
         // → 넓게 잡는 게 항상 나쁜 건 아니고, "예상 가능한 예외가 확실히 하나뿐"일 때는 괜찮음.
         throw new IllegalStateException("다른 사용자가 이 태스크의 일정을 수정 중입니다. 잠시 후 다시 시도해주세요.");
	    }
		 //프로젝트 done이면 태스크 못넣게
		 ProjResponse project = projectMapper.select(dto.getProId());
		 if (project != null && "DONE".equals(project.getProStatus())) {
		        throw new IllegalStateException("완료된 프로젝트에는 태스크를 수정할 수 없습니다.");
		 }
		//1)순환 참조(데드락)방지 체크
		if(dto.getParentTaskId()!=null && isCyclic(dto.getTaskId(),dto.getParentTaskId(),dto.getProId())) {
			throw new IllegalArgumentException("일정 데드락 위험:순환 의존성을 형성할 수 없습니다.");
		}
		
		//2)단일 태스크 단일 수정 실행
		int result = dao.updateTaskSchedule(dto);
		
		//3)전체 태스크 목록 재조회(선행->후행 순 정렬된 상태)
		List<TaskResponse> allTasks = dao.selectTaskDependencies(dto.getProId());
		
		//4)연쇄적으로 밀려야 하는 후속 태스크들만 추려서 리스트에 담기
		List<TaskResponse> targetList = new ArrayList<>();
		
		for(TaskResponse task : allTasks) {
			if(task.getParentTaskId()==null) {continue;}
			TaskResponse parent = allTasks.stream()
									 .filter(t->t.getTaskId().equals(task.getParentTaskId()))
									 .findFirst()
									 .orElse(null);
			if(parent ==null) {continue;}//부모 못 찾으면 건너뜀(NPE 방지)
			if(parent.getTaskEndDate().isAfter(task.getTaskStartDate()))
			{
				long taskDuration = ChronoUnit.DAYS.between(task.getTaskStartDate(), task.getTaskEndDate());
				LocalDate nextStartDate = parent.getTaskEndDate().plusDays(1);
				LocalDate nextEndDate = nextStartDate.plusDays(taskDuration);
				
				task.setTaskStartDate(nextStartDate);
				task.setTaskEndDate(nextEndDate);
				targetList.add(task);
			}		
		}		//5)밀린 태스크가 있으면 벌크 업데이트 실행
				if(!targetList.isEmpty()) {dao.updateBatchTaskSchedule(targetList);}
		
		
		return result; }

	//벌크 연쇄 업데이트
	@Override 
	@Transactional
	public void updateBatchTaskSchedule(List<TaskResponse> list) { dao.updateBatchTaskSchedule(list); }

	// DFS 기반 순환 참조 역방향 추적
	private boolean isCyclic(Long taskId,Long parentTaskId,Long proId) {

		List<TaskResponse> list = dao.selectTaskDependencies(proId);
		Long pointer = parentTaskId;

		while (pointer != null) {
			if (pointer.equals(taskId)) {
				return true;
			}
			final Long currentFindId = pointer;
			pointer = list.stream()
			        .filter(t -> t.getTaskId().equals(currentFindId))
			        .findFirst()
			        .map(TaskResponse::getParentTaskId)
			        .orElse(null);
		}
		return false;
	}
	
	//후속 작업 리스트
	@Override public List<TaskResponse> selectImpactTasks(Long taskId) {  return dao.selectImpactTasks(taskId); }

	// 핵심 병목(Critical Path) 탐색
	// 기준: "본인은 지연됐지만 부모는 지연되지 않은" 태스크 = 지연의 시발점(진짜 원인)
	// - 부모가 이미 늦은 경우의 자식 지연은 캐스케이드로 인한 "결과"일 뿐, 병목(원인)으로 보지 않음
	// - 지연 여부 판단: actualEndDate가 있으면 그 값, 없으면 오늘 날짜를 taskEndDate(계획)와 비교
	@Override 
	public List<TaskResponse> findCriticalPath(Long proId) {

	    List<TaskResponse> allTasks = dao.selectTaskDependencies(proId);

	    Map<Long, TaskResponse> taskMap = allTasks.stream()
	            .collect(Collectors.toMap(TaskResponse::getTaskId, t -> t));

	    List<TaskResponse> bottlenecks = new ArrayList<>();

	    for (TaskResponse task : allTasks) {

	        // 1) 이 태스크 자체가 지연됐는지 (완료됐으면 실제 종료일, 진행중이면 오늘 날짜로 판단)
	        LocalDate compareDate = task.getActualEndDate() != null
	                ? task.getActualEndDate()
	                : LocalDate.now();
	        boolean isSelfDelayed = compareDate.isAfter(task.getTaskEndDate());

	        if (!isSelfDelayed) continue; // 안 늦었으면 애초에 병목 후보 아님

	        // 2) 부모가 없거나(최상위), 부모는 "자기 탓 지연"이 아니어야 진짜 원인
	        TaskResponse parent = task.getParentTaskId() == null 
	                ? null 
	                : taskMap.get(task.getParentTaskId());

	        boolean parentDelayed;
	        if (parent == null) {
	            parentDelayed = false; // 부모 없음 = 부모 탓일 수 없음
	        } else {
	            LocalDate parentCompareDate = parent.getActualEndDate() != null
	                    ? parent.getActualEndDate()
	                    : LocalDate.now();
	            parentDelayed = parentCompareDate.isAfter(parent.getTaskEndDate());
	        }

	        // 부모가 안 늦었는데 나만 늦었다 = 지연의 시발점(진짜 병목)
	        if (!parentDelayed) {
	            bottlenecks.add(task);
	        }
	    }

	    return bottlenecks; // 병목 태스크 목록 (여러 개일 수 있음 - 가지가 여러 개면)
	}
	
	
}
