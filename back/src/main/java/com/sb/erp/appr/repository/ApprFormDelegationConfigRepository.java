package com.sb.erp.appr.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.appr.entity.ApprFormDelegationConfig;

//[스코프 제외] 위임전결 자동화 미배포 - 상세: ApprFormDelegationConfig.java 참고
@Repository
public interface ApprFormDelegationConfigRepository extends JpaRepository<ApprFormDelegationConfig, Long>{
	
	// 양식 상세/문서 승인 훅에서 사용 - id + version 기준 단건 조회
	public Optional<ApprFormDelegationConfig> findByApprForm_ForIdAndApprForm_ForVersion(Long forId, Long forVersion);
}
