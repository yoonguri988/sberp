package com.sb.erp.sal.calc.calculator;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;

import org.springframework.stereotype.Component;

import com.sb.erp.att.repository.AttendanceRepository;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.sal.calc.SalPayItemCandidate;
import com.sb.erp.sal.calc.SalaryCalculationSupport;
import com.sb.erp.sal.calc.SalaryItemCalculator;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.SalaryItemCode;

import lombok.RequiredArgsConstructor;

/**
 * 고정연장수당(OVERTIME_ALLOWANCE) 계산기.
 *
 * 계산식: 통상시급 = baseSal / 209(월 소정근로시간)
 *        고정연장수당 = payMonth 1개월간 overtimeMinutes 합계 / 60 x 통상시급 x 1.5(연장근로 가산율)
 *
 * 이전 스텁 주석에는 "시급 = baseSal / 209 / 8"로 적혀 있었는데, 이는 AnnualLeaveAllowanceCalculator의
 * "일급 = baseSal / 209 x 8" 공식과 앞뒤가 맞지 않는 오기로 판단해 바로잡았다 — 통상시급은 baseSal / 209
 * 이고, 일급은 그 시급에 8시간을 곱한 값이어야 한다(둘 다 같은 통상시급을 공유해야 함).
 * 공통 계산식은 SalaryCalculationSupport.hourlyWage()/dailyWage()로 추출해 두 계산기가 함께 쓴다.
 *
 * payMonth에 근태 기록 자체가 없는 경우(신규 입사자, 아직 근태 미기록 등)는 오류가 아니라 "이번 달
 * 연장근로 없음"으로 보고 0원으로 산정한다(AttendanceRepository 쿼리가 COALESCE로 0을 보장).
 */
@Component
@RequiredArgsConstructor
public class OvertimeAllowanceCalculator implements SalaryItemCalculator {

    /** 통상시급/연장근로시간 계산 시 사용할 중간 정밀도. 최종 금액에서만 원 단위로 절사한다. */
    private static final int CALC_SCALE = 4;

    private static final BigDecimal OVERTIME_RATE = new BigDecimal("1.5");

    private final AttendanceRepository attendanceRepository;

    @Override
    public SalaryItemCode getItemCode() {
        return SalaryItemCode.OVERTIME_ALLOWANCE;
    }

    @Override
    public SalPayItemCandidate calculate(SalStd std, Employee employee, YearMonth payMonth) {
        LocalDate start = payMonth.atDay(1);
        LocalDate end = payMonth.atEndOfMonth();

        Integer overtimeMinutes = attendanceRepository.sumOvertimeMinutesByEmpIdAndDateRange(
                employee.getEmpId(), start, end);
        if (overtimeMinutes == null || overtimeMinutes <= 0) {
            return new SalPayItemCandidate(getItemCode(), 0L,
                    "attendance 연장근로 기록 없음(payMonth=" + payMonth + ") - 0원 산정");
        }

        BigDecimal hourlyWage = SalaryCalculationSupport.hourlyWage(std.getBaseSal(), CALC_SCALE);
        BigDecimal overtimeHours = BigDecimal.valueOf(overtimeMinutes)
                .divide(BigDecimal.valueOf(60), CALC_SCALE, RoundingMode.DOWN);

        BigDecimal amount = overtimeHours.multiply(hourlyWage).multiply(OVERTIME_RATE);
        Long amt = SalaryCalculationSupport.truncate(amount);

        String basis = "overtimeMinutes " + overtimeMinutes + "분(" + payMonth + ") / 60 = " + overtimeHours + "시간"
                + " x hourlyWage " + hourlyWage + "(baseSal " + std.getBaseSal() + " / 209)"
                + " x 1.5 = " + amt + "원 (원단위 절사)";
        return new SalPayItemCandidate(getItemCode(), amt, basis);
    }
}
