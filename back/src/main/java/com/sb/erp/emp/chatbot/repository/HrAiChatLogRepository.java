package com.sb.erp.emp.chatbot.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.emp.chatbot.entity.HrAiChatLog;

@Repository
public interface HrAiChatLogRepository extends JpaRepository<HrAiChatLog, Long> {

    // 본인 대화 이력 (최신순, 페이지네이션)
    Page<HrAiChatLog> findByEmpIdOrderByCreatedAtDesc(Long empId, Pageable pageable);
}
