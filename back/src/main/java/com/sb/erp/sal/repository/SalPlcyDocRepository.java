package com.sb.erp.sal.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalPlcyDoc;

@Repository
public interface SalPlcyDocRepository extends JpaRepository<SalPlcyDoc, Long> {

    // 회사별 "현재 유효(RAG 검색 대상)" 정책 문서 - actv=1은 항상 1건 이하
    Optional<SalPlcyDoc> findByComIdAndActvTrue(Long comId);

    // 개정 이력 포함 전체 조회(관리자용) - 최신 버전이 먼저
    List<SalPlcyDoc> findAllByComIdOrderByDocVersionDesc(Long comId);
}
