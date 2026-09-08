package com.sb.erp.perm.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class PermResponse {
	private long autId;
	private String autName;
	private long comId;      // 수정 시 회사 격리 검증용
	private int autCount;    // 부여된 사원 수 (selectAll 시 조인 집계)
}
