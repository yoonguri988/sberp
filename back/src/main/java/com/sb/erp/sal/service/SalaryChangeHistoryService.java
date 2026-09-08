package com.sb.erp.sal.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.emp.entity.Employee;
import com.sb.erp.emp.repository.EmpRepository;
import com.sb.erp.global.security.ActorContext;
import com.sb.erp.sal.dto.response.SalaryChangeHistoryResponse;
import com.sb.erp.sal.entity.SalHist;
import com.sb.erp.sal.entity.type.ChangeDomainType;
import com.sb.erp.sal.entity.type.ChangeType;
import com.sb.erp.sal.repository.SalaryChangeHistoryRepository;
import com.sb.erp.sal.repository.spec.SalaryChangeHistorySpecs;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryChangeHistoryService {

    private final SalaryChangeHistoryRepository salaryChangeHistoryRepository;
    // 조회 전용(findById만 사용). emp 모듈의 EmpMapper/EmpService(MyBatis)와는 별개의 경로.
    private final EmpRepository empRepo;

    // 급여기준/급여지급 서비스가 CUD 처리시 호출, 이력 자동 기록
    // comId는 변경 대상 직원의 소속 회사 스냅샷
    @Transactional
    public void record(Long actorEmpId, Long targetEmpId, Long comId, ChangeDomainType domainType, Long targetId,
                        ChangeType changeType, String beforeValue, String afterValue, String description) {

        String actorName = empRepo.findById(actorEmpId)
                .map(Employee::getEmpName)
                .orElse(null);

        SalHist history = SalHist.builder()
                .actorEmpId(actorEmpId)
                .actorName(actorName)
                .trgtEmpId(targetEmpId)
                .comId(comId)
                .domType(domainType)
                .trgtId(targetId)
                .chgType(changeType)
                .bfrVal(beforeValue)
                .aftVal(afterValue)
                .descr(description)
                .build();

        salaryChangeHistoryRepository.save(history);
    }

    // 급여 변경 이력 조회 
    // 필터링: 행위자,처리유형,기간 / 페이지네이션 / comId
    public Page<SalaryChangeHistoryResponse> search(Long actorEmpId, ChangeType changeType,
                                                      LocalDateTime from, LocalDateTime to,
                                                      ActorContext actor, Pageable pageable) {
        Long comIdFilter = actor.root() ? null : actor.comId();
        return salaryChangeHistoryRepository
                .findAll(SalaryChangeHistorySpecs.search(actorEmpId, changeType, from, to, comIdFilter), pageable)
                .map(SalaryChangeHistoryResponse::from);
    }
}
