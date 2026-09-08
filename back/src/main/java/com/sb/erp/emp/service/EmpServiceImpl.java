package com.sb.erp.emp.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.sb.erp.att.entity.LeaveBalance;
import com.sb.erp.att.repository.LeaveBalanceRepository;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.dto.request.EmpSearchRequest;
import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.emp.repository.EmpMapper;
import com.sb.erp.perm.dto.response.EmpAuthResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmpServiceImpl implements EmpService {

	private final EmpMapper empMapper;
	private final PasswordEncoder passEncoder;
	private final EmailService emailService;
	private final LeaveBalanceRepository leaveBalanceRepository;

	// ─── 조회 ────────────────────────────
	@Override
	public EmpResponse selectByEmpId(long empId, Long comId) {
		return empMapper.selectByEmpId(empId, comId);
	}

	@Override
	public EmpResponse selectByEmpEmail(String empEmail) {
		return empMapper.selectByEmpEmail(empEmail);
	}

	@Override
	public List<EmpResponse> search(EmpSearchRequest dto, Long comId, boolean isAdmin) {
		dto.setComId(comId);

		List<EmpResponse> list = empMapper.search(dto);

		// 관리자가 아니면 민감 정보 마스킹 (이메일, 연락처, 입사일)
		if (!isAdmin) {
			list.forEach(this::maskSensitiveFields);
		}
		return list;
	}

	@Override
	public int selectCnt(EmpSearchRequest dto, Long comId) {
		dto.setComId(comId);
		return empMapper.selectCnt(dto);
	}

	@Override
	public List<EmpResponse> selectByDeptId(long deptId) {
		return empMapper.selectByDeptId(deptId);
	}

	// ─── 등록 / 수정 ─────────────────────
	@Override
	@Transactional  // afterCommit 훅 발동을 위해 필수
	public int insert(EmpRequest dto, Long comId) {
		int result = -1;
		dto.setComId(comId);
		dto.setEmpPass(passEncoder.encode(dto.getEmpNo()));

		if (dto.getEmpStatus() == null || dto.getEmpStatus().isEmpty()) {
			dto.setEmpStatus("재직");
		}

		result = empMapper.insert(dto);

		if (result > 0) {
			
			// 신규 사원 연차 balance 초기화(0/0 - 관리자가 추후 연차 발생 실행)
			LeaveBalance balance = LeaveBalance.builder()
					.employee(Employee.builder()
					.empId(dto.getEmpId()).build())
					.year(java.time.LocalDate.now().getYear())
					.totalDays(java.math.BigDecimal.ZERO)
					.usedDays(java.math.BigDecimal.ZERO).build();
			leaveBalanceRepository.save(balance);

			// ⭐ 트랜잭션 커밋 후에만 비동기 메일 발송 예약
			// - 롤백되면 실행 안 됨 → 존재하지 않는 사원에게 메일 나갈 위험 없음
			// - @Async 스레드로 위임 → 응답 지연 없음
			final EmpRequest empSnapshot = dto;
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					try {
						emailService.sendWelcomeMailAsync(empSnapshot);
					} catch (Exception e) {
						// 커밋 이후이므로 등록 자체는 이미 확정됨. 로그만.
						// 만약 이 예외로 메일이 못 나가도 다음날 01:30 스케줄러가 복구.
						log.error("[EmpService] 환영 메일 예약 실패", e);
					}
				}
			});
		}
		return result;
	}

	@Override
	public int update(EmpRequest dto, Long comId) {
		dto.setComId(comId);
		return empMapper.update(dto);
	}

	// ─── 중복 검사 ───────────────────────
	@Override
	public boolean isEmailDuplicate(String empEmail) {
		return empMapper.countByEmpEmail(empEmail) > 0;
	}

	@Override
	public boolean isMobileDuplicate(String empMobile) {
		return empMapper.countByEmpMobile(empMobile) > 0;
	}

	@Override
	public boolean isEmpNoDuplicate(String empNo, Long comId) {
		return empMapper.countByEmpNo(empNo, comId) > 0;
	}

	// ─── 비밀번호 ────────────────────────
	@Override
	public int updatePassByEmpId(EmpRequest dto, Long comId) {
		dto.setComId(comId);
		return empMapper.updatePassByEmpId(dto);
	}

	// 관리자 초기화 - 사번으로 리셋
	@Override
	public int resetPassByEmpNo(long empId, Long comId) {
		EmpResponse emp = empMapper.selectByEmpId(empId, comId);
		if (emp == null)
			return 0;

		EmpRequest dto = new EmpRequest();
		dto.setEmpId(empId);
		dto.setComId(comId);
		dto.setEmpPass(passEncoder.encode(emp.getEmpNo()));
		// 사번으로 초기화 = 임시 비밀번호 상태이므로 다음 로그인 시 비밀번호 변경을 강제한다.
		dto.setMustChangePwd("Y");
		return empMapper.updatePassByEmpId(dto);
	}

	// 본인 비밀번호 변경 - 현재 비번 검증 후 변경
	// 반환값: -1(사원 없음), 0(불일치), 1(성공)
	@Override
	public int changePassword(long empId, String currentPass, String newPass, Long comId) {
		String savedHash = empMapper.selectPassById(empId);
		if (savedHash == null)
			return -1;
		if (!passEncoder.matches(currentPass, savedHash))
			return 0;

		EmpRequest dto = new EmpRequest();
		dto.setEmpId(empId);
		dto.setComId(comId);
		dto.setEmpPass(passEncoder.encode(newPass));
		// 본인이 직접 새 비밀번호를 설정했으므로 강제 변경 상태를 해제한다.
		dto.setMustChangePwd("N");
		return empMapper.updatePassByEmpId(dto);
	}

	// 기존 비밀번호와 일치 확인
	@Override
	public boolean matchPassword(EmpRequest dto) {
		String existsPass = empMapper.selectPassById(dto.getEmpId());
		return passEncoder.matches(dto.getEmpPass(), existsPass);
	}

	// 비밀번호 찾기시 해당하는 사원 정보가 있는지 확인
	@Override
	public EmpResponse selectForVerify(EmpRequest dto) {
		return empMapper.selectForVerify(dto);
	}

	// ─── 권한 표시용 ─────────────────────
	@Override
	public List<EmpAuthResponse> selectAuthByComId(Long comId) {
		return empMapper.selectAuthByComId(comId);
	}

	@Override
	public EmpResponse selectAuthByEmpId(long empId) {
		return empMapper.selectAuthByEmpId(empId);
	}

	// 비밀번호 분실시 본인 확인 - EMP_ID로만 조회해서 업데이트
	@Override
	public int updatePassByEmpIdOnly(EmpRequest dto) {
		return empMapper.updatePassByEmpIdOnly(dto);
	}

	// ─── 민감 정보 마스킹 ─────────────────────────
	// 목록 조회 응답에만 사용 / 관리자 외 사용자에게 개인정보 노출 최소화.

	private void maskSensitiveFields(EmpResponse emp) {
		emp.setEmpEmail(maskEmail(emp.getEmpEmail()));
		emp.setEmpMobile(maskMobile(emp.getEmpMobile()));
		emp.setHireDate(maskHireDate(emp.getHireDate()));
	}

	// 이메일: emp00013@sbis.co.kr → e***@sbis.co.kr
	private String maskEmail(String email) {
		if (email == null || email.isEmpty()) return email;
		int at = email.indexOf('@');
		if (at <= 0) return "***";
		return email.charAt(0) + "***" + email.substring(at);
	}

	// 전화번호: 010-1145-4014 → 010-****-4014
	private String maskMobile(String mobile) {
		if (mobile == null) return null;
		return mobile.replaceFirst("(\\d{2,3})-\\d{3,4}-(\\d{4})", "$1-****-$2");
	}

	// 입사일: 4자 이상이면 년도까지만
	private String maskHireDate(String hireDate) {
		if (hireDate == null || hireDate.length() < 4) return hireDate;
		return hireDate.substring(0, 4);
	}

}
