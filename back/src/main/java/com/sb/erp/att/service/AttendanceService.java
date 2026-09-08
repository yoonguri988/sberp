package com.sb.erp.att.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.att.dto.request.AttendanceRequest;
import com.sb.erp.att.dto.response.AttendanceResponse;
import com.sb.erp.att.entity.Attendance;
import com.sb.erp.att.repository.AttendanceRepository;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.emp.repository.EmpRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceService {
	
	private final AttendanceRepository attendanceRepository;
	private final EmpRepository empRepository;
	
	
	//	목록 조회	읽기
	public List<AttendanceResponse> getAllAttendances(
	        LocalDate startDate, LocalDate endDate, Long comId, String keyword,
	        int start, int end) {
	    return attendanceRepository.findAttendanceWithSearch(startDate, endDate, comId, keyword, start, end)
				.stream()
				.map(AttendanceResponse::from)
				.collect(Collectors.toList());
	}
	
	//	본인 조회	읽기
	public List<AttendanceResponse> getAttendanceByEmpId(Long empId){
		return attendanceRepository.findByEmployee_EmpId(empId)
				.stream()
				.map(AttendanceResponse::from)
				.collect(Collectors.toList());
	}
	
	// 출근 check-in
	@Transactional
	public AttendanceResponse checkIn(Long empId) {
		
		// 오늘 날짜
		LocalDate today = LocalDate.now();
				
		// 금일 출근 시 이미 출근 처리 되었는지/휴가 사용했는지 여부 확인
		Optional<Attendance> existing = attendanceRepository
				.findByEmployee_EmpIdAndAttDate(empId, today);
		
		if(existing.isPresent()) {
			String status = existing.get().getAttStatus();
			if("ANNUAL".equals(status)) {
				throw new IllegalArgumentException("연차가 등록된 날입니다.");
			}else if("AM_HALF".equals(status)) {
				throw new IllegalArgumentException("오전 반차가 등록된 날입니다.");
				// 오전 출근만 반려, 오후 출근 허용해야함... 나중에...
			}else if("PM_HALF".equals(status)) {
				throw new IllegalArgumentException("오후 반차가 등록된 날입니다.");
			}
			throw new IllegalArgumentException("이미 출근 처리되었습니다.");
		}
		
		// 현재 시각으로 출근 상태 판단(정상 출근/지각)
		LocalDateTime now = LocalDateTime.now();
		String status = now.toLocalTime().isAfter(LocalTime.of(9, 0))? "LATE" : "NORMAL";
		
		// Entity
		Employee emp = empRepository.findById(empId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사원입니다."));
		
		Attendance attendance = Attendance.builder()
				.employee(emp)
				.attDate(today)
				.checkIn(now)
				.attStatus(status)
				.build();
		
		// save
		Attendance saved = attendanceRepository.save(attendance);
			
		return AttendanceResponse.from(saved);
		
	}
	
	
	// 퇴근 check-out
	@Transactional
	public AttendanceResponse checkOut(Long empId) {

		// 금일 출근 기록 찾기
		LocalDate today = LocalDate.now();
		Attendance attendance = attendanceRepository.findByEmployee_EmpIdAndAttDate(empId, today)
				.orElseThrow(() -> new IllegalArgumentException("출근 기록이 없습니다."));

		/*
			연차/반차 행은 LeaveBalanceService.insertLeaveAttendance()가
			checkIn=null로 생성한다. 아래 calculateWorkMinutes()와 119행의
			getCheckIn().isAfter()가 NPE를 내므로 먼저 차단하기 
		*/
		if (attendance.getCheckIn() == null) {
			throw new IllegalArgumentException("출근 기록이 없어 퇴근 처리할 수 없습니다.");
		}

		// 이미 퇴근처리 되었는지 확인
		if (attendance.getCheckOut() != null) {
			throw new IllegalArgumentException("이미 퇴근 처리되었습니다.");
		}

		// 퇴근 시각 세팅
		attendance.setCheckOut(LocalDateTime.now());

		// 근로시간 산출
		calculateWorkMinutes(attendance);
		
		// ★ 사원 본인 퇴근 시에만 상태 자동 판별
	    LocalDateTime standardStart = LocalDate.now().atTime(9, 0);
	    LocalDateTime standardEnd = LocalDate.now().atTime(18, 0);
	    if (attendance.getCheckIn().isAfter(standardStart)) {
	        attendance.setAttStatus("LATE");
	    }
	    if (attendance.getCheckOut().isBefore(standardEnd)
	            && !"LATE".equals(attendance.getAttStatus())) {
	        attendance.setAttStatus("EARLY_LEAVE");
	    }

		return AttendanceResponse.from(attendance);

	}

	
	// 누락된 근태가 있을 경우 관리자가 새로운 근태 내용 작성
	@Transactional
	public AttendanceResponse createAtt(AttendanceRequest request, Long comId) {
		
		// 등록된 사원이 맞는지/사번 맞는지 — 사원을 먼저 확정한다
		// ★ empNo는 회사 내에서만 유니크하므로, comId 검증 없이는
		//   타사 사원의 근태를 등록할 수 있다
		Employee emp = empRepository.findByEmpNo(request.getEmpNo())
				.orElseThrow(()-> new IllegalArgumentException("존재하지 않는 사원입니다."));
		
		if (!empRepository.existsByEmpIdAndCompany_ComId(emp.getEmpId(), comId)) {
			throw new AccessDeniedException("다른 회사 사원의 근태는 등록할 수 없습니다.");
		}
		
		// ★ 중복 체크는 확정된 emp의 empId 기준으로.
		long count = attendanceRepository.countByEmployee_EmpIdAndAttDate(emp.getEmpId(), request.getAttDate());
		
		if(count > 0) {
			throw new IllegalArgumentException("해당 날짜에 이미 근태 기록이 존재합니다.");
		}
		
		// 근태 없고 등록된 사원 맞으면 누락된 근태를 생성해주기
		Attendance att = Attendance.builder()
				.employee(emp) // 사원 정보
				.attDate(request.getAttDate()) // 날짜
				.checkIn(request.getCheckIn()) // 출근시간
				.checkOut(request.getCheckOut()) // 퇴근시간
				.attStatus(request.getAttStatus() != null? request.getAttStatus(): "NORMAL") // 등록한 상태 or 정상근무
				.build();
		
		// 출/퇴근 모두 입력했으면 근무시간 계산
		if(request.getCheckIn() != null && request.getCheckOut() != null) {
		    calculateWorkMinutes(att);
		}
		
		attendanceRepository.save(att);
		
		return AttendanceResponse.from(att);
	}
	
	
	// 관리자 보정 쓰기 attId, AttendanceRequest AttendanceResponse
	@Transactional
	public AttendanceResponse editAtt(Long attId, AttendanceRequest request, Long comId) {

		// 수정할 근태 기록 찾기 + 타사 근태 수정 차단
		Attendance attendance = attendanceRepository
				.findByAttIdAndEmployee_Company_ComId(attId, comId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 근태 기록입니다."));

		// request 시간으로 덮어쓰기
		attendance.setCheckIn(request.getCheckIn());
		attendance.setCheckOut(request.getCheckOut());
		
		if (request.getAttStatus() != null) {
	        attendance.setAttStatus(request.getAttStatus());
	    }

		// 출/퇴근 시간이 모두 있을 때만 근무시간 계산
	    if (request.getCheckIn() != null && request.getCheckOut() != null) {
	        calculateWorkMinutes(attendance);
	    } else {
	        // 시간 없는 상태(결근, 연차 등)는 근무시간 0으로 초기화
	        attendance.setWorkMinutes(0);
	        attendance.setOvertimeMinutes(0);
	        attendance.setNightMinutes(0);
	    }

	    return AttendanceResponse.from(attendance);
	}
	
	
	
	private void calculateWorkMinutes(Attendance att) {
	    // 1. 총 근무 시간 (check_out - check_in)
		LocalDateTime checkIn = att.getCheckIn();
	    LocalDateTime checkOut = att.getCheckOut();
	    
	    LocalDateTime standardStart = att.getAttDate().atTime(9, 0);
	    // LocalDateTime standardEnd = att.getAttDate().atTime(18, 0);
	    
	    // 1-1. 근로 시작 전 출근 기록은 남기되 근무 시작은 09:00으로 보정해야함(근무시간 480분 준수)
	    if(checkIn.isBefore(standardStart)) { checkIn = standardStart; }
	    
	    long total = Duration.between(checkIn, checkOut).toMinutes();
	    
	    // 2. 휴게시간(12:00부터 13:00까지 60분, 정상 근무시) 차감
	    LocalDateTime breakStart = att.getAttDate().atTime(12, 0);
	    LocalDateTime breakEnd   = att.getAttDate().atTime(13, 0);
	    
	    LocalDateTime overlapStart = checkIn.isAfter(breakStart) ? checkIn : breakStart;
	    LocalDateTime overlapEnd   = checkOut.isBefore(breakEnd) ? checkOut : breakEnd;
	    
	    long breakOverlap = Math.max(0, Duration.between(overlapStart, overlapEnd).toMinutes());
	    
	    // 3. workMinutes 세팅
	    long workMinutes = (total - breakOverlap);

	    // 4. overtimeMinutes = max(0, workMinutes - 480) 연장 시간
	    long overtimeMinutes = Math.max(0, workMinutes - 480);

	    // 5. nightMinutes 야간 근무(연장) - 야간 근로수당 적용되는 시간 오후 10시~오전 6시
	    LocalDateTime nightStart = att.getAttDate().atTime(22, 0);
	    LocalDateTime nightEnd   = att.getAttDate().plusDays(1).atTime(6, 0);

	    LocalDateTime nightOverlapStart = checkIn.isAfter(nightStart) ? checkIn : nightStart;
	    LocalDateTime nightOverlapEnd   = checkOut.isBefore(nightEnd) ? checkOut : nightEnd;

	    long nightMinutes = Math.max(0, Duration.between(nightOverlapStart, nightOverlapEnd).toMinutes());
	    
	    // 6. Entity에 세팅 / long → int 캐스팅
	    att.setWorkMinutes((int)workMinutes);
	    att.setOvertimeMinutes((int)overtimeMinutes);
	    att.setNightMinutes((int)nightMinutes);

	}

}
