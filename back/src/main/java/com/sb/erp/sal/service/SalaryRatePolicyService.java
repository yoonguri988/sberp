package com.sb.erp.sal.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.sal.dto.request.SalaryRatePolicyCreateRequest;
import com.sb.erp.sal.dto.response.SalaryRatePolicyResponse;
import com.sb.erp.sal.entity.SalRatePlcy;
import com.sb.erp.sal.repository.SalaryRatePolicyRepository;

import lombok.RequiredArgsConstructor;

/**
 * 4대보험 요율 정책(sal_rate_plcy) 관리.
 * 관리자가 연 1회(요율 개정 시) 등록하며, 매월 급여 산정 시 NationalPensionCalculator 등이 이 값을 조회해
 * baseSal x rate를 자동 계산한다(salary-calculation-engine-design.md 참고). ROOT 전용 - 회사 무관 전국
 * 공통 법정 요율이라 특정 회사 ADMIN이 임의로 바꿀 수 없어야 한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryRatePolicyService {

    private final SalaryRatePolicyRepository salaryRatePolicyRepository;

    @Transactional
    public SalaryRatePolicyResponse register(SalaryRatePolicyCreateRequest request) {
        // 기존에 유효 중이던(eff_to가 NULL인) 정책이 있다면 신규 정책 시작일 전날짜로 종료 처리(이력 보존)
        salaryRatePolicyRepository.findByEffToIsNull()
                .ifPresent(prev -> prev.closeAsHistory(request.getEffFrom().minusDays(1)));
        
        // 변경된 UPDATE 쿼리를 DB에 즉시 강제 반영
        salaryRatePolicyRepository.flush();
        
        SalRatePlcy entity = SalRatePlcy.builder()
                .plcyYear(request.getPlcyYear())
                .pensRate(request.getPensRate())
                .hlthRate(request.getHlthRate())
                .careRate(request.getCareRate())
                .emplRate(request.getEmplRate())
                .effFrom(request.getEffFrom())
                .build();

        SalRatePlcy saved = salaryRatePolicyRepository.save(entity);
        return SalaryRatePolicyResponse.from(saved);
    }

    public List<SalaryRatePolicyResponse> findAll() {
        return salaryRatePolicyRepository.findAllByOrderByEffFromDesc().stream()
                .map(SalaryRatePolicyResponse::from)
                .toList();
    }
}
