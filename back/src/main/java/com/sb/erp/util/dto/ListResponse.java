package com.sb.erp.util.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 목록 조회 API 공통 응답 래퍼.
 * 페이지네이션 계산은 기존 PagingUtil 그대로 사용하고,
 * 여기에 실제 목록 데이터(items)만 얹어서 REST 응답으로 내려준다.
 */
@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class ListResponse<T> {
	private PagingUtil paging;
	private List<T> items;
}