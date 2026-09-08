package com.sb.erp.emp.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class EmpTransferResponse {
    private Long empId;
    private String empNo;
    private String empName;
    private String posName;
    private Integer posOrder;
    private String empStatus;
    
	public EmpTransferResponse(Long empId, String empNo, String empName, String posName, Integer posOrder,
			String empStatus) {
		super();
		this.empId = empId;
		this.empNo = empNo;
		this.empName = empName;
		this.posName = posName;
		this.posOrder = posOrder;
		this.empStatus = empStatus;
	}
}
