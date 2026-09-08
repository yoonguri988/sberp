package com.sb.erp.dept.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.dept.dto.request.DeptTransferLogRequest;
import com.sb.erp.dept.dto.request.DeptTransferLogSearchRequest;
import com.sb.erp.dept.dto.response.DeptTransferLogResponse;

@Mapper
public interface DeptTransferLogMapper {

	// 로그 삽입
	int insertTransferLog(DeptTransferLogRequest logDto);

	// 부서 이관 이력 조회
	List<DeptTransferLogResponse> searchTransferLogs(@Param("comId") long comId, @Param("search") DeptTransferLogSearchRequest search);

	int listTotal(@Param("comId") long comId, @Param("search") DeptTransferLogSearchRequest search);
}
