package com.sb.erp.sal.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalStd;

@Repository
public interface SalaryStandardRepository
        extends JpaRepository<SalStd, Long>, JpaSpecificationExecutor<SalStd> {

    Optional<SalStd> findByEmployee_EmpIdAndActvTrue(Long empId);
}
