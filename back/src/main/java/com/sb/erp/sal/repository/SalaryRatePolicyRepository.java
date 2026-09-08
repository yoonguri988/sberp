package com.sb.erp.sal.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalRatePlcy;

@Repository
public interface SalaryRatePolicyRepository extends JpaRepository<SalRatePlcy, Long> {

    /** payMonth 시점에 유효한 4대보험 요율 정책 1건 조회 (전역 정책, comId 없음) */
    @Query("select p from SalRatePlcy p " +
            "where p.effFrom <= :payMonth and (p.effTo is null or p.effTo >= :payMonth)")
    Optional<SalRatePlcy> findApplicable(@Param("payMonth") LocalDate payMonth);

    /** 특정 시점 기준 아직 종료되지 않은(effTo가 null인) 최신 정책 - 신규 등록 시 이전 버전 종료 처리용 */
    Optional<SalRatePlcy> findByEffToIsNull();

    List<SalRatePlcy> findAllByOrderByEffFromDesc();
}
