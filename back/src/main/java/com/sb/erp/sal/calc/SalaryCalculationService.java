package com.sb.erp.sal.calc;

import java.time.YearMonth;
import java.util.List;

import com.sb.erp.emp.entity.Employee;
import com.sb.erp.sal.entity.SalStd;

/**
 * 급여 산정 엔진의 진입점(Facade).
 *
 * 관리자가 직접 금액을 계산해서 입력하는 대신, 시스템이 직원의 급여기준(SalStd)/직책/각종 정책 테이블을
 * 기준으로 매월 수당/공제 항목을 자동 산정한다(salary-calculation-engine-design.md "배경 및 문제 인식" 참고).
 */
public interface SalaryCalculationService {

    /**
     * SalaryItemCode에 정의된 모든 항목(식대/직책수당/연차수당/고정연장수당/4대보험/소득세/지방소득세)을
     * 산정해서 반환한다. 연차수당/고정연장수당은 원천 모듈(연차/근태) 미완성으로 0원 스텁 산정된다.
     */
    List<SalPayItemCandidate> calculate(SalStd std, Employee employee, YearMonth payMonth);
}
