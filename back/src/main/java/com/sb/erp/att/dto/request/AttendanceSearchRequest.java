package com.sb.erp.att.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter @Getter
public class AttendanceSearchRequest {
	
	@NotNull
    private LocalDate startDate;
	
	@NotNull
    private LocalDate endDate;
	
    private Long deptId;
    private Long empId;
    
}