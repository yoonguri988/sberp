package com.sb.erp.sal.calc.calculator;

import java.time.LocalDate;
import java.time.YearMonth;

import org.springframework.stereotype.Component;

import com.sb.erp.emp.entity.Employee;
import com.sb.erp.global.exception.ResourceNotFoundException;
import com.sb.erp.sal.calc.SalPayItemCandidate;
import com.sb.erp.sal.calc.SalaryCalculationSupport;
import com.sb.erp.sal.calc.SalaryItemCalculator;
import com.sb.erp.sal.entity.SalIncTaxBrkt;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.SalaryItemCode;
import com.sb.erp.sal.repository.SalaryIncomeTaxBracketRepository;

import lombok.RequiredArgsConstructor;

/**
 * 소득세(INCOME_TAX) 계산기 - 포트폴리오용 근사치.
 *
 * sal_inc_tax_brkt에서 baseSal이 속한 구간의 tax_rate를 조회해 곱한다.
 * 부양가족 수는 반영하지 않는다(실제 국세청 근로소득 간이세액표와 다를 수 있음, 정식 반영은 스코프 밖).
 * calcBasis에 이 한계를 항상 명시해 화면/API 응답에서 "근사치"임을 인지할 수 있게 한다.
 */
@Component
@RequiredArgsConstructor
public class IncomeTaxCalculator implements SalaryItemCalculator {

    private static final String DISCLAIMER = "부양가족 수 미반영, 실제 원천징수세액과 차이 있을 수 있음(포트폴리오/데모 목적의 근사치)";

    private final SalaryIncomeTaxBracketRepository incomeTaxBracketRepository;

    @Override
    public SalaryItemCode getItemCode() {
        return SalaryItemCode.INCOME_TAX;
    }

    @Override
    public SalPayItemCandidate calculate(SalStd std, Employee employee, YearMonth payMonth) {
        LocalDate date = payMonth.atDay(1);
        SalIncTaxBrkt bracket = incomeTaxBracketRepository.findApplicable(std.getBaseSal(), date)
                .orElseThrow(() -> new IllegalStateException(
                        "baseSal " + std.getBaseSal() + "에 해당하는 소득세 구간이 없습니다. "
                                + "관리자가 sal_inc_tax_brkt을 먼저 등록해야 합니다. payMonth=" + date));

        Long amt = SalaryCalculationSupport.applyRateAndTruncate(std.getBaseSal(), bracket.getTaxRate());
        String basis = "baseSal " + std.getBaseSal() + " x taxRate " + bracket.getTaxRate()
                + " = " + amt + "원 (원단위 절사) - " + DISCLAIMER;
        return new SalPayItemCandidate(getItemCode(), amt, basis);
    }
}
