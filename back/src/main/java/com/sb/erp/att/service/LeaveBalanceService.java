package com.sb.erp.att.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.att.dto.request.LeaveGrantRequest;
import com.sb.erp.att.dto.response.LeaveBalanceResponse;
import com.sb.erp.att.dto.response.LeaveGrantResponse;
import com.sb.erp.att.entity.Attendance;
import com.sb.erp.att.entity.LeaveBalance;
import com.sb.erp.att.entity.LeaveGrant;
import com.sb.erp.att.repository.AttendanceRepository;
import com.sb.erp.att.repository.LeaveBalanceRepository;
import com.sb.erp.att.repository.LeaveGrantRepository;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.emp.repository.EmpRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaveBalanceService {

    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveGrantRepository leaveGrantRepository;
    private final AttendanceRepository attendanceRepository;
    private final EmpRepository empRepository;
    
    //  본인 comId - 조회 조건을 연차 도메인에도 동일하게 적용하기
    private void assertSameCompany(Long empId, Long comId) {
        if (empId == null || comId == null
                || !empRepository.existsByEmpIdAndCompany_ComId(empId, comId)) {
            throw new AccessDeniedException("다른 회사 사원의 연차 정보에는 접근할 수 없습니다.");
        }
    }
    
    // ================================================================
    //  1. 조회
    // ================================================================
    // 관리자용 — 특정 연도 전체 사원 연차 현황
    public List<LeaveBalanceResponse> getAllBalances(Long comId, Integer year, String keyword) {
        return leaveBalanceRepository.findByYearAndKeyword(year, comId, keyword)
                .stream()
                .map(LeaveBalanceResponse::from)
                .collect(Collectors.toList());
    }

    // 본인 연차 현황 — 전체 연도 이력
    public List<LeaveBalanceResponse> getMyBalances(Long empId) {
        return leaveBalanceRepository.findByEmployee_EmpIdOrderByYearDesc(empId)
                .stream()
                .map(LeaveBalanceResponse::from)
                .collect(Collectors.toList());
    }

    // 특정 사원의 특정 연도 연차 잔여 조회 (단건)
    public LeaveBalanceResponse getBalance(Long empId, Integer year, Long comId) {
        assertSameCompany(empId, comId);

        LeaveBalance balance = leaveBalanceRepository
                .findByEmployee_EmpIdAndYear(empId, year)
                .orElseThrow(() -> new IllegalArgumentException(
                        empId + "번 사원의 " + year + "년 연차 정보가 없습니다."));

        return LeaveBalanceResponse.from(balance);
    }

    // 특정 사원의 부여/차감 이력 목록
    // comId는 관리자 조회 경로에서만!
    // 본인 조회(myGrantHistory)는 JWT empId를 그대로 쓰므로 아래 오버로드를 사용한다.
    public List<LeaveGrantResponse> getGrantHistory(Long empId, Long comId) {
        assertSameCompany(empId, comId);
        return getGrantHistory(empId);
    }

    public List<LeaveGrantResponse> getGrantHistory(Long empId) {
        return leaveGrantRepository.findByEmployee_EmpIdOrderByGrantedAtDesc(empId)
                .stream()
                .map(LeaveGrantResponse::from)
                .collect(Collectors.toList());
    }


    // ================================================================
    //  2. 연차 발생 계산 (근로기준법 기반)
    // ================================================================
    /** 참고용
     * 입사일 기준 연차 일수 계산 — 근로기준법 제60조
     *   ┌─────────────────────────────────────────────────────────┐
     *   │ 근속 기간          │ 발생 연차                             │
     *   │ 1년 미만           │ 매월 만근 시 1일 (최대 11일)           │
     *   │ 1년 이상 ~ 3년 미만 │ 15일                                │
     *   │ 3년 이상           │ 15일 + (근속년수 - 1) / 2 (최대 25)   │
     *   └─────────────────────────────────────────────────────────┘
     * 예 : 입사 6개월 → 6일, 입사 1년 → 15일, 입사 5년 → 17일, 입사 21년+ → 25일
     */
    
    // 관리자가 특정 사원에게 연차를 부여할 때. comId 검증
    @Transactional
    public LeaveBalanceResponse calculateAnnual(Long empId, Integer year, Long comId) {
       
    	assertSameCompany(empId, comId);
    	// 같은 회사 소속이 맞다면 grantAnnual 실행
        
        return grantAnnual(empId, year);
    }

    // 내부 코어 — 검증 없음. 일괄 배치(calculateAllForYear)에서만 직접 호출
    // 배치는 이미 comId 또는 전사 범위로 대상을 확정해서 넘기므로 재검증이 불필요
    // 사원 수만큼 검증 쿼리가 추가되는 것도 피함
    private LeaveBalanceResponse grantAnnual(Long empId, Integer year) {
        Employee emp = empRepository.findById(empId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사원입니다."));
        
        // ── 중복 부여 방지 ──
        // 해당 연도에 이미 REG 타입 이력이 있으면 중복 발생 차단
        // balance 테이블에서 이미 해당 연도 행이 있고, totalDays > 0 이면 중복
        Optional<LeaveBalance> existing = leaveBalanceRepository
                .findByEmployee_EmpIdAndYear(empId, year);
        boolean alreadyGranted = existing.isPresent()
                && existing.get().getTotalDays().compareTo(BigDecimal.ZERO) > 0;

        if (alreadyGranted) {
            throw new IllegalArgumentException(year + "년 정기 연차가 이미 부여되었습니다.");
        }

        // ── 근속 기간 계산 ──
        LocalDate hireDate = emp.getHireDate();
        LocalDate baseDate = LocalDate.of(year, 1, 1);  // 해당 연도 1월 1일 기준

        long monthsWorked = ChronoUnit.MONTHS.between(hireDate, baseDate);
        long yearsWorked = ChronoUnit.YEARS.between(hireDate, baseDate);

        // ── 발생 일수 산출 ──
        BigDecimal annualDays;

        if (yearsWorked < 1) {
            // 1년 미만: 입사일~기준일까지의 개월 수 (최대 11일)
            // 매월 만근 시 1일씩 발생
            long months = Math.min(monthsWorked, 11);
            annualDays = BigDecimal.valueOf(Math.max(0, months));
        } else if (yearsWorked < 3) {
            // 1년 이상 ~ 3년 미만: 15일
            annualDays = BigDecimal.valueOf(15);
        } else {
            // 3년 이상: 15일 + (근속년수 - 1) / 2, 최대 25일
            // 예: 3년 → 15 + (3-1)/2 = 16, 5년 → 15 + (5-1)/2 = 17
            long extra = (yearsWorked - 1) / 2;
            long total = Math.min(15 + extra, 25);
            annualDays = BigDecimal.valueOf(total);
        }

        // ── leave_grant에 REG 이력 INSERT ──
        LeaveGrant grant = LeaveGrant.builder()
                .employee(emp)
                .grantDays(annualDays)
                .grantType("REG")
                .reason(yearsWorked + "년 근속 — 정기 부여")
                .expireAt(LocalDate.of(year, 12, 31))  // 당해 연도 말 만료
                .build();

        leaveGrantRepository.save(grant);

        // ── leave_balance 행 생성 또는 갱신 ──
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployee_EmpIdAndYear(empId, year)
                .orElse(LeaveBalance.builder()
                        .employee(emp)
                        .year(year)
                        .totalDays(BigDecimal.ZERO)
                        .usedDays(BigDecimal.ZERO)
                        .build());

        // totalDays에 발생량 더하기 (CAR 이월분이 이미 있을 수 있으므로 add)
        balance.setTotalDays(balance.getTotalDays().add(annualDays));
        leaveBalanceRepository.save(balance);

        return LeaveBalanceResponse.from(balance);
    }
    
    
	// 재직 사원 연차 일괄 발생. 이미 부여된 사원은 건너뛴다.
    @Transactional
    public int calculateAllForYear(Long comId, int year) {
        
    	// 대상 자체를 comId로 좁히므로 사원별 재검증 불필요
        List<Long> empIds = empRepository.findActiveEmpIdsByComId(comId);
        int count = 0;
        for (Long empId : empIds) {
            try {
                grantAnnual(empId, year);
                count++;
            } catch (IllegalArgumentException e) {
                log.debug("[연차일괄] empId={} 건너뜀: {}", empId, e.getMessage());
            }
        }
        log.info("[연차일괄] comId={}, 대상={}명, 처리={}명", comId, empIds.size(), count);
        return count;
    }
    
    // 스케줄러용 — 전사 대상/comId 검증X
    @Transactional
    public int calculateAllForYear(int year) {
        List<Long> empIds = empRepository.findAllActiveEmpIds();
        int count = 0;
        for (Long empId : empIds) {
            try {
                grantAnnual(empId, year);
                count++;
            } catch (IllegalArgumentException e) {
                log.debug("[연차일괄-스케줄러] empId={} 건너뜀: {}", empId, e.getMessage());
            }
        }
        log.info("[연차일괄-스케줄러] year={}, 대상={}명, 처리={}명", year, empIds.size(), count);
        return count;
    }


    // ================================================================
    //  3. 연차 사용 차감
    // ================================================================
    // 연차 사용 차감 — leave_request 전자결재 승인 시 호출
    // 관리자 대행 차감 경로 — comId 검증 포함
    // 파라미터 버전은 ApprDocServiceImpl(전자결재 승인)에서 호출하므로 시그니처를 유지
    // 결재 경로는 문서의 empId가 이미 같은 회사 내에서 확정된 값이라 별도 검증이 불필요
    @Transactional
    public LeaveGrantResponse deductLeave(Long empId, LeaveGrantRequest request, Long comId) {
        assertSameCompany(empId, comId);
        return deductLeave(empId, request);
    }

    // 연차 사용 차감 — leave_request 전자결재 승인 시 호출
    @Transactional
    public LeaveGrantResponse deductLeave(Long empId, LeaveGrantRequest request) {

        Employee emp = empRepository.findById(empId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사원입니다."));
        
        // 연차 사용할 날짜 확인
        LocalDate leaveDate = request.getLeaveDate();
        if (leaveDate == null) {
            leaveDate = LocalDate.now();
        }
        int currentYear = leaveDate.getYear();

        // ── 잔여 연차 확인 ──
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployee_EmpIdAndYear(empId, currentYear)
                .orElseThrow(() -> new IllegalArgumentException(
                        currentYear + "년 연차 정보가 없습니다. 먼저 연차 발생을 실행해주세요."));

        // request.grantDays는 음수(-1.00)로 들어오므로 절대값으로 비교
        BigDecimal deductAmount = request.getGrantDays().abs();

        if (balance.getRemainingDays().compareTo(deductAmount) < 0) {
            throw new IllegalArgumentException(
                    "잔여 연차가 부족합니다. (잔여: " + balance.getRemainingDays() + "일)");
        }

        // ── leave_grant에 USE 이력 INSERT ──
        LeaveGrant grant = LeaveGrant.builder()
                .employee(emp)
                .grantDays(request.getGrantDays())  // 음수 그대로 저장 (-1.00)
                .grantType("USE")
                .reason(request.getReason())
                .build();

        leaveGrantRepository.save(grant);

        // ── leave_balance.usedDays 증가 ──
        balance.setUsedDays(balance.getUsedDays().add(deductAmount));
        leaveBalanceRepository.save(balance);

        // ── attendance 테이블에 연차/반차 행 INSERT ──
        // leave_request 승인시 이 메서드 호출 → attendance에 기록
        // AttendanceService.checkIn()에서 ANNUAL/HALF 상태를 확인하여 출근 차단
        insertLeaveAttendance(emp, deductAmount, request.getHalfType(), leaveDate);

        return LeaveGrantResponse.from(grant);
    }


    // attendance 테이블에 연차/반차 행 INSERT
    private void insertLeaveAttendance(Employee emp, BigDecimal deductAmount, String halfType, LocalDate leaveDate){

        // 이미 해당 날짜에 근태 기록이 있는지 확인
        // (출근 후 연차 신청은 불가 — 비즈니스 규칙)
        long existing = attendanceRepository
                .countByEmployee_EmpIdAndAttDate(emp.getEmpId(), leaveDate);

        if (existing > 0) {
            throw new IllegalArgumentException("해당 날짜에 이미 근태 기록이 존재합니다.");
        }

        // 차감량에 따라 att_status 결정
        // 1.00 → ANNUAL (연차), 0.50 → AM_HALF 또는 PM_HALF
        String attStatus;
        if (deductAmount.compareTo(BigDecimal.ONE) == 0) {
            attStatus = "ANNUAL";
        } else {
            // request에서 전달받은 halfType으로 오전/오후 구분
            // "PM"이면 PM_HALF, 그 외(null 포함)는 AM_HALF 기본값
            attStatus = "PM".equals(halfType) ? "PM_HALF" : "AM_HALF";
        }

        Attendance leaveAtt = Attendance.builder()
                .employee(emp)
                .attDate(leaveDate)
                .attStatus(attStatus)
                .workMinutes(0)
                .overtimeMinutes(0)
                .nightMinutes(0)
                .build();
        // checkIn, checkOut은 null — 연차/반차이므로 출퇴근 기록 없음

        attendanceRepository.save(leaveAtt);
    }


    // ================================================================
    //  4. 관리자 수동 조정
    // ================================================================
    // 관리자가 수동으로 연차를 부여하거나 차감
    @Transactional
    public LeaveGrantResponse adjustLeave(LeaveGrantRequest request, Long comId) {

        assertSameCompany(request.getEmpId(), comId);

        Employee emp = empRepository.findById(request.getEmpId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사원입니다."));

        int currentYear = LocalDate.now().getYear();

        // ── leave_grant에 ADJ 이력 INSERT ──
        LeaveGrant grant = LeaveGrant.builder()
                .employee(emp)
                .grantDays(request.getGrantDays())
                .grantType("ADJ")
                .reason(request.getReason())
                .build();

        leaveGrantRepository.save(grant);

        // ── leave_balance 갱신 ──
        LeaveBalance balance = leaveBalanceRepository
                .findByEmployee_EmpIdAndYear(request.getEmpId(), currentYear)
                .orElseThrow(() -> new IllegalArgumentException(
                        currentYear + "년 연차 정보가 없습니다."));

        // 양수면 totalDays 증가 (부여), 음수면 usedDays 증가 (차감)
        if (request.getGrantDays().compareTo(BigDecimal.ZERO) > 0) {
            balance.setTotalDays(balance.getTotalDays().add(request.getGrantDays()));
        } else {
            balance.setUsedDays(balance.getUsedDays().add(request.getGrantDays().abs()));
        }

        leaveBalanceRepository.save(balance);

        return LeaveGrantResponse.from(grant);
    }

}