package com.sb.erp.rec.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RecruitSearchRequest {
    private Long comId;          // 로그인 사용자 회사 (컨트롤러에서 강제 세팅, ROOT면 null)
    private String recStatus;    // 공고 상태 필터 (OPEN, CLOSED 등, null이면 전체)
    private String recTitle;

    private int pstartno = 1;    // 요청 페이지 번호 (1부터 시작)
    private int onepagelist = 10; // 한 페이지당 목록 수

    // Pageable 변환 시 사용할 offset 계산 (0-base)
    public int getPageIndex() {
        return (pstartno - 1) < 0 ? 0 : (pstartno - 1);
    }
}