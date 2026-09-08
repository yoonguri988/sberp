package com.sb.erp.sal.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.sal.entity.SalAiChatLog;

@Repository
public interface SalAiChatLogRepository extends JpaRepository<SalAiChatLog, Long> {

    // 본인 대화 이력(최신순, 페이지네이션)
    Page<SalAiChatLog> findByEmpIdOrderByCreatedAtDesc(Long empId, Pageable pageable);
}
