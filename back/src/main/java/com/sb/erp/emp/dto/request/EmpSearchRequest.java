package com.sb.erp.emp.dto.request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class EmpSearchRequest {

	// ─── 검색 조건 ───
	private String keyword;      // 이름/사번/이메일/연락처 통합 검색
	private String empStatus;    // 재직/휴직/퇴직
	private String posCode;
	private String deptName;
	private Long deptId;         // 부서 필터 (숫자 ID)
	private Long posId;          // 직급 필터 (숫자 ID)

	// ─── 회사 격리 (컨트롤러/서비스에서 세팅) ───
	private Long comId;

	// ─── 페이징 ───
	private Integer page;        // 사용자가 요청한 페이지 (1-based)
	private int onepagelist = 10;
	private int pstartno = 1;
}