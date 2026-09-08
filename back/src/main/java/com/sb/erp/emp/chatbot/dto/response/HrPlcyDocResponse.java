package com.sb.erp.emp.chatbot.dto.response;

import java.time.LocalDateTime;

import com.sb.erp.emp.chatbot.entity.HrPlcyDoc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
관리자 문서 업로드/목록 조회
fullText/청크 임베딩은 노출하지 않는다.
조항 원문은 chat 응답의 references(snippet)로만 필요한 만큼 노출.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HrPlcyDocResponse {

    private Long docId;
    private Long comId;
    private String title; 		// 문서의 제목(예: "2026년 근무 가이드")
    private Integer docVersion;	// 개정 차수
    private boolean actv;		// 현재 유효한 문서인지
    private String srcFileName;	// 원본 파일명 — 관리자가 뭘 올렸는지 확인용
    private String srcFileUrl;	// 다운로드 링크
    private int chunkCount;		// 청크가 몇개로 분할되었는지, 색인 상태 확인용
    private LocalDateTime createdAt;

    public static HrPlcyDocResponse from(HrPlcyDoc entity) {
        return HrPlcyDocResponse.builder()
                .docId(entity.getDocId())
                .comId(entity.getComId())
                .title(entity.getTitle())
                .docVersion(entity.getDocVersion())
                .actv(entity.isActv())
                .srcFileName(entity.getSrcFileName())
                .srcFileUrl(entity.getSrcFileUrl())
                .chunkCount(entity.getChunks() == null ? 0 : entity.getChunks().size())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

/*

chunkCount: 관리자가 PDF를 올린 뒤 정상적으로 분석됐는지 확인하는 지표
0이면 청킹에 실패, 지나치게 적거나 많으면 청크 분할 로직을 점검해야 한다는 신호
fullText와 chunkEmbedding은 내부 데이터라 API 응답으로 노출할 이유가 없다.

*/
