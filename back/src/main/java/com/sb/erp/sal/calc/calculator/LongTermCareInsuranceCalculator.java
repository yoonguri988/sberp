package com.sb.erp.sal.calc.calculator;

import java.math.BigDecimal;
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
 * 장기요양보험료(LONG_TERM_CARE_INSURANCE) 계산기.
 * 건강보험료(계산된 값) x careRate — 건강보험 계산 이후 순차 계산이 필요하므로, 오케스트레이터(리스트 순서)에
 * 의존하지 않고 HealthInsuranceCalculator를 직접 주입받아 그 결과(이미 절사된 값)를 재사용한다.
 */
@Component
@RequiredArgsConstructor
public class LongTermCareInsuranceCalculator implements SalaryItemCalculator {

    private final SalaryRatePolicyRepository ratePolicyRepository;
    private final HealthInsuranceCalculator healthInsuranceCalculator;

    @Override
    public SalaryItemCode getItemCode() {
        return SalaryItemCode.LONG_TERM_CARE_INSURANCE;
    }

    @Override
    public SalPayItemCandidate calculate(SalStd std, Employee employee, YearMonth payMonth) {
        LocalDate date = payMonth.atDay(1);
        SalRatePlcy policy = ratePolicyRepository.findApplicable(date)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "적용 가능한 4대보험 요율 정책이 없습니다. 관리자가 sal_rate_plcy를 먼저 등록해야 합니다. payMonth=" + date));

        Long healthInsuranceAmt = healthInsuranceCalculator.calculate(std, employee, payMonth).getAmt();

        Long amt = SalaryCalculationSupport.applyRateAndTruncate(BigDecimal.valueOf(healthInsuranceAmt), policy.getCareRate());
        String basis = "healthInsurance(절사됨) " + healthInsuranceAmt + " x careRate " + policy.getCareRate()
                + " = " + amt + "원 (원단위 절사)";
        return new SalPayItemCandidate(getItemCode(), amt, basis);
    }
}
