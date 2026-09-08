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

/** 고용보험(EMPLOYMENT_INSURANCE) 계산기. baseSal x employmentRate, 원 단위 절사. */
@Component
@RequiredArgsConstructor
public class EmploymentInsuranceCalculator implements SalaryItemCalculator {

    private final SalaryRatePolicyRepository ratePolicyRepository;

    @Override
    public SalaryItemCode getItemCode() {
        return SalaryItemCode.EMPLOYMENT_INSURANCE;
    }

    @Override
    public SalPayItemCandidate calculate(SalStd std, Employee employee, YearMonth payMonth) {
        LocalDate date = payMonth.atDay(1);
        SalRatePlcy policy = ratePolicyRepository.findApplicable(date)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "적용 가능한 4대보험 요율 정책이 없습니다. 관리자가 sal_rate_plcy를 먼저 등록해야 합니다. payMonth=" + date));

        Long amt = SalaryCalculationSupport.applyRateAndTruncate(std.getBaseSal(), policy.getEmplRate());
        String basis = "baseSal " + std.getBaseSal() + " x emplRate " + policy.getEmplRate()
                + " = " + amt + "원 (원단위 절사)";
        return new SalPayItemCandidate(getItemCode(), amt, basis);
    }
}
