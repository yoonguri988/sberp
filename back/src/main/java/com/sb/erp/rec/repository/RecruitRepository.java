package com.sb.erp.rec.repository;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.rec.entity.Recruit;

@Repository
public interface RecruitRepository extends JpaRepository<Recruit, Long>,
JpaSpecificationExecutor<Recruit> // JpaSpecificationExecutor: Specification(조건 조립기, RecruitSpecs 참고)을 받아서
								  // findAll(spec, pageable)로 동적 검색을 가능하게 해주는 인터페이스.
								  // comId는 항상 + recStatus는 선택적으로 필터링해야 해서 필요함.
{

	// 공개용 - 특정 회사의 OPEN 공고만 목록 조회 (비회원 지원자용)
	Page<Recruit> findByCompany_ComIdAndRecStatus(Long comId, String recStatus, Pageable pageable);
	
	// 공개용 - 검색결과
	long countByCompany_ComIdAndRecStatus(Long comId, String recStatus);
	
	// 채용공고 상태 자동 Lifecycle 관리
	@Modifying
	@Query("UPDATE Recruit r SET r.recStatus = 'CLOSED' " +
	       "WHERE r.recEndDate < :today AND r.recStatus NOT IN ('CLOSED', 'CANCELLED')")
	int bulkCloseExpired(@Param("today") LocalDate today);

	@Modifying
	@Query("UPDATE Recruit r SET r.recStatus = 'OPEN' " +
	       "WHERE r.recStartDate <= :today AND r.recStatus = 'UPCOMING'")
	int bulkOpenStarted(@Param("today") LocalDate today);

}
