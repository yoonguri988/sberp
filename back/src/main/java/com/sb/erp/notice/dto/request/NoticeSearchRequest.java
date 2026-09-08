package com.sb.erp.notice.dto.request; 

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class NoticeSearchRequest {
	private Long empId;
	private Long comId;
	private String keyword;
	private String sortBy = "new";
	private List<Integer> pinnedBnos = new ArrayList<>();// 긴급 공지 상단 고정 시 제외할 bno 목록
	// 페이징
	private int pstartno = 1;
	private int onepagelist = 10;
	
	// 검색 조건이 비어있는지 확인 여부
	public boolean hasSearchCondition() {
		return (keyword != null && !keyword.isEmpty())
		    || (sortBy != null && !sortBy.isEmpty());
	        // 검색 필드 추가될 때마다 여기에 || 조건 추가
	}	
}
