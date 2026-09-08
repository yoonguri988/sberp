package com.sb.erp.rsm.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.rsm.entity.Resume;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long>{

    // 지원자의 이력서 조회
    Optional<Resume> findByApplicant_ApctId(Long apctId);

    // AI 분석 상태별 이력서 조회
    List<Resume> findByRsmStatus(String rsmStatus);
}
