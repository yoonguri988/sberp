package com.sb.erp.com.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class StatsComResponse {
	private long comTotal;
	private long empTotal;
	private long industTotal;
	private String comLatest;
	
	public StatsComResponse(long comTotal, long empTotal, long industTotal, String comLatest) {
		super();
		this.comTotal = comTotal;
		this.empTotal = empTotal;
		this.industTotal = industTotal;
		this.comLatest = comLatest;
	}
}
