package com.sb.erp.att.dto.request;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter @Getter 
public class AttendanceRequest {
	

	private LocalDateTime checkIn; // 출근
	private LocalDateTime checkOut; // 퇴근
	private String attStatus; // 상태
	
	private Long empId; 
	
	@NotBlank(message = "사번은 필수입니다.")
	private String empNo;
	
	@NotNull(message = "근무일은 필수입니다.")
	private LocalDate attDate; // 근무일

}