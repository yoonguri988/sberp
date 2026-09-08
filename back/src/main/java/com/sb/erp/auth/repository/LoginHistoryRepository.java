package com.sb.erp.auth.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.sb.erp.auth.entity.LoginHistory;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long>, JpaSpecificationExecutor<LoginHistory> {

	// 로그인 시도 제한(계정 잠금)용 - 특정 이메일의 특정 시점 이후 실패 건수
	long countByEmpEmailAndStatusAndLoginAtAfter(String empEmail, String status, LocalDateTime after);
}
