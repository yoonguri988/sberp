package com.sb.erp.eval.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class PeriodSearchRequest {
	private Long comId;
	private Integer evalYear;
	private String evalTerm;
	private String periodStatus;
	private String keyword;

	private int onepagelist = 10;
	private int pstartno = 1;
}
