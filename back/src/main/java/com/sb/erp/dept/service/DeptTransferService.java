package com.sb.erp.dept.service;

import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.dept.dto.request.DeptTransferExecuteFormRequest;
import com.sb.erp.dept.dto.request.DeptTransferLogSearchRequest;
import com.sb.erp.dept.dto.response.DeptTransferImpactResponse;
import com.sb.erp.dept.dto.response.DeptTransferLogResponse;
import com.sb.erp.dept.dto.response.PendingDeptResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

public interface DeptTransferService {

	//영향도 조회
	DeptTransferImpactResponse getImpact(long comId, long deptId) throws IllegalAccessException, AccessDeniedException;

	//이관 취소
	int cancelTransfer(long comId, long deptId) throws IllegalAccessException, AccessDeniedException;

	//이관 최종 실행
	void executeTransfer(DeptTransferExecuteFormRequest form, long empId) throws IllegalAccessException, AccessDeniedException;

	//이관 대기(PENDING_DELETE) 부서 목록 조회
	List<PendingDeptResponse> getPendingTransferDepts(long comId, String keyword);

	//부서 이관 이력 조회
	List<DeptTransferLogResponse> searchTransferLogs(long comId, DeptTransferLogSearchRequest searchForm);

	//부서 이관 이력 전체 갯수
	int listTotal(long comId, DeptTransferLogSearchRequest search);
} 
