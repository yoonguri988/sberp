package com.sb.erp.sal.repository.spec;

import java.time.LocalDateTime;

import org.springframework.data.jpa.domain.Specification;

import com.sb.erp.sal.entity.SalHist;
import com.sb.erp.sal.entity.type.ChangeType;

import jakarta.persistence.criteria.Predicate;

/** 급여 변경이력 검색조건 (8-1: 행위자/처리유형/기간, 페이지네이션 + 회사(comId) 스코프) */
public class SalaryChangeHistorySpecs {

    private SalaryChangeHistorySpecs() {
    }

    /** comId가 null이면(ROOT) 회사 스코프를 걸지 않는다. */
    public static Specification<SalHist> search(Long actorEmpId, ChangeType chgType,
                                                  LocalDateTime from, LocalDateTime to, Long comId) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (actorEmpId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("actorEmpId"), actorEmpId));
            }
            if (chgType != null) {
                predicate = cb.and(predicate, cb.equal(root.get("chgType"), chgType));
            }
            if (from != null) {
                predicate = cb.and(predicate, cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicate = cb.and(predicate, cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }
            if (comId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("comId"), comId));
            }
            return predicate;
        };
    }
}
