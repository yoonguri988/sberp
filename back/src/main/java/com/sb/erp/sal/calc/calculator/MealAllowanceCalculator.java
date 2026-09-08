package com.sb.erp.sal.calc.calculator;

import java.time.LocalDate;
import java.time.YearMonth;

import org.springframework.stereotype.Component;

import com.sb.erp.emp.entity.Employee;
import com.sb.erp.sal.calc.SalPayItemCandidate;
import com.sb.erp.sal.calc.SalaryItemCalculator;
import com.sb.erp.sal.entity.SalMealAlwPlcy;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.SalaryItemCode;
import com.sb.erp.sal.repository.SalaryMealAllowancePolicyRepository;

import lombok.RequiredArgsConstructor;

/**
 * 식대(MEAL_ALLOWANCE) 계산기.
 * sal_meal_alw_plcy에서 comId 기준 정책을 조회하고, 없으면 comId가 NULL인 전사 공통 기본값으로
 * fallback한다. 그마저도 없으면 0원으로 산정하고 calcBasis에 "정책 미설정"을 남긴다(관리자 화면에서 확인 가능).
 */
@Component
@RequiredArgsConstructor
public class MealAllowanceCalculator implements SalaryItemCalculator {

    private final SalaryMealAllowancePolicyRepository mealAllowancePolicyRepository;

    @Override
    public SalaryItemCode getItemCode() {
        return SalaryItemCode.MEAL_ALLOWANCE;
    }

    @Override
    public SalPayItemCandidate calculate(SalStd std, Employee employee, YearMonth payMonth) {
        LocalDate date = payMonth.atDay(1);
        Long comId = employee.getCompany().getComId();

        SalMealAlwPlcy policy = mealAllowancePolicyRepository.findApplicableByCom(comId, date)
                .or(() -> mealAllowancePolicyRepository.findApplicableFallback(date))
                .orElse(null);

        if (policy == null) {
            return new SalPayItemCandidate(getItemCode(), 0L, "식대 정책 미설정(comId=" + comId + ") - 관리자 확인 필요");
        }

        String basis = (policy.getComId() == null ? "전사 공통 식대 정책" : "회사(comId=" + comId + ") 식대 정책")
                + " 적용: " + policy.getAmt() + "원";
        return new SalPayItemCandidate(getItemCode(), policy.getAmt(), basis);
    }
}
