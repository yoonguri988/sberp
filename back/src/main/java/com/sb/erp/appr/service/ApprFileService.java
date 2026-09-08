package com.sb.erp.appr.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.appr.dto.response.ApprFileResponse;

//[스코프 보류] 첨부파일 기능 - 백엔드 완료, 프론트 미연결. 상세: ApprFile.java 참고
public interface ApprFileService {
	public List<ApprFileResponse> uploadFiles(Long docId, List<MultipartFile> files);
	public List<ApprFileResponse> selectFilesByDocId(Long docId);
	public void deleteFile(Long docId, Long fileId, Long empId);
}
