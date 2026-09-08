package com.sb.erp.sal.calc;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sb.erp.emp.entity.Employee;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.SalaryItemCode;

import lombok.RequiredArgsConstructor;

/**
 * 급여 산정 엔진 구현체.
 *
 * Spring이 SalaryItemCalculator 구현체(@Component)들을 모두 List로 주입해준다. 항목 간 계산 순서
 * 의존성(예: 장기요양보험료가 건강보험료 계산 이후에 계산되어야 하는 것)은 이 리스트의 주입 순서에
 * 기대지 않고, 해당 계산기가 의존 계산기를 직접 주입받아 호출하는 방식으로 각 계산기 내부에서 해결한다
 * (예: LongTermCareInsuranceCalculator -> HealthInsuranceCalculator).
 * 따라서 이 클래스는 SalaryItemCode.values() 순서대로 결과를 모으기만 하면 된다.
 */
@Service
@RequiredArgsConstructor
public class SalaryCalculationServiceImpl implements SalaryCalculationService {

    private final List<SalaryItemCalculator> calculators;

    @Override
    public List<SalPayItemCandidate> calculate(SalStd std, Employee employee, YearMonth payMonth) {
        Map<SalaryItemCode, SalaryItemCalculator> byCode = calculators.stream()
                .collect(Collectors.toMap(SalaryItemCalculator::getItemCode, Function.identity()));

        return List.of(SalaryItemCode.values()).stream()
                .map(code -> {
                    SalaryItemCalculator calculator = byCode.get(code);
                    if (calculator == null) {
                        // 신규 항목코드를 추가하고 계산기 구현을 깜빡한 경우를 조기에 발견하기 위한 방어 코드.
                        return new SalPayItemCandidate(code, 0L, "계산기 미구현 - 개발자 확인 필요");
                    }
                    return calculator.calculate(std, employee, payMonth);
                })
                .toList();
    }
}
