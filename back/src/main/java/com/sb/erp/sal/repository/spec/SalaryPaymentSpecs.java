package com.sb.erp.sal.repository.spec;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.sb.erp.sal.entity.SalPay;
import com.sb.erp.sal.entity.type.PaymentStatus;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;

/**
 * 급여 지급 내역 검색조건 (7-2: 직원명/부서/지급월/지급상태, 페이지네이션 + 회사(comId) 스코프)
 *
 * Company의 PK 필드명은 다른 엔티티들과 동일한 네이밍 규칙을 근거로 comId로 가정했습니다
 * (Company.java 미확인 - 다르면 아래 comId 관련 줄만 고치면 됩니다).
 */
public class SalaryPaymentSpecs {

    private SalaryPaymentSpecs() {
    }

    /** comId가 null이면(ROOT) 회사 스코프를 걸지 않는다. */
    public static Specification<SalPay> search(String empName, String department,
                                                 LocalDate payMonth, PaymentStatus stat, Long comId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();
            Join<Object, Object> employeeJoin = root.join("employee");

            if (StringUtils.hasText(empName)) {
                predicate = cb.and(predicate, cb.like(employeeJoin.get("empName"), "%" + empName + "%"));
            }
            if (StringUtils.hasText(department)) {
                Join<Object, Object> deptJoin = employeeJoin.join("department");
                predicate = cb.and(predicate, cb.like(deptJoin.get("deptName"), "%" + department + "%"));
            }
            if (payMonth != null) {
                predicate = cb.and(predicate, cb.equal(root.get("payMonth"), payMonth));
            }
            if (stat != null) {
                predicate = cb.and(predicate, cb.equal(root.get("stat"), stat));
            }
            if (comId != null) {
                Join<Object, Object> companyJoin = employeeJoin.join("company");
                predicate = cb.and(predicate, cb.equal(companyJoin.get("comId"), comId));
            }
            return predicate;
        };
    }
}
