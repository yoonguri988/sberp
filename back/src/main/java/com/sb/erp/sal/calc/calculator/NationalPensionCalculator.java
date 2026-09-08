package com.sb.erp.sal.calc.calculator;

import java.time.LocalDate;
import java.time.YearMonth;

import org.springframework.stereotype.Component;

import com.sb.erp.emp.entity.Employee;
import com.sb.erp.global.exception.ResourceNotFoundException;
import com.sb.erp.sal.calc.SalPayItemCandidate;
import com.sb.erp.sal.calc.SalaryCalculationSupport;
import com.sb.erp.sal.calc.SalaryItemCalculator;
import com.sb.erp.sal.entity.SalRatePlcy;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.SalaryItemCode;
import com.sb.erp.sal.repository.SalaryRatePolicyRepository;

import lombok.RequiredArgsConstructor;

/**
 * 국민연금(NATIONAL_PENSION) 계산기. baseSal x pensionRate, 원 단위 절사.
 * 요율 정책(sal_rate_plcy)이 등록되어 있지 않으면 산정할 수 없으므로 예외를 던진다
 * (관리자가 연 1회 요율을 먼저 등록해야 한다 - design.md "확정된 정책 결정 3" 참고).
 */
@Component
@RequiredArgsConstructor
public class NationalPensionCalculator implements SalaryItemCalculator {

    private final SalaryRatePolicyRepository ratePolicyRepository;

    @Override
    public SalaryItemCode getItemCode() {
        return SalaryItemCode.NATIONAL_PENSION;
    }

    @Override
    public SalPayItemCandidate calculate(SalStd std, Employee employee, YearMonth payMonth) {
        LocalDate date = payMonth.atDay(1);
        SalRatePlcy policy = ratePolicyRepository.findApplicable(date)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "적용 가능한 4대보험 요율 정책이 없습니다. 관리자가 sal_rate_plcy를 먼저 등록해야 합니다. payMonth=" + date));

        Long amt = SalaryCalculationSupport.applyRateAndTruncate(std.getBaseSal(), policy.getPensRate());
        String basis = "baseSal " + std.getBaseSal() + " x pensRate " + policy.getPensRate()
                + " = " + amt + "원 (원단위 절사)";
        return new SalPayItemCandidate(getItemCode(), amt, basis);
    }
}
