package com.sb.erp.appr.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.appr.dto.response.ApprFileResponse;
import com.sb.erp.appr.entity.ApprDoc;
import com.sb.erp.appr.entity.ApprFile;
import com.sb.erp.appr.repository.ApprDocRepository;
import com.sb.erp.appr.repository.ApprFileRepository;
import com.sb.erp.global.exception.ResourceNotFoundException;
import com.sb.erp.util.dto.FileUploadDto;
import com.sb.erp.util.dto.FileUploadType;
import com.sb.erp.util.dto.FileUploadUtil;

import lombok.RequiredArgsConstructor;


/**
 * 스코프 보류 - 첨부파일 기능은 백엔드(업로드/조회/삭제) 구현 완료 상태지만
 * 프론트엔드(write.js, detail.js)에서 아직 연결 안 됨. 위험한 코드는 아니라
 * 실행 경로는 막지 않고 상태만 표시. 재개 시 프론트 연결만 하면 됨.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApprFileServiceImpl implements ApprFileService {
	
	private static final int MAX_FILE_COUNT = 5;
	
	private final ApprFileRepository fileRepo;
	private final ApprDocRepository docRepo;
	
	@Override
	@Transactional
	public List<ApprFileResponse> uploadFiles(Long docId, List<MultipartFile> files) {
		
		ApprDoc doc = docRepo.findById(docId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 문서입니다."));
		
		int existing = fileRepo.countByApprDoc_DocId(docId);
		if (existing + files.size() > MAX_FILE_COUNT) {
			throw new IllegalArgumentException("첨부파일은 문서당 최대 " + MAX_FILE_COUNT + "개까지 가능합니다.");
		}
		
		// 디스크에 이미 저장된 파일 경로 (실패시 롤백용)
		List<String> storedPaths = new ArrayList<>();
		List<ApprFile> entities = new ArrayList<>();
		
		try {
			for (MultipartFile file : files) {
				FileUploadDto uploaded = FileUploadUtil.upload(file, FileUploadType.NOTICE_ATTACH);
				storedPaths.add(uploaded.getSavedPath());
				
				entities.add(ApprFile.builder()
						.apprDoc(doc)
						.origName(uploaded.getOriginalFileName())
						.savedName(uploaded.getSavedFileName())
						.savedPath(uploaded.getSavedPath())
						.fileUrl(uploaded.getFileUrl())
						.fileSize(uploaded.getFileSize())
						.contentType(file.getContentType())
						.build());
			}
		} catch (RuntimeException e) {
			// DB insert 전이라 트랜잭션 롤백만으로는 디스크 파일이 안지워지니 직접정리
			storedPaths.forEach(FileUploadUtil::delete);
			throw e;
		}
		
		return entities.stream()
				.map(ApprFileResponse::new)
				.collect(Collectors.toList());
	}

	@Override
	public List<ApprFileResponse> selectFilesByDocId(Long docId) {
		return fileRepo.findByApprDoc_DocId(docId).stream()
				.map(ApprFileResponse::new)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional
	public void deleteFile(Long docId, Long fileId, Long empId) {
		ApprFile file = fileRepo.findById(fileId)
				.orElseThrow(() -> new ResourceNotFoundException("존재하지 않는 파일입니다"));
		
		if (!file.getApprDoc().getDocId().equals(docId)) {
			throw new IllegalArgumentException("해당 문서의 첨부파일이 아닙니다.");
		}
		if (!file.getApprDoc().getEmployee().getEmpId().equals(empId)) {
			throw new IllegalArgumentException("본인이 등록한 문서의 첨부파일만 삭제할 수 있습니다.");
		}
		
		FileUploadUtil.delete(file.getSavedPath());
		fileRepo.delete(file);
	}


}
