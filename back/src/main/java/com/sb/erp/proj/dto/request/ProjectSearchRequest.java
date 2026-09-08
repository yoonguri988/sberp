package com.sb.erp.proj.dto.request;


import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ProjectSearchRequest {
	private String keyword;
	private String proStatus;
	private String startDate;
	private String endDate;
	
	private int pstartno = 1;
	private int onepagelist = 10;
	
	private boolean searched = false;
	//일반 사용자용
	private Long comId;
	
	// 검색 조건이 비어있는지 확인 여부
	public boolean hasSearchCondition() {
		return (keyword != null && !keyword.isEmpty())
				|| (proStatus != null && !proStatus.isEmpty())
				|| (startDate != null && !startDate.isEmpty())
				|| (endDate != null && !endDate.isEmpty());
	        // 검색 필드 추가될 때마다 여기에 || 조건 추가
	}	
}
