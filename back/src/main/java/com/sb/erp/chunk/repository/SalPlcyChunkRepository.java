package com.sb.erp.chunk.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.chunk.entity.SalPlcyChunk;

@Repository
public interface SalPlcyChunkRepository extends JpaRepository<SalPlcyChunk, Long> {

    // 특정 문서의 청크 전체(순서대로) - 문서 삭제/재분석 확인용
    List<SalPlcyChunk> findByDoc_DocIdOrderByChunkOrder(Long docId);

    // 검색 대상 청크 전체(회사 스코프, 현재 유효 문서만) - 유사도 계산은 Java에서(ResumeChunkRepository와 동일 패턴)
    List<SalPlcyChunk> findByDoc_ComIdAndDoc_ActvTrue(Long comId);
}
