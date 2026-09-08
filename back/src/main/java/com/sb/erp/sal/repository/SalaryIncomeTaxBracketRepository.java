package com.sb.erp.sal.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalIncTaxBrkt;

@Repository
public interface SalaryIncomeTaxBracketRepository extends JpaRepository<SalIncTaxBrkt, Long> {

    /** baseSal이 속하는 구간(하한 포함, 상한 미포함) 중, payMonth 시점에 유효한 구간 1건 조회 */
    @Query("select b from SalIncTaxBrkt b " +
            "where b.minAmt <= :baseSal and (b.maxAmt is null or b.maxAmt > :baseSal) " +
            "and b.effFrom <= :payMonth and (b.effTo is null or b.effTo >= :payMonth)")
    Optional<SalIncTaxBrkt> findApplicable(@Param("baseSal") Long baseSal, @Param("payMonth") LocalDate payMonth);

    /**
     * 동일한 구간(min_amt, max_amt)에서 현재 유효 중인(eff_to가 NULL인) 이력 1건 조회.
     * 신규 구간 등록 시 이 이력을 종료 처리(closeAsHistory)하기 위해 사용한다.
     * max_amt는 NULL(상한 없음)일 수 있으므로 양쪽 다 NULL인 경우도 동일 구간으로 취급한다.
     */
    @Query("select b from SalIncTaxBrkt b " +
            "where b.minAmt = :minAmt " +
            "and ((:maxAmt is null and b.maxAmt is null) or b.maxAmt = :maxAmt) " +
            "and b.effTo is null")
    Optional<SalIncTaxBrkt> findActiveByRange(@Param("minAmt") Long minAmt, @Param("maxAmt") Long maxAmt);

    List<SalIncTaxBrkt> findAllByOrderByMinAmtAsc();
}