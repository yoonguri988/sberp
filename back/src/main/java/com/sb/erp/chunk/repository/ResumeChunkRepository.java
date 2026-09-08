package com.sb.erp.chunk.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.chunk.entity.ResumeChunk;

@Repository
public interface ResumeChunkRepository extends JpaRepository<ResumeChunk, Long>{
	
    // 특정 이력서의 청크 전체 조회
    List<ResumeChunk> findByResume_RsmIdOrderByChunkOrder(Long rsmId);

    // 특정 채용공고에 지원한 지원자들의 이력서 청크 조회
    List<ResumeChunk> findByResume_Applicant_Recruit_RecId(Long recId);
	
	// 기존 청크 삭제
	void deleteByResume_RsmId(Long rsmId);
	
}
