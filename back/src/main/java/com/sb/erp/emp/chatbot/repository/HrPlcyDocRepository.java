package com.sb.erp.emp.chatbot.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.emp.chatbot.entity.HrPlcyDoc;

@Repository
public interface HrPlcyDocRepository extends JpaRepository<HrPlcyDoc, Long> {

    // 회사별 "현재 유효(RAG 검색 대상)" HR 규정 문서 — actv=1은 항상 1건 이하
    // (DDL의 ux_hr_plcy_doc_actv 유니크 인덱스가 DB 레벨에서 보장)
    Optional<HrPlcyDoc> findByComIdAndActvTrue(Long comId);

    // 개정 이력 포함 전체 조회(관리자용) — 최신 버전이 먼저
    List<HrPlcyDoc> findAllByComIdOrderByDocVersionDesc(Long comId);
}
