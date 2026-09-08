package com.sb.erp.appr.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.appr.entity.ApprDoc;

@Repository
public interface ApprDocRepository extends JpaRepository<ApprDoc, Long>{

}
