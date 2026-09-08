package com.sb.erp.sal.dto.response;

import java.time.LocalDateTime;

import com.sb.erp.sal.entity.SalPlcyDoc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 정책 문서 메타 정보 응답.
 * fullText/청크 임베딩은 절대 노출하지 않는다(ResumeChunk와 동일한 원칙 — 원문 노출은 최소화하고,
 * 조항 원문은 chat 응답의 references(snippet)로만 필요한 만큼 노출한다).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalPlcyDocResponse {

    private Long docId;
    private Long comId;
    private String title;
    private Integer docVersion;
    private boolean actv;
    private String srcFileName;
    private String srcFileUrl;
    private int chunkCount;
    private LocalDateTime createdAt;

    public static SalPlcyDocResponse from(SalPlcyDoc entity) {
        return SalPlcyDocResponse.builder()
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
