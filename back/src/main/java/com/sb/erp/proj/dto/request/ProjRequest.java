package com.sb.erp.proj.dto.request;

import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class ProjRequest {
	
	@Schema(hidden = true)
    //@NotNull(message = "회사 정보는 필수입니다.")
    private Long comId;

	@Schema(hidden = true)
    //@NotNull(message = "프로젝트 생성자는 필수입니다.")
    private Long empId;

    @Schema(hidden = true)
    private Long proId;

    @NotBlank(message = "프로젝트 상태는 필수입니다.")
    @Pattern( regexp = "^(TODO|DOING|DONE)$", message = "상태는 TODO, DOING, DONE만 가능합니다." )
    private String proStatus;

    @NotBlank(message = "프로젝트명은 필수입니다.")
    private String proName;

    private String proDesc;

    @NotNull(message = "시작일은 필수입니다.")
    private LocalDate startDate;

    @NotNull(message = "종료일은 필수입니다.")
    private LocalDate endDate;

}
/*	private Integer proId;
	private Integer comId;
	private Integer empId;
	private String proStatus;
	private String proName;
	private String proDesc;
	
	private LocalDate startDate;
	private LocalDate endDate;
	private LocalDate actualStartDate; //실제 착수일
	private LocalDate actualEndDate; //실제 완료일

	private LocalDate createdAt;
	private LocalDate updatedAt;
	
	private String empName;
	private Integer memberCnt; //프로젝트 멤버 인원 db값 존재하지않는 컬럼

	
	*/