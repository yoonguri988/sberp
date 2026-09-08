package com.sb.erp.auth.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.auth.dto.request.LoginHistorySearchRequest;
import com.sb.erp.auth.dto.response.LoginHistoryResponse;
import com.sb.erp.auth.dto.response.LoginHistoryStatsResponse;
import com.sb.erp.auth.entity.LoginHistory;
import com.sb.erp.auth.repository.LoginHistoryRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 조회가 대부분이므로 기본은 읽기 전용, 저장 메서드에서만 @Transactional로 오버라이드
@Slf4j
public class LoginHistoryService {

	private final LoginHistoryRepository loginHistoryRepo;

	private static final int MAX_REASON_LEN = 200;
	private static final int MAX_AGENT_LEN = 500;
	private static final int DEFAULT_SIZE = 10;

	// 로그인 성공 이력 저장
	// - 로그인 자체를 막으면 안 되는 부가 기능이므로, 저장 중 오류가 나도 밖으로 던지지 않고 로그만 남긴다.
	@Transactional
	public void recordSuccess(Long empId, String empEmail, String empName, String loginIp, String userAgent) {
		try {
			LoginHistory history = LoginHistory.builder()
					.empId(empId)
					.empEmail(empEmail)
					.empName(empName)
					.status(LoginHistory.STATUS_SUCCESS)
					.loginIp(loginIp)
					.userAgent(truncate(userAgent, MAX_AGENT_LEN))
					.loginAt(LocalDateTime.now())
					.build();
			loginHistoryRepo.save(history);
		} catch (Exception e) {
			log.error("[LoginHistoryService] 로그인 성공 이력 저장 실패: empEmail=" + empEmail, e);
		}
	}

	// 로그인 실패 이력 저장 (비밀번호 불일치 / 존재하지 않는 계정 등)
	@Transactional
	public void recordFailure(String empEmail, String failReason, String loginIp, String userAgent) {
		try {
			LoginHistory history = LoginHistory.builder()
					.empEmail(empEmail)
					.status(LoginHistory.STATUS_FAIL)
					.failReason(truncate(failReason, MAX_REASON_LEN))
					.loginIp(loginIp)
					.userAgent(truncate(userAgent, MAX_AGENT_LEN))
					.loginAt(LocalDateTime.now())
					.build();
			loginHistoryRepo.save(history);
		} catch (Exception e) {
			log.error("[LoginHistoryService] 로그인 실패 이력 저장 실패: empEmail=" + empEmail, e);
		}
	}

	// 로그인 시도 제한(계정 잠금)용 - 최근 windowMinutes분 내 해당 이메일의 실패 횟수
	// AuthController#login에서 비밀번호 검증 전에 호출해 무차별 대입 공격을 차단하는 데 사용한다.
	public long countRecentFailures(String empEmail, int windowMinutes) {
		LocalDateTime after = LocalDateTime.now().minusMinutes(windowMinutes);
		return loginHistoryRepo.countByEmpEmailAndStatusAndLoginAtAfter(empEmail, LoginHistory.STATUS_FAIL, after);
	}

	// 관리자용 로그인 이력 조회 (이메일/성공-실패/기간 검색 + 최신순 페이징)
	public Page<LoginHistoryResponse> search(LoginHistorySearchRequest search) {
		Specification<LoginHistory> spec = buildSpec(search);

		int page = (search.getPage() == null || search.getPage() < 1) ? 1 : search.getPage();
		int size = (search.getSize() == null || search.getSize() < 1) ? DEFAULT_SIZE : search.getSize();
		PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "loginAt"));

		return loginHistoryRepo.findAll(spec, pageable).map(this::toResponse);
	}

	// 관리자용 통계 (검색 조건 기준 전체/성공/실패 건수)
	public LoginHistoryStatsResponse stats(LoginHistorySearchRequest search) {
		Specification<LoginHistory> base = Specification.where(buildSpec(search));

		long total = loginHistoryRepo.count(base);
		long successCount = loginHistoryRepo.count(base.and(statusEquals(LoginHistory.STATUS_SUCCESS)));
		long failCount = loginHistoryRepo.count(base.and(statusEquals(LoginHistory.STATUS_FAIL)));

		return new LoginHistoryStatsResponse(total, successCount, failCount);
	}

	// ── 검색 조건 조립 ──
	private Specification<LoginHistory> buildSpec(LoginHistorySearchRequest search) {
		List<Specification<LoginHistory>> specs = new ArrayList<>();

		if (search.getEmpEmail() != null && !search.getEmpEmail().isBlank()) {
			String keyword = "%" + search.getEmpEmail().trim().toLowerCase() + "%";
			specs.add((root, query, cb) -> cb.like(cb.lower(root.get("empEmail")), keyword));
		}
		if (search.getStatus() != null && !search.getStatus().isBlank()) {
			specs.add(statusEquals(search.getStatus()));
		}
		if (search.getStartDt() != null && !search.getStartDt().isBlank()) {
			LocalDateTime start = LocalDate.parse(search.getStartDt()).atStartOfDay();
			specs.add((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("loginAt"), start));
		}
		if (search.getEndDt() != null && !search.getEndDt().isBlank()) {
			LocalDateTime end = LocalDate.parse(search.getEndDt()).atTime(LocalTime.MAX);
			specs.add((root, query, cb) -> cb.lessThanOrEqualTo(root.get("loginAt"), end));
		}

		return specs.stream().reduce(Specification::and).orElse(null);
	}

	private Specification<LoginHistory> statusEquals(String status) {
		return (root, query, cb) -> cb.equal(root.get("status"), status);
	}

	private LoginHistoryResponse toResponse(LoginHistory h) {
		return new LoginHistoryResponse(
				h.getLoginId(), h.getEmpEmail(), h.getEmpId(), h.getEmpName(),
				h.getStatus(), h.getFailReason(), h.getLoginIp(), h.getUserAgent(), h.getLoginAt()
		);
	}

	private String truncate(String s, int max) {
		if (s == null) return null;
		return s.length() <= max ? s : s.substring(0, max);
	}
}