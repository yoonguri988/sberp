package com.sb.erp.sal.calc;

import java.time.YearMonth;

import com.sb.erp.emp.entity.Employee;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.SalaryItemCode;

/**
 * 급여 항목(수당/공제) 하나를 산정하는 계산기 - Strategy 패턴.
 *
 * 항목이 10개뿐이라 과설계로 보일 수 있으나, 연차/근태 연동 시점이 다르고 요율 정책도 별도 테이블이라
 * 항목별로 의존 데이터가 다르므로 분리해두는 편이 유지보수에 유리하다
 * (salary-calculation-engine-design.md "계산 로직 설계" 참고).
 *
 * 항목 간 의존 관계(예: 장기요양보험료는 건강보험료 계산 이후에만 계산 가능)가 있는 경우,
 * SalaryCalculationServiceImpl이 호출 순서를 보장하지 않고도 계산할 수 있도록 해당 계산기가
 * 의존하는 계산기(SalaryItemCalculator 구현체)를 직접 주입받아 내부에서 호출하는 방식으로 구현한다
 * (예: LongTermCareInsuranceCalculator가 HealthInsuranceCalculator를 주입받아 재사용).
 */
public interface SalaryItemCalculator {

    SalaryItemCode getItemCode();

    SalPayItemCandidate calculate(SalStd std, Employee employee, YearMonth payMonth);
}
