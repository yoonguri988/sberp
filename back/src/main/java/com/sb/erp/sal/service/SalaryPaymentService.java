package com.sb.erp.sal.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

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
import com.sb.erp.sal.calc.SalPayItemCandidate;
import com.sb.erp.sal.calc.SalaryCalculationService;
import com.sb.erp.sal.dto.request.SalaryPaymentCreateRequest;
import com.sb.erp.sal.dto.request.SalaryPaymentItemAdjustRequest;
import com.sb.erp.sal.dto.request.SalaryPaymentStatusChangeRequest;
import com.sb.erp.sal.dto.request.SalaryPaymentUpdateRequest;
import com.sb.erp.sal.dto.response.SalaryPaymentResponse;
import com.sb.erp.sal.entity.SalAcct;
import com.sb.erp.sal.entity.SalPay;
import com.sb.erp.sal.entity.SalPayItem;
import com.sb.erp.sal.entity.SalStd;
import com.sb.erp.sal.entity.type.ChangeDomainType;
import com.sb.erp.sal.entity.type.ChangeType;
import com.sb.erp.sal.entity.type.PaymentItemType;
import com.sb.erp.sal.entity.type.PaymentStatus;
import com.sb.erp.sal.repository.SalaryAccountRepository;
import com.sb.erp.sal.repository.SalaryPaymentItemRepository;
import com.sb.erp.sal.repository.SalaryPaymentRepository;
import com.sb.erp.sal.repository.SalaryStandardRepository;
import com.sb.erp.sal.repository.spec.SalaryPaymentSpecs;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaryPaymentService {

    private final SalaryPaymentRepository salaryPaymentRepository;
    private final SalaryPaymentItemRepository salaryPaymentItemRepository;
    private final SalaryStandardRepository salaryStandardRepository;
    private final SalaryAccountRepository salaryAccountRepository;
    
    private final SalaryCalculationService salaryCalculationService;
    private final SalaryChangeHistoryService salaryChangeHistoryService;

    private final EmpRepository employeeRepository;
    private final ObjectMapper objectMapper;

    // 급여 등록 (산정)
    // 2026-08-20: 관리자가 items(수당/공제 금액)를 직접 입력하던 방식에서, 급여 산정 엔진(SalaryCalculationService)이
    // 급여기준/직책/정책 테이블을 근거로 자동 산정하는 방식으로 변경(salary-calculation-engine-design.md 참고).
    @Transactional
    public SalaryPaymentResponse register(SalaryPaymentCreateRequest request, ActorContext actor) {
        Employee employee = employeeRepository.findById(request.getEmpId())
                .orElseThrow(() -> new ResourceNotFoundException("직원 정보를 찾을 수 없습니다. empId=" + request.getEmpId()));

        Long targetComId = employee.getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 급여는 등록할 수 없습니다.");
        }

        SalStd standard = salaryStandardRepository.findByEmployee_EmpIdAndActvTrue(employee.getEmpId())
                .orElseThrow(() -> new ResourceNotFoundException("적용 중인 급여기준이 없습니다. empId=" + employee.getEmpId()));

        // 급여 수령 계좌가 등록되어 있어야 지급을 진행할 수 있다. 지급 시점 값을 SalPay에 스냅샷으로 남긴다.
        SalAcct account = salaryAccountRepository.findByEmployee_EmpId(employee.getEmpId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "급여 수령 계좌가 등록되지 않았습니다. 계좌를 먼저 등록해주세요. empId=" + employee.getEmpId()));

        LocalDate normalizedPayMonth = request.getPayMonth().withDayOfMonth(1);
        List<SalPayItemCandidate> candidates =
                salaryCalculationService.calculate(standard, employee, YearMonth.from(normalizedPayMonth));

        Long allowTotal = sumCandidatesByType(candidates, PaymentItemType.ALLOWANCE);
        Long dedtTotal = sumCandidatesByType(candidates, PaymentItemType.DEDUCTION);
        Long netPay = standard.getBaseSal() + allowTotal - dedtTotal;

        SalPay payment = SalPay.builder()
                .employee(employee)
                .salStd(standard)
                .payMonth(normalizedPayMonth)
                .baseSal(standard.getBaseSal())
                .allowTotal(allowTotal)
                .dedtTotal(dedtTotal)
                .netPay(netPay)
                .stat(PaymentStatus.PENDING) // "산정 대기" - 관리자 확인/조정 전까지는 대기 상태
                .bankName(account.getBankName())
                .acctNo(account.getAcctNo())
                .hldrName(account.getHldrName())
                .build();

        candidates.forEach(candidate -> payment.addItem(toItemEntity(candidate)));

        SalPay saved = salaryPaymentRepository.save(payment);

        String calcSummary = candidates.stream()
                .map(c -> c.getItemCode() + "=" + c.getAmt() + "원(" + c.getCalcBasis() + ")")
                .collect(Collectors.joining(" | "));

        salaryChangeHistoryService.record(actor.empId(), employee.getEmpId(), targetComId,
                ChangeDomainType.SALARY_PAYMENT, saved.getPayId(), ChangeType.CREATE, null, toJson(saved),
                "급여 산정 엔진 자동 산정 결과 등록. " + calcSummary);

        return SalaryPaymentResponse.from(saved);
    }

    // 급여 조회(전체)
    // 권한(ROLE_ADMIN), 소속회사(comId)
    public Page<SalaryPaymentResponse> findAll(String empName, String department, LocalDate paymentMonth,
                                                PaymentStatus status, ActorContext actor, Pageable pageable) {
        LocalDate normalizedMonth = paymentMonth != null ? paymentMonth.withDayOfMonth(1) : null;
        Long comIdFilter = actor.root() ? null : actor.comId();
        return salaryPaymentRepository
                .findAll(SalaryPaymentSpecs.search(empName, department, normalizedMonth, status, comIdFilter), pageable)
                .map(SalaryPaymentResponse::from);
    }

    // 급여조회(본인) - 급여 명세서
    public Page<SalaryPaymentResponse> findMyPayments(Long empId, Pageable pageable) {
        return salaryPaymentRepository.findByEmployee_EmpId(empId, pageable)
                .map(SalaryPaymentResponse::from);
    }

    // 급여 재산정 (대기 상태)
    // 관리자가 items를 자유 입력해 통째로 갈아끼우던 방식은 제거했다 (계산 엔진 우회 + reason 미강제 문제,
    // salary-calculation-engine-design.md "관리자 수동 조정 정책" 참고). 대신 SalaryCalculationService를
    // 다시 호출해 재산정한다 — 예: SalStd(급여기준)가 Draft 생성 이후 바뀐 경우 최신 기준으로 다시 계산.
    // 개별 항목 하나만 근거 남기며 조정하려면 adjustItem()(PATCH /api/salpay/{id}/items/{itemId})을 사용한다.
    @Transactional
    public SalaryPaymentResponse update(Long payId, SalaryPaymentUpdateRequest request, ActorContext actor) {
        SalPay payment = salaryPaymentRepository.findById(payId)
                .orElseThrow(() -> new ResourceNotFoundException("급여 지급 내역을 찾을 수 없습니다. id=" + payId));

        Employee employee = payment.getEmployee();
        Long targetComId = employee.getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 급여는 수정할 수 없습니다.");
        }

        if (!payment.isEditable()) {
            throw new IllegalStateException("대기 상태의 급여만 재산정할 수 있습니다.");
        }

        SalStd standard = salaryStandardRepository.findByEmployee_EmpIdAndActvTrue(employee.getEmpId())
                .orElseThrow(() -> new ResourceNotFoundException("적용 중인 급여기준이 없습니다. empId=" + employee.getEmpId()));

        String beforeSnapshot = toJson(payment);

        List<SalPayItemCandidate> candidates =
                salaryCalculationService.calculate(standard, employee, YearMonth.from(payment.getPayMonth()));

        payment.clearItems();
        candidates.forEach(candidate -> payment.addItem(toItemEntity(candidate)));

        Long allowTotal = sumCandidatesByType(candidates, PaymentItemType.ALLOWANCE);
        Long dedtTotal = sumCandidatesByType(candidates, PaymentItemType.DEDUCTION);
        payment.setSalStd(standard);
        payment.updateAmounts(standard.getBaseSal(), allowTotal, dedtTotal);

        String calcSummary = candidates.stream()
                .map(c -> c.getItemCode() + "=" + c.getAmt() + "원(" + c.getCalcBasis() + ")")
                .collect(Collectors.joining(" | "));
        String reasonSuffix = (request != null && request.getReason() != null && !request.getReason().isBlank())
                ? " 사유: " + request.getReason()
                : "";

        salaryChangeHistoryService.record(actor.empId(), employee.getEmpId(), targetComId,
                ChangeDomainType.SALARY_PAYMENT, payment.getPayId(), ChangeType.UPDATE, beforeSnapshot, toJson(payment),
                "급여 산정 엔진 재산정." + reasonSuffix + " " + calcSummary);

        return SalaryPaymentResponse.from(payment);
    }

    // 급여 산정 결과 개별 항목 수동 조정 (대기 상태에서만 허용, 사유 필수)
    // salary-calculation-engine-design.md "관리자 수동 조정 정책" 참고
    @Transactional
    public SalaryPaymentResponse adjustItem(Long payId, Long itemId, SalaryPaymentItemAdjustRequest request,
                                             ActorContext actor) {
        SalPay payment = salaryPaymentRepository.findById(payId)
                .orElseThrow(() -> new ResourceNotFoundException("급여 지급 내역을 찾을 수 없습니다. id=" + payId));

        Long targetComId = payment.getEmployee().getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 급여는 조정할 수 없습니다.");
        }

        if (!payment.isEditable()) {
            throw new IllegalStateException("대기 상태의 급여 항목만 수동 조정할 수 있습니다.");
        }

        SalPayItem item = salaryPaymentItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("급여 항목을 찾을 수 없습니다. itemId=" + itemId));

        if (!item.getSalPay().getPayId().equals(payId)) {
            throw new IllegalArgumentException("해당 급여 지급 건에 속하지 않는 항목입니다. itemId=" + itemId);
        }

        Long beforeAmt = item.getAmt();
        item.setAmt(request.getAmt());

        Long allowTotal = sumItemsByType(payment.getItems(), PaymentItemType.ALLOWANCE);
        Long dedtTotal = sumItemsByType(payment.getItems(), PaymentItemType.DEDUCTION);
        payment.updateAmounts(payment.getBaseSal(), allowTotal, dedtTotal);

        salaryChangeHistoryService.record(actor.empId(), payment.getEmployee().getEmpId(), targetComId,
                ChangeDomainType.SALARY_PAYMENT, payment.getPayId(), ChangeType.MANUAL_ADJUST, String.valueOf(beforeAmt),
                String.valueOf(request.getAmt()),
                item.getItemCode() + " 자동 산정값 " + beforeAmt + "원 -> 관리자 조정값 " + request.getAmt() + "원, 사유: "
                        + request.getReason());

        return SalaryPaymentResponse.from(payment);
    }

    // 급여상태 변경 (대기->승인->지급완료) (대기->반려)
    @Transactional
    public SalaryPaymentResponse changeStatus(Long id, SalaryPaymentStatusChangeRequest request, ActorContext actor) {
        SalPay payment = salaryPaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("급여 지급 내역을 찾을 수 없습니다. id=" + id));

        Long targetComId = payment.getEmployee().getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 급여 상태는 변경할 수 없습니다.");
        }

        validateStatusTransition(payment.getStat(), request.getStat());

        String beforeSnapshot = toJson(payment);
        payment.changeStat(request.getStat(), request.getRejRsn());

        salaryChangeHistoryService.record(actor.empId(), payment.getEmployee().getEmpId(), targetComId,
                ChangeDomainType.SALARY_PAYMENT, payment.getPayId(), ChangeType.STATUS_CHANGE, beforeSnapshot, toJson(payment),
                "급여 지급 상태 변경: " + request.getStat());

        return SalaryPaymentResponse.from(payment);
    }

    // 급여삭제 (취소)
    // 지급완료 건은 삭제 불가
    @Transactional
    public void delete(Long id, ActorContext actor) {
        SalPay payment = salaryPaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("급여 지급 내역을 찾을 수 없습니다. id=" + id));

        Long targetComId = payment.getEmployee().getCompany().getComId();
        if (!actor.canAccessCompany(targetComId)) {
            throw new AccessDeniedException("다른 회사 소속 직원의 급여는 삭제할 수 없습니다.");
        }

        if (payment.getStat() == PaymentStatus.PAID) {
            throw new IllegalStateException("지급완료 건은 삭제할 수 없습니다.");
        }

        Long targetEmpId = payment.getEmployee().getEmpId();
        String beforeSnapshot = toJson(payment);

        salaryPaymentRepository.delete(payment);

        salaryChangeHistoryService.record(actor.empId(), targetEmpId, targetComId,
                ChangeDomainType.SALARY_PAYMENT, id, ChangeType.DELETE, beforeSnapshot, null, "급여 지급 내역 삭제(취소)");
    }

    private void validateStatusTransition(PaymentStatus current, PaymentStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == PaymentStatus.APPROVED || next == PaymentStatus.REJECTED;
            case APPROVED -> next == PaymentStatus.PAID || next == PaymentStatus.REJECTED;
            case PAID, REJECTED -> false;
        };
        if (!valid) {
            throw new IllegalStateException(
                    "허용되지 않는 상태 변경입니다. (" + current + " -> " + next + ")");
        }
    }

    private Long sumCandidatesByType(List<SalPayItemCandidate> candidates, PaymentItemType type) {
        return candidates.stream()
                .filter(c -> c.getItemCode().getItemType() == type)
                .map(SalPayItemCandidate::getAmt)
                .reduce(0L, Long::sum);
    }

    private Long sumItemsByType(List<SalPayItem> items, PaymentItemType type) {
        return items.stream()
                .filter(i -> i.getItemType() == type)
                .map(SalPayItem::getAmt)
                .reduce(0L, Long::sum);
    }

    private SalPayItem toItemEntity(SalPayItemCandidate candidate) {
        return SalPayItem.builder()
                .itemCode(candidate.getItemCode())
                .amt(candidate.getAmt())
                .build();
    }

    private String toJson(SalPay entity) {
        try {
            return objectMapper.writeValueAsString(SalaryPaymentResponse.from(entity));
        } catch (JsonProcessingException e) {
            return entity.toString();
        }
    }
}
