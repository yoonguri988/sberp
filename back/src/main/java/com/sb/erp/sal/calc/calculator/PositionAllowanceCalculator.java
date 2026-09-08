package com.sb.erp.sal.calc.calculator;

import java.time.LocalDate;
import java.time.YearMonth;

import org.springframework.stereotype.Component;

import com.sb.erp.emp.entity.Employee;
import com.sb.erp.sal.calc.SalPayItemCandidate;
import com.sb.erp.sal.calc.SalaryItemCalculator;
import com.sb.erp.sal.entity.SalPosAlw;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.SalaryItemCode;
import com.sb.erp.sal.repository.SalaryPositionAllowanceRepository;

import lombok.RequiredArgsConstructor;

/**
 * 직책수당(POSITION_ALLOWANCE) 계산기.
 * sal_pos_alw에서 comId + Employee.position(Position).posCode 매칭 조회.
 * 매칭되는 정책이 없으면(예: 해당 직급에 직책수당이 없는 경우) 0원으로 산정한다 - 이는 오류가 아니라
 * 정상적인 케이스일 수 있다(예: 사원급은 직책수당 없음).
 */
@Component
@RequiredArgsConstructor
public class PositionAllowanceCalculator implements SalaryItemCalculator {

    private final SalaryPositionAllowanceRepository positionAllowanceRepository;

    @Override
    public SalaryItemCode getItemCode() {
        return SalaryItemCode.POSITION_ALLOWANCE;
    }

    @Override
    public SalPayItemCandidate calculate(SalStd std, Employee employee, YearMonth payMonth) {
        LocalDate date = payMonth.atDay(1);
        Long comId = employee.getCompany().getComId();
        String posCode = employee.getPosition().getPosCode();

        SalPosAlw policy = positionAllowanceRepository.findApplicable(comId, posCode, date).orElse(null);

        if (policy == null) {
            return new SalPayItemCandidate(getItemCode(), 0L,
                    "직책수당 정책 없음(position=" + posCode + ") - 해당 직급은 직책수당 미해당일 수 있음");
        }

        return new SalPayItemCandidate(getItemCode(), policy.getAmt(),
                "직책(" + posCode + ") 수당 정책 적용: " + policy.getAmt() + "원");
    }
}
