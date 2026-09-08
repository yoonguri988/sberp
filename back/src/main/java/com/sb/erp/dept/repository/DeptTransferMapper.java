package com.sb.erp.dept.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.appr.dto.response.ApprDocImpactResponse;
import com.sb.erp.appr.dto.response.ApprLineImpactResponse;
import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.dto.response.PendingDeptResponse;
import com.sb.erp.emp.dto.response.EmpTransferResponse;
import com.sb.erp.resv.dto.response.ResvImpactResponse;

@Mapper
public interface DeptTransferMapper {

	int countDeptInCompany(@Param("deptId") long deptId, @Param("comId") long comId);
	
	DeptResponse selectOneById(long deptId);
	
	List<EmpTransferResponse> findEmployeesByDept(long deptId);

	List<ResvImpactResponse> findPendingResvByDept(long deptId);

	List<ApprLineImpactResponse> findPendingApprLineByDept(long deptId);

	List<ApprDocImpactResponse> findPendingApprDocsByDept(long deptId);

	String findPendingApprDocTitles(long deptId);

	List<DeptResponse> findCandidateDepartments(@Param("deptId") long deptId, @Param("comId") long comId);

	List<DeptResponse> findActiveDeptsExcluding(@Param("deptId") long deptId, @Param("comId") long comId);

	int updateActiveById(long deptId);

	int markDeleted(long deptId);

	int updateEmployeeDept(@Param("empId") long empId, @Param("newDeptId") long newDeptId);

	List<PendingDeptResponse> findPendingTransferDepts(@Param("comId") long comId, @Param("keyword") String keyword);

	List<DeptResponse> findAllDeptsByCompany(long comId);

}
