package com.sb.erp.sal.repository.spec;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.sb.erp.sal.entity.SalStd;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;

/**
 * 급여기준 검색조건 (6-2: 직원명/부서/직급, 페이지네이션 + 회사(comId) 스코프)
 *
 * Employee.department(Department), Employee.position(Position), Employee.company(Company) 연관관계 확인 완료.
 * 이름 필드는 empmapper.xml의 조회 컬럼(d.dept_name, p.pos_name)을 근거로 deptName / posName으로
 * 매핑했습니다. Company의 PK 필드명은 다른 엔티티들과 동일한 네이밍 규칙(empId/deptId/posId)을 근거로
 * comId로 가정했습니다(Company.java 미확인 - 다르면 아래 comId 관련 줄만 고치면 됩니다).
 */
public class SalaryStandardSpecs {

    private SalaryStandardSpecs() {
    }

    /** comId가 null이면(ROOT) 회사 스코프를 걸지 않는다. */
    public static Specification<SalStd> search(String empName, String department, String position, Long comId) {
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
            if (StringUtils.hasText(position)) {
                Join<Object, Object> posJoin = employeeJoin.join("position");
                predicate = cb.and(predicate, cb.like(posJoin.get("posName"), "%" + position + "%"));
            }
            if (comId != null) {
                Join<Object, Object> companyJoin = employeeJoin.join("company");
                predicate = cb.and(predicate, cb.equal(companyJoin.get("comId"), comId));
            }
            return predicate;
        };
    }
}
