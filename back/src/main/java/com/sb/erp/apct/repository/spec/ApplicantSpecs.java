package com.sb.erp.apct.repository.spec;

import org.springframework.data.jpa.domain.Specification;

import com.sb.erp.apct.entity.Applicant;

import jakarta.persistence.criteria.Predicate;

public class ApplicantSpecs { // 검색(필터링) 조건 조립용
    private ApplicantSpecs() {}

    public static Specification<Applicant> search(Long comId, Long recId, String apctStatus) {
        return (root, query, cb) -> {
            Predicate predicate = cb.conjunction();

            if (comId != null) {                              // ★ 수정: null 체크 추가
                predicate = cb.and(predicate, cb.equal(root.get("company").get("comId"), comId));
            }
            if (recId != null) {
                predicate = cb.and(predicate, cb.equal(root.get("recruit").get("recId"), recId));
            }
            if (apctStatus != null) {
                predicate = cb.and(predicate, cb.equal(root.get("apctStatus"), apctStatus));
            }

            return predicate;
        };
    }
}