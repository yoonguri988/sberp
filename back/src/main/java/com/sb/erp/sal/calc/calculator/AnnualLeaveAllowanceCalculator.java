package com.sb.erp.sal.calc.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;

import org.springframework.stereotype.Component;

import com.sb.erp.att.entity.LeaveBalance;
import com.sb.erp.att.repository.LeaveBalanceRepository;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.sal.calc.SalPayItemCandidate;
import com.sb.erp.sal.calc.SalaryCalculationSupport;
import com.sb.erp.sal.calc.SalaryItemCalculator;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.SalaryItemCode;

import lombok.RequiredArgsConstructor;

/**
 * 연차수당(ANNUAL_LEAVE_ALLOWANCE) 계산기.
 *
 * leave_grant(부여 이력)를 직접 합산하지 않고, 이미 그 합계를 연도별로 들고 있는 leave_balance
 * (totalDays/usedDays)를 조회한다 - LeaveBalance.getRemainingDays()가 "미사용 연차일수"다.
 *
 * 계산식: 미사용 연차일수 = leave_balance.totalDays - leave_balance.usedDays (해당 payMonth의 연도 기준)
 *        통상일급 = baseSal / 209(월 소정근로시간) x 8시간
 *        연차수당 = 미사용 연차일수 x 통상일급
 *
 * 통상일급 계산은 OvertimeAllowanceCalculator의 통상시급과 같은 기준(baseSal / 209)을 공유해야 하므로
 * SalaryCalculationSupport.dailyWage()로 추출해 두 계산기가 함께 쓴다.
 *
 * 이 항목은 매월 산정 대상에 포함되지만, 실무에서 연차수당은 보통 연 1회(예: 12월 또는 퇴사 시) 정산하는
 * 항목이다. 이 계산기는 "그 시점 기준 미사용 연차 가치가 얼마인지"를 매월 후보값으로 계산해 줄 뿐이고,
 * 실제로 이번 달 급여에 반영할지는 관리자가 PENDING 상태에서 PATCH /items/{itemId}로 조정(0원 처리 등)해야
 * 한다 - 이 계산기가 "항상 지급"을 의미하지 않는다는 점을 calcBasis에도 명시한다.
 *
 * 해당 연도의 leave_balance 행 자체가 없는 경우(연차가 아직 부여되지 않은 신규 입사자 등)는 오류가 아니라
 * 0일로 간주해 0원으로 산정한다.
 */
@Component
@RequiredArgsConstructor
public class AnnualLeaveAllowanceCalculator implements SalaryItemCalculator {

    /** 통상일급 계산 시 사용할 중간 정밀도. 최종 금액에서만 원 단위로 절사한다. */
    private static final int CALC_SCALE = 4;

    private final LeaveBalanceRepository leaveBalanceRepository;

    @Override
    public SalaryItemCode getItemCode() {
        return SalaryItemCode.ANNUAL_LEAVE_ALLOWANCE;
    }

    @Override
    public SalPayItemCandidate calculate(SalStd std, Employee employee, YearMonth payMonth) {
        int year = payMonth.getYear();

        LeaveBalance balance = leaveBalanceRepository
                .findByEmployee_EmpIdAndYear(employee.getEmpId(), year)
                .orElse(null);

        if (balance == null) {
            return new SalPayItemCandidate(getItemCode(), 0L,
                    "leave_balance 데이터 없음(year=" + year + ") - 미사용 연차 0일로 산정");
        }

        BigDecimal unusedDays = balance.getRemainingDays();
        if (unusedDays == null || unusedDays.signum() <= 0) {
            return new SalPayItemCandidate(getItemCode(), 0L,
                    "미사용 연차 없음(year=" + year + ", totalDays=" + balance.getTotalDays()
                            + ", usedDays=" + balance.getUsedDays() + ") - 0원 산정");
        }

        BigDecimal dailyWage = SalaryCalculationSupport.dailyWage(std.getBaseSal(), CALC_SCALE);
        BigDecimal amount = unusedDays.multiply(dailyWage);
        Long amt = SalaryCalculationSupport.truncate(amount);

        String basis = "미사용 연차 " + unusedDays.setScale(2, RoundingMode.DOWN) + "일(year=" + year
                + ", totalDays=" + balance.getTotalDays() + " - usedDays=" + balance.getUsedDays() + ")"
                + " x dailyWage " + dailyWage + "(baseSal " + std.getBaseSal() + " / 209 x 8)"
                + " = " + amt + "원 (원단위 절사, 실제 반영 여부는 관리자 확인 필요)";
        return new SalPayItemCandidate(getItemCode(), amt, basis);
    }
}
