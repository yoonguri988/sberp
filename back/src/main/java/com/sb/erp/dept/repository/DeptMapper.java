package com.sb.erp.dept.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.dept.dto.request.DeptRequest;
import com.sb.erp.dept.dto.request.DeptSearchRequest;
import com.sb.erp.dept.dto.response.DeptResponse;
import com.sb.erp.dept.dto.response.StatsDeptResponse;

@Mapper
public interface DeptMapper {

	// 필요한 메서드 선언
	List<DeptResponse> selectAll(long comId);

	long countActiveDepts(long comId);

	DeptResponse selectOneById(long deptId);

	long maxSortOrder(@Param("parentId")long parentId, @Param("comId")long comId);

	int insert(DeptRequest dto);

	int delete(long deptId);

	long countChildren(long deptId);

	int update(DeptRequest dto);

	List<DeptResponse> selectAllChildIds(long deptId);

	StatsDeptResponse selectStats(long comId);

	long countByDept(long deptId);

	int softDelete(long deptId);

	List<DeptResponse> selectAllDeptsByComId(long comId);

	DeptResponse selectDeptCode(DeptSearchRequest search);

	// 로그인 사용자(empId) 기준 소속 부서 조회 - "내 부서" 화면용
	DeptResponse selectByEmpId(long empId);
}
