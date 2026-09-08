package com.sb.erp.pos.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PosResponse {
	private Long posId;
	private String posCode;
	private String posName;
	private int posOrder;
	private Long comId;
}
