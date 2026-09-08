package com.sb.erp.appr.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.appr.dto.request.ApprLogSearchCondition;
import com.sb.erp.appr.dto.response.ApprLogResponse;
import com.sb.erp.appr.repository.ApprLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprLogServiceImpl implements ApprLogService{
	
	private final ApprLogRepository logDao;

	@Override
	public Page<ApprLogResponse> searchLog(ApprLogSearchCondition cond, Pageable pageable, Long comId) {
		
		// 종료일은 그날 끝까지 포함되도록 다음발 00:00 미만으로 변환
		LocalDateTime start = cond.getStartDate() != null ? cond.getStartDate().atStartOfDay() : null;
		LocalDateTime end = cond.getEndDate() != null ? cond.getEndDate().plusDays(1).atStartOfDay() : null;
		
 		return logDao.search(comId, cond.getDocId(), cond.getEmpId(), start, end, pageable)
 				.map(ApprLogResponse::new);
	}

}
