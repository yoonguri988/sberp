package com.sb.erp.emp.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeTransferItemFormReponse {
	private Integer empId;
	private Integer newDeptId;
	 
	/** 최종 제출 시점의 select 값이 AI 추천 deptId와 같으면 "Y", 수동으로 바꿨으면 "N" (화면 JS에서 세팅) */
	private String aiRecommended = "N";
}
