package com.sb.erp.sal.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.global.security.ActorContext;
import com.sb.erp.sal.dto.request.SalaryPositionAllowanceCreateRequest;
import com.sb.erp.sal.dto.response.SalaryPositionAllowanceResponse;
import com.sb.erp.sal.entity.SalPosAlw;
import com.sb.erp.sal.repository.SalaryPositionAllowanceRepository;

import lombok.RequiredArgsConstructor;

/**
 * 직책별 수당 정책(sal_pos_alw) 관리. 회사(com_id)별로 금액이 다를 수 있으므로 com_id 스코프를 건다.
 * PositionAllowanceCalculator가 이 값을 조회해 자동 산정한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryPositionAllowanceService {

    private final SalaryPositionAllowanceRepository salaryPositionAllowanceRepository;

    @Transactional
    public SalaryPositionAllowanceResponse register(SalaryPositionAllowanceCreateRequest request, ActorContext actor) {
        if (!actor.canAccessCompany(request.getComId())) {
            throw new AccessDeniedException("다른 회사의 직책수당 정책은 등록할 수 없습니다.");
        }

        // 동일 com_id+pos 조합 중 기존에 유효 중이던 정책은 신규 정책 시작일 전날짜로 종료 처리(이력 보존)
        salaryPositionAllowanceRepository
                .findByComIdAndPosAndEffToIsNull(request.getComId(), request.getPos())
                .ifPresent(prev -> prev.closeAsHistory(request.getEffFrom().minusDays(1)));

        salaryPositionAllowanceRepository.flush();
        
        SalPosAlw entity = SalPosAlw.builder()
                .pos(request.getPos())
                .comId(request.getComId())
                .amt(request.getAmt())
                .effFrom(request.getEffFrom())
                .build();

        SalPosAlw saved = salaryPositionAllowanceRepository.save(entity);
        return SalaryPositionAllowanceResponse.from(saved);
    }

    public List<SalaryPositionAllowanceResponse> findAll(Long comId, ActorContext actor) {
        if (!actor.canAccessCompany(comId)) {
            throw new AccessDeniedException("다른 회사의 직책수당 정책은 조회할 수 없습니다.");
        }
        return salaryPositionAllowanceRepository.findAllByComIdOrderByPosAscEffFromDesc(comId).stream()
                .map(SalaryPositionAllowanceResponse::from)
                .toList();
    }
}
