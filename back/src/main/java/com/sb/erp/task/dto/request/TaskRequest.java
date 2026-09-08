package com.sb.erp.task.dto.request;

import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class TaskRequest {

    @NotNull(message = "프로젝트는 필수입니다.")
    private Long proId;

	@Schema(hidden = true)
    //@NotNull(message = "회사 정보는 필수입니다.")
    private Long comId;

    @NotNull(message = "담당자는 필수입니다.")
    private Long pmId;
    
    @Schema(hidden = true)
    private Long taskId;

    // 부모 태스크는 선택사항
    private Long parentTaskId;

    @NotBlank(message = "태스크명을 입력하세요.")
    private String taskName;

    @NotBlank(message = "태스크 설명을 입력하세요.")
    private String taskDesc;

    @NotBlank(message = "상태를 선택하세요.")
    @Pattern( regexp = "^(TODO|DOING|DONE)$", message = "상태는 TODO, DOING, DONE만 가능합니다." )
    private String taskStatus;

    @NotNull(message = "시작일을 입력하세요.")
    private LocalDate taskStartDate;

    @NotNull(message = "종료일을 입력하세요.")
    private LocalDate taskEndDate;
}
/*	private Integer taskId;
	private Integer proId;
	private Integer comId;
	private String taskName;
	private String taskDesc;
	private String taskStatus;
	private Integer pmId;
	private String pmName;
	private LocalDate taskStartDate;
	private LocalDate taskEndDate;
	private LocalDate actualStartDate; // 실제 착수일
	private LocalDate actualEndDate; //실제 완요일
	private LocalDate createdAt;
	private LocalDate updatedAt;
	private Integer parentTaskId;
	private String proName;
	private Integer depth; //후속작업 목록-트리 구조를 보여주기 위한 용도
	private String parentTaskStatus; //부모 태스크의 상태
	
	//프로젝트 기간
	private LocalDate startDate;
	private LocalDate endDate;
	
    // 지연 여부
    private boolean delayed;*/