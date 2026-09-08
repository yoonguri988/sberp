package com.sb.erp.sal.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalAcct;

@Repository
public interface SalaryAccountRepository extends JpaRepository<SalAcct, Long> {

    Optional<SalAcct> findByEmployee_EmpId(Long empId);

    boolean existsByEmployee_EmpId(Long empId);
}
