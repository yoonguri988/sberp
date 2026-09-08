package com.sb.erp.sal.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.emp.repository.EmpRepository;
import com.sb.erp.global.exception.ResourceNotFoundException;
import com.sb.erp.global.security.ActorContext;
import com.sb.erp.sal.dto.request.SalaryStandardCreateRequest;
import com.sb.erp.sal.dto.request.SalaryStandardUpdateRequest;
import com.sb.erp.sal.dto.response.SalaryStandardResponse;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.ChangeDomainType;
import com.sb.erp.sal.entity.type.ChangeType;
import com.sb.erp.sal.repository.SalaryStandardRepository;
import com.sb.erp.sal.repository.spec.SalaryStandardSpecs;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryStandardService {
    private final SalaryStandardRepository salaryStandardRepository;
    private final SalaryChangeHistoryService salaryChangeHistoryService;
    private final ObjectMapper objectMapper;
    
    // 조회 전용(findById만 사용). emp 모듈의 EmpMapper/EmpService(MyBatis)와는 별개의 경로.
    private final EmpRepository empRepo;

    // 급여 기준 등록
    @Transactional
    public SalaryStandardResponse register(SalaryStandardCreateRequest request, ActorContext actor) {
        Employee employee = empRepo.findById(request.getEmpId())
                .orElseThrow(() -> new ResourceNotFoundException("직원 정보를 찾을 수 없습니다. empId=" + request.getEmpId()));

        Long targetComId = employee.getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 급여기준은 등록할 수 없습니다.");
        }

        // 기존에 적용 중인 급여기준이 있다면 새 기준 시작일 전날 종료 처리(이력 보존)
        salaryStandardRepository.findByEmployee_EmpIdAndActvTrue(employee.getEmpId())
                .ifPresent(prev -> prev.closeAsHistory(request.getStartDate().minusDays(1)));

        SalStd entity = SalStd.builder()
                .employee(employee)
                .baseSal(request.getBaseSal())
                .annuSal(request.getAnnuSal())
                .startDate(request.getStartDate())
                .actv(true)
                .build();

        SalStd saved = salaryStandardRepository.save(entity);

        salaryChangeHistoryService.record(actor.empId(), employee.getEmpId(), targetComId,
                ChangeDomainType.SALARY_STANDARD, saved.getStdId(), ChangeType.CREATE, null, toJson(saved), "급여기준 등록");

        return SalaryStandardResponse.from(saved);
    }

    // 급여기준 조회(전체)
    // ROOT 가 아니면 소속회사(comId)으로 제한
    public Page<SalaryStandardResponse> findAll(String empName, String department, String position,
                                                 ActorContext actor, Pageable pageable) {
        Long comIdFilter = actor.root() ? null : actor.comId();
        return salaryStandardRepository
                .findAll(SalaryStandardSpecs.search(empName, department, position, comIdFilter), pageable)
                .map(SalaryStandardResponse::from);
    }

    // 급여기준 조회(본인)
    public SalaryStandardResponse findMyCurrent(Long empId) {
        SalStd entity = salaryStandardRepository.findByEmployee_EmpIdAndActvTrue(empId)
                .orElseThrow(() -> new ResourceNotFoundException("현재 적용 중인 급여기준이 없습니다. empId=" + empId));
        return SalaryStandardResponse.from(entity);
    }

    // 급여기준 수정 (이전 값은 이력으로 보존)
    @Transactional
    public SalaryStandardResponse update(Long id, SalaryStandardUpdateRequest request, ActorContext actor) {
        SalStd before = salaryStandardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("급여기준을 찾을 수 없습니다. id=" + id));

        Long targetComId = before.getEmployee().getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 급여기준은 수정할 수 없습니다.");
        }

        String beforeSnapshot = toJson(before);

        // 요구사항 6-4: 수정 시 이전 값은 이력으로 보존한다 -> in-place 수정이 아니라 버저닝으로 처리
        before.closeAsHistory(request.getStartDate().minusDays(1));
        
        // 변경된 UPDATE 쿼리를 DB에 즉시 강제 반영
        salaryStandardRepository.flush();

        SalStd newVersion = SalStd.builder()
                .employee(before.getEmployee())
                .baseSal(request.getBaseSal())
                .annuSal(request.getAnnuSal())
                .startDate(request.getStartDate())
                .actv(true)
                .build();

        SalStd saved = salaryStandardRepository.save(newVersion);

        salaryChangeHistoryService.record(actor.empId(), before.getEmployee().getEmpId(), targetComId,
                ChangeDomainType.SALARY_STANDARD, saved.getStdId(), ChangeType.UPDATE, beforeSnapshot, toJson(saved),
                "급여기준 수정(연봉 인상/직급 변경 등)");

        return SalaryStandardResponse.from(saved);
    }

    // 급여 기준 삭제
    @Transactional
    public void delete(Long id, ActorContext actor) {
        SalStd entity = salaryStandardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("급여기준을 찾을 수 없습니다. id=" + id));

        Long targetComId = entity.getEmployee().getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 급여기준은 삭제할 수 없습니다.");
        }

        Long targetEmpId = entity.getEmployee().getEmpId();
        String beforeSnapshot = toJson(entity);

        salaryStandardRepository.delete(entity);

        salaryChangeHistoryService.record(actor.empId(), targetEmpId, targetComId,
                ChangeDomainType.SALARY_STANDARD, id, ChangeType.DELETE, beforeSnapshot, null, "잘못 등록된 급여기준 삭제");
    }

    private String toJson(SalStd entity) {
        try {
            return objectMapper.writeValueAsString(SalaryStandardResponse.from(entity));
        } catch (JsonProcessingException e) {
            return entity.toString();
        }
    }
}
