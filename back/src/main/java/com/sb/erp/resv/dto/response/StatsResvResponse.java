package com.sb.erp.resv.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatsResvResponse {
	private long resvTotal;
	private long waiTotal;
	private long appTotal;
	private long rejTotal;
	private long noRetTotal;
}