package com.sb.erp.emp.chatbot.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.emp.chatbot.entity.HrPlcyChunk;

@Repository
public interface HrPlcyChunkRepository extends JpaRepository<HrPlcyChunk, Long> {

    // 특정 문서의 청크 전체(순서대로) — 문서 삭제/재분석 확인용
    List<HrPlcyChunk> findByDoc_DocIdOrderByChunkOrder(Long docId);

    // ★ RAG 검색 대상 청크 전체 (회사 스코프, 현재 유효 문서만)
    // 유사도 계산은 Java에서 코사인 유사도로 직접 수행
    // (SalPlcyChunkRepository, ResumeChunkRepository와 동일 패턴)
    List<HrPlcyChunk> findByDoc_ComIdAndDoc_ActvTrue(Long comId);
}
