package com.sb.erp.sal.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalPay;

@Repository
public interface SalaryPaymentRepository
        extends JpaRepository<SalPay, Long>, JpaSpecificationExecutor<SalPay> {

    Page<SalPay> findByEmployee_EmpId(Long empId, Pageable pageable);
}
