package com.sb.erp.appr.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApprFormSearchCondition {
	private String keyword;
	private Long comId;
	private String comName;
	private Boolean forStatus;
	private int page = 1;
	
	// MyBatis 오프셋 계산용
	private int pstartno;
	private int onepagelist = 10;
}
