package com.sb.erp.task.dto.response;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TaskResponse {
	private Long taskId;
	private Long proId;
	private String proName;
	private Long comId;
	private Long pmId;
	private String pmName;
	private Long parentTaskId;
	private String taskName;
	private String taskDesc;
	private String taskStatus;
	private LocalDate taskStartDate;
	private LocalDate taskEndDate;
	private LocalDate actualStartDate;
	private LocalDate actualEndDate;
	private String createdAt;
	private String updatedAt;

	// 트리 조회 전용 - DB 컬럼 아님
	private Integer depth;             // 1=최상위, 2=자식, 3=손자...
	private String parentTaskStatus;   // 부모 태스크 상태

	// 프로젝트 기간 (내 태스크 목록에서 진행률 표시용)
	private LocalDate startDate;
	private LocalDate endDate;

	private boolean delayed;

	// Service에서 계산해서 세팅하는 값들 - setter 필요
	public void setDelayed(boolean delayed) {
		this.delayed = delayed;
	}
}
