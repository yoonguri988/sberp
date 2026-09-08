package com.sb.erp.rsm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ResumeSearchResponse {
    
    // 지원자 ID
    private Long apctId;

    // 이력서 ID
    private Long rsmId;
    
    // 지원자 이름
    private String apctName;

    // 검색에 매칭된 청크 내용
    private String chunkText;

    // 검색어와 해당 청크의 유사도
    private double similarity;
}