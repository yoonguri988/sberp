package com.sb.erp.appr.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sb.erp.appr.entity.ApprFile;

//[스코프 보류] 첨부파일 기능 - 백엔드 완료, 프론트 미연결. 상세: ApprFile.java 참고
@Repository
public interface ApprFileRepository extends JpaRepository<ApprFile, Long>{
	
	public List<ApprFile> findByApprDoc_DocId(Long docId);
	
	public int countByApprDoc_DocId(Long docId);
}
