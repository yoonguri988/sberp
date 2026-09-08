package com.sb.erp.appr.dto.response;

import com.sb.erp.appr.entity.ApprFile;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//[스코프 보류] 첨부파일 기능 - 백엔드 완료, 프론트 미연결. 상세: ApprFile.java 참고
@Getter
@Setter
@NoArgsConstructor
public class ApprFileResponse {
	private Long fileId;
	private Long docId;
	private String origName;
	private String fileUrl;
	private Long fileSize;
	private String contentType;
	private String createdAt;
	
	public ApprFileResponse(ApprFile file) {
		this.fileId = file.getFileId();
		this.docId = file.getApprDoc().getDocId();
		this.origName = file.getOrigName();
		this.fileUrl = file.getFileUrl();
		this.fileSize = file.getFileSize();
		this.contentType = file.getContentType();
		this.createdAt = file.getCreatedAt() != null ? file.getCreatedAt().toString() : null;
	}
}
