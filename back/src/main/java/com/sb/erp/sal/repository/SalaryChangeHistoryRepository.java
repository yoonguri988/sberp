package com.sb.erp.sal.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalHist;

@Repository
public interface SalaryChangeHistoryRepository
        extends JpaRepository<SalHist, Long>, JpaSpecificationExecutor<SalHist> {
}
