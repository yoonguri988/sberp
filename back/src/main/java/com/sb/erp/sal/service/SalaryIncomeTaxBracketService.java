package com.sb.erp.sal.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.sal.dto.request.SalaryIncomeTaxBracketCreateRequest;
import com.sb.erp.sal.dto.response.SalaryIncomeTaxBracketResponse;
import com.sb.erp.sal.entity.SalIncTaxBrkt;
import com.sb.erp.sal.repository.SalaryIncomeTaxBracketRepository;

import lombok.RequiredArgsConstructor;

/**
 * 소득세 간이 구간표(sal_inc_tax_brkt) 관리. IncomeTaxCalculator가 이 값을 조회해 자동 산정한다.
 * 포트폴리오용 근사치이며 부양가족 수는 반영하지 않는다(응답의 disclaimer 문구 참고). ROOT 전용.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryIncomeTaxBracketService {

    private final SalaryIncomeTaxBracketRepository salaryIncomeTaxBracketRepository;

    @Transactional
    public SalaryIncomeTaxBracketResponse register(SalaryIncomeTaxBracketCreateRequest request) {
        // 동일 구간(min~max)에 유효 중이던(eff_to가 NULL인) 이력이 있다면 신규 구간 시작일 전날짜로 종료 처리(이력 보존)
        salaryIncomeTaxBracketRepository.findActiveByRange(request.getMinAmt(), request.getMaxAmt())
                .ifPresent(prev -> prev.closeAsHistory(request.getEffFrom().minusDays(1)));

        // 변경된 UPDATE 쿼리를 DB에 즉시 강제 반영
        salaryIncomeTaxBracketRepository.flush();

        SalIncTaxBrkt entity = SalIncTaxBrkt.builder()
                .minAmt(request.getMinAmt())
                .maxAmt(request.getMaxAmt())
                .taxRate(request.getTaxRate())
                .effFrom(request.getEffFrom())
                .build();

        SalIncTaxBrkt saved = salaryIncomeTaxBracketRepository.save(entity);
        return SalaryIncomeTaxBracketResponse.from(saved);
    }

    public List<SalaryIncomeTaxBracketResponse> findAll() {
        return salaryIncomeTaxBracketRepository.findAllByOrderByMinAmtAsc().stream()
                .map(SalaryIncomeTaxBracketResponse::from)
                .toList();
    }
}