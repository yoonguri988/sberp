package com.sb.erp.sal.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalPosAlw;

@Repository
public interface SalaryPositionAllowanceRepository extends JpaRepository<SalPosAlw, Long> {

    /** comId + posCode 기준, payMonth 시점에 유효한 직책수당 정책 조회 */
    @Query("select a from SalPosAlw a " +
            "where a.comId = :comId and a.pos = :pos " +
            "and a.effFrom <= :payMonth and (a.effTo is null or a.effTo >= :payMonth)")
    Optional<SalPosAlw> findApplicable(@Param("comId") Long comId,
                                                   @Param("pos") String pos,
                                                   @Param("payMonth") LocalDate payMonth);

    /** 동일 comId+pos 조합 중 아직 종료되지 않은 최신 버전 - 신규 등록 시 이전 버전 종료 처리용 */
    Optional<SalPosAlw> findByComIdAndPosAndEffToIsNull(Long comId, String pos);

    List<SalPosAlw> findAllByComIdOrderByPosAscEffFromDesc(Long comId);
}
