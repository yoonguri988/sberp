package com.sb.erp.appr.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.appr.entity.ApprLineFavorite;

@Repository
public interface ApprLineFavoriteRepository extends JpaRepository<ApprLineFavorite, Long>{
	
	public List<ApprLineFavorite> findByDepartment_DeptIdAndForIdOrderByUseCountDesc(Long deptId, Long forId);
	
	// 동일한 조합이 이미 있는지 확인후 있으면 사용횟수 카운트
	public Optional<ApprLineFavorite> findByDepartment_DeptIdAndForIdAndEmpIds(Long deptId, Long forId, String empIds);
}
