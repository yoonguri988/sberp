package com.sb.erp.appr.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.appr.entity.ApprForm;
import com.sb.erp.appr.entity.ApprFormId;

@Repository
public interface ApprFormRepository extends JpaRepository<ApprForm, ApprFormId>{

}
