package com.sb.erp.sal.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.emp.repository.EmpRepository;
import com.sb.erp.global.exception.ResourceNotFoundException;
import com.sb.erp.global.security.ActorContext;
import com.sb.erp.sal.dto.request.SalaryAccountCreateRequest;
import com.sb.erp.sal.dto.request.SalaryAccountUpdateRequest;
import com.sb.erp.sal.dto.response.SalaryAccountResponse;
import com.sb.erp.sal.entity.SalAcct;
import com.sb.erp.sal.entity.type.ChangeDomainType;
import com.sb.erp.sal.entity.type.ChangeType;
import com.sb.erp.sal.repository.SalaryAccountRepository;

import lombok.RequiredArgsConstructor;

/**
 * 급여 수령 계좌 관리.
 * Employee(emp 모듈)는 리팩토링 완료된 파일이라 손대지 않고, 계좌 정보는 이 sal 모듈 전용 테이블(sal_acct)로 관리한다.
 * 계좌 변경 이력은 SalHist(SALARY_ACCOUNT 도메인)로 자동 기록되고, 지급 시점 계좌는 SalPay에 스냅샷으로 남는다
 * (SalaryPaymentServiceImpl.register() 참고).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryAccountService {
    private final SalaryAccountRepository salaryAccountRepository;
    private final SalaryChangeHistoryService salaryChangeHistoryService;
    
    private final EmpRepository empRepo;
    private final ObjectMapper objectMapper;

    // 급여 수령 계좌 등록
    // 직원당 1건, 이미 있으면 등록 불가
    @Transactional
    public SalaryAccountResponse register(Long empId, SalaryAccountCreateRequest request, ActorContext actor) {
        Employee employee = empRepo.findById(empId)
                .orElseThrow(() -> new ResourceNotFoundException("직원 정보를 찾을 수 없습니다. empId=" + empId));

        Long targetComId = employee.getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 계좌는 등록할 수 없습니다.");
        }

        if (salaryAccountRepository.existsByEmployee_EmpId(employee.getEmpId())) {
            throw new IllegalStateException("이미 등록된 계좌가 있습니다. 수정 API를 사용해주세요. empId=" + employee.getEmpId());
        }

        SalAcct entity = SalAcct.builder()
                .employee(employee)
                .bankName(request.getBankName())
                .acctNo(request.getAcctNo())
                .hldrName(request.getHldrName())
                .build();

        SalAcct saved = salaryAccountRepository.save(entity);

        salaryChangeHistoryService.record(actor.empId(), employee.getEmpId(), targetComId,
                ChangeDomainType.SALARY_ACCOUNT, saved.getAcctId(), ChangeType.CREATE, null, toJson(saved), "급여 수령 계좌 등록");

        return SalaryAccountResponse.from(saved);
    }

    // 특정 직원의 계좌 조회
    // 권한 (ROLE_ADMIN), 필수 조건 comId
    public SalaryAccountResponse findByEmpId(Long empId, ActorContext actor) {
        SalAcct entity = salaryAccountRepository.findByEmployee_EmpId(empId)
                .orElseThrow(() -> new ResourceNotFoundException("등록된 계좌 정보가 없습니다. empId=" + empId));

        Long targetComId = entity.getEmployee().getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 계좌는 조회할 수 없습니다.");
        }

        return SalaryAccountResponse.from(entity);
    }

    // 본인 계좌 조회
    public SalaryAccountResponse findMyAccount(Long empId) {
        SalAcct entity = salaryAccountRepository.findByEmployee_EmpId(empId)
                .orElseThrow(() -> new ResourceNotFoundException("등록된 계좌 정보가 없습니다. 계좌를 먼저 등록해주세요."));
        return SalaryAccountResponse.from(entity);
    }

    // 급여 수령 계좌 수정
    @Transactional
    public SalaryAccountResponse update(Long empId, SalaryAccountUpdateRequest request, ActorContext actor) {
        SalAcct entity = salaryAccountRepository.findByEmployee_EmpId(empId)
                .orElseThrow(() -> new ResourceNotFoundException("등록된 계좌 정보가 없습니다. empId=" + empId));

        Long targetComId = entity.getEmployee().getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 계좌는 수정할 수 없습니다.");
        }

        String beforeSnapshot = toJson(entity);

        entity.setBankName(request.getBankName());
        entity.setAcctNo(request.getAcctNo());
        entity.setHldrName(request.getHldrName());

        salaryChangeHistoryService.record(actor.empId(), empId, targetComId,
                ChangeDomainType.SALARY_ACCOUNT, entity.getAcctId(), ChangeType.UPDATE, beforeSnapshot, toJson(entity),
                "급여 수령 계좌 수정");

        return SalaryAccountResponse.from(entity);
    }

    private String toJson(SalAcct entity) {
        try {
            return objectMapper.writeValueAsString(SalaryAccountResponse.from(entity));
        } catch (JsonProcessingException e) {
            return entity.toString();
        }
    }
}
