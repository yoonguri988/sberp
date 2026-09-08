package com.sb.erp.sal.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalMealAlwPlcy;

@Repository
public interface SalaryMealAllowancePolicyRepository extends JpaRepository<SalMealAlwPlcy, Long> {

    /** comId 스코프의 식대 정책 중 payMonth 시점에 유효한 것 조회 (comId 전용 정책) */
    @Query("select m from SalMealAlwPlcy m " +
            "where m.comId = :comId " +
            "and m.effFrom <= :payMonth and (m.effTo is null or m.effTo >= :payMonth)")
    Optional<SalMealAlwPlcy> findApplicableByCom(@Param("comId") Long comId, @Param("payMonth") LocalDate payMonth);

    /** comId 전용 정책이 없을 때 사용할 전사 공통 기본값(comId가 NULL인 행) */
    @Query("select m from SalMealAlwPlcy m " +
            "where m.comId is null " +
            "and m.effFrom <= :payMonth and (m.effTo is null or m.effTo >= :payMonth)")
    Optional<SalMealAlwPlcy> findApplicableFallback(@Param("payMonth") LocalDate payMonth);

    Optional<SalMealAlwPlcy> findByComIdAndEffToIsNull(Long comId);

    List<SalMealAlwPlcy> findAllByOrderByComIdAscEffFromDesc();
}
