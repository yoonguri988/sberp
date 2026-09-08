package com.sb.erp.att.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.sb.erp.att.entity.Attendance;
import com.sb.erp.emp.entity.Employee;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AttendanceResponse {
	
	//	목록/상세 조회 시
	private Long attId;
    private Long empId;
    private String empName;
    private String empNo;
    private String deptName;

    private LocalDate attDate;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private Integer workMinutes;
    private Integer overtimeMinutes;
    private Integer nightMinutes;
    private String attStatus;
    
    public static AttendanceResponse from(Attendance att) {
        AttendanceResponse res = new AttendanceResponse();
        res.attId = att.getAttId();
        res.attDate = att.getAttDate();
        res.checkIn = att.getCheckIn();
        res.checkOut = att.getCheckOut();
        res.workMinutes = att.getWorkMinutes();
        res.overtimeMinutes = att.getOvertimeMinutes();
        res.nightMinutes = att.getNightMinutes();
        res.attStatus = att.getAttStatus();

        Employee emp = att.getEmployee();
        res.empId = emp.getEmpId();
        res.empName = emp.getEmpName();
        res.empNo = emp.getEmpNo();
        res.deptName = (emp.getDepartment() != null) ? emp.getDepartment().getDeptName() : null;
        return res;
    }

}
