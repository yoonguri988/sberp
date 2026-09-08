package com.sb.erp.rsm.controller;

import java.io.IOException;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.chunk.service.ResumeChunkService;
import com.sb.erp.rsm.dto.request.ResumeRequest;
import com.sb.erp.rsm.dto.response.ResumeResponse;
import com.sb.erp.rsm.entity.Resume;
import com.sb.erp.rsm.service.ResumeService;
import com.sb.erp.util.dto.FileUploadUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name="Resume Api", description = "이력서 업로드 api")
@RestController
@RequestMapping("/api/public/resume")
@RequiredArgsConstructor
public class ResumeController {
	
	private final ResumeService service;
	private final ResumeChunkService resumeChunkService;
	
	@Operation(summary = "이력서 업로드")
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ResumeResponse> upload(@Parameter( content = @Content( mediaType = MediaType.APPLICATION_JSON_VALUE,
												schema = @Schema(implementation = ResumeRequest.class) )
            									)@Valid @RequestPart("request")ResumeRequest request,
												 @RequestPart("file")MultipartFile file,
												 Authentication authentication){
		ResumeResponse response = service.upload(request, file, authentication);
		
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	// 내가 제출한 이력서 미리보기
	@Operation(summary = "내가 제출한 이력서 미리보기")
	@GetMapping("/my/{apctId}/preview")
	public ResponseEntity<Resource> previewMyResume(
	        @PathVariable("apctId") Long apctId,
	        Authentication authentication) throws IOException {

	    Resume resume = service.getMyResume(apctId, authentication);
	    String diskPath = FileUploadUtil.resolveDiskPath(resume.getRsmFileUrl());
	    Resource resource = new UrlResource(Paths.get(diskPath).toUri());

	    return ResponseEntity.ok()
	            .contentType(MediaType.APPLICATION_PDF)
	            .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
	            .body(resource);
	}

}
