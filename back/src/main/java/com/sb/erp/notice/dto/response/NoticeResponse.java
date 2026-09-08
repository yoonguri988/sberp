package com.sb.erp.notice.dto.response;

import lombok.Getter;
import lombok.Setter;


@Getter @Setter
public class NoticeResponse {
	private Long bno;
	private String btitle;
	private String bcontent;
	private Integer bhit;
	private String bfile;
	private String createdAt;
	private String updatedAt;

	private Long empId;
	private Long comId;

	// 조회(JOIN) 결과 전용 - DB에 없는 컬럼
	private String empName;

	public boolean isUrgent() {
		return bcontent != null && bcontent.contains("긴급");
	}
}
