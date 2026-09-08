package com.sb.erp.emp.dto;

import lombok.Data;

@Data
public class EmpSearchDto {
	
	// ─── 검색 조건 ───────────
    private Integer deptId;      // 부서 필터
    private Integer posId;       // 직급 필터
    private String  empStatus;   // 재직 상태 (재직/휴직/퇴직)
    private String  keyword;     // 통합 키워드 (이름·사번·이메일·연락처)

    // ─── 회사 구분하기 ──────────
    private Integer comId;
    
    // ─── 페이징 ───────────────
    private Integer page;
    private int pstartno;        // LIMIT 시작 위치
    private int onepagelist;     // 한 페이지당 건수
    
}