package com.sb.erp.sal.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalPayItem;

@Repository
public interface SalaryPaymentItemRepository extends JpaRepository<SalPayItem, Long> {

    List<SalPayItem> findBySalPay_PayId(Long payId);
}
