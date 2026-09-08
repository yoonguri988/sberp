package com.sb.erp.apct.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.apct.dto.response.ApplicantResponse;
import com.sb.erp.apct.dto.response.MyApplicationResponse;
import com.sb.erp.apct.entity.Applicant;

@Repository
public interface ApplicantRepository extends JpaRepository<Applicant, Long>,
        JpaSpecificationExecutor<Applicant> {
	
	// 상태별 조회 apctStatus
	List<Applicant> findByApctStatus(String apctStatus);
	
	// 공고 삭제 전 지원자 존재 여부 체크
	boolean existsByRecruit_RecId(Long recId);
	
    // 대시보드용 - 상태별 지원자 수 집계
    @Query(
    value = """
            SELECT APCT_STATUS, COUNT(*) FROM APPLICANT
            WHERE COM_ID = :comId
            GROUP BY APCT_STATUS
            """,
    nativeQuery = true )
    List<Object[]> countByStatusGrouped(@Param("comId") Long comId);
    
    // 공고별 지원자 fit_score 순위 (적합도 높은 순, NULL은 맨 뒤로)
    @Query("""
        SELECT new com.sb.erp.apct.dto.response.ApplicantResponse(
            a.apctId, a.company.comId, a.recruit.recId, a.apctName, a.apctEmail, a.apctPhone,
            a.apctStatus, a.apctDate, a.createdAt, a.updatedAt, r.recTitle, rs.rsmFitScore)
        FROM Applicant a
        JOIN a.recruit r
        LEFT JOIN a.resumes rs
        WHERE a.recruit.recId = :recId
        ORDER BY CASE WHEN rs.rsmFitScore IS NULL THEN 1 ELSE 0 END, rs.rsmFitScore DESC
        """)
    Page<ApplicantResponse> findByRecIdOrderByFitScore(@Param("recId") Long recId, Pageable pageable);
    
    // 내 지원현황
    List<Applicant> findByProviderAndProviderId(String provider, String providerId);
    
    // 중복 지원 체크
    boolean existsByRecruit_RecIdAndProviderAndProviderId(Long recId, String provider, String providerId);
    
    // 내 지원현황 - 공고명 포함 조회
    @Query("""
            SELECT new com.sb.erp.apct.dto.response.MyApplicationResponse(
                a.apctId, r.recTitle, a.apctStatus, a.apctName, a.apctDate, a.apctEmail, a.apctPhone, rs.rsmFileName)
            FROM Applicant a
            JOIN a.recruit r
            LEFT JOIN a.resumes rs
            WHERE a.provider = :provider AND a.providerId = :providerId
            ORDER BY a.apctId DESC
            """)
    List<MyApplicationResponse> findMyApplications(@Param("provider") String provider,
                                                   @Param("providerId") String providerId);
    
    // 특정 지원자의 이력서 상세
    Optional<Applicant> findByApctIdAndRecruit_RecId( Long apctId, Long recId );

}