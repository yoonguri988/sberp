package com.sb.erp.appr.dto.response;

import java.util.List;

import lombok.Getter;

@Getter
public class ApprFormListResponse {
	private List<ApprFormResponse> content;
	private int page;
	private int pageSize;
	private int totalCount;
	private int totalPages;
	
	public ApprFormListResponse(List<ApprFormResponse> content, int page,
								int pageSize, int totalCount) {
		this.content = content;
		this.page = page;
		this.pageSize = pageSize;
		this.totalCount = totalCount;
		this.totalPages = pageSize == 0 ?
						  0 : (int) Math.ceil((double) totalCount / pageSize );
	}
}
