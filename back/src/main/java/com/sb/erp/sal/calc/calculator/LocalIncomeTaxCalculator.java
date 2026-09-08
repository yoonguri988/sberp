package com.sb.erp.sal.calc.calculator;

import java.math.BigDecimal;
import java.time.YearMonth;

import org.springframework.stereotype.Component;

import com.sb.erp.emp.entity.Employee;
import com.sb.erp.sal.calc.SalPayItemCandidate;
import com.sb.erp.sal.calc.SalaryCalculationSupport;
import com.sb.erp.sal.calc.SalaryItemCalculator;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.SalaryItemCode;

import lombok.RequiredArgsConstructor;

/**
 * 지방소득세(LOCAL_INCOME_TAX) 계산기.
 * INCOME_TAX 계산 결과 x 10%. IncomeTaxCalculator를 직접 주입받아 재사용한다(순차 계산 보장).
 */
@Component
@RequiredArgsConstructor
public class LocalIncomeTaxCalculator implements SalaryItemCalculator {

    private static final BigDecimal LOCAL_TAX_RATE = new BigDecimal("0.10");

    private final IncomeTaxCalculator incomeTaxCalculator;

    @Override
    public SalaryItemCode getItemCode() {
        return SalaryItemCode.LOCAL_INCOME_TAX;
    }

    @Override
    public SalPayItemCandidate calculate(SalStd std, Employee employee, YearMonth payMonth) {
        Long incomeTaxAmt = incomeTaxCalculator.calculate(std, employee, payMonth).getAmt();

        Long amt = SalaryCalculationSupport.applyRateAndTruncate(BigDecimal.valueOf(incomeTaxAmt), LOCAL_TAX_RATE);
        String basis = "incomeTax " + incomeTaxAmt + " x 10% = " + amt + "원 (원단위 절사)";
        return new SalPayItemCandidate(getItemCode(), amt, basis);
    }
}
