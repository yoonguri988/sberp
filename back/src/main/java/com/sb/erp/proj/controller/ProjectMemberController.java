package com.sb.erp.proj.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.global.oauth2.CustomUserPrincipal;
import com.sb.erp.proj.dto.request.ProjmemRequest;
import com.sb.erp.proj.dto.response.ProjResponse;
import com.sb.erp.proj.dto.response.ProjmemResponse;
import com.sb.erp.proj.service.ProjectMemberService;
import com.sb.erp.proj.service.ProjectService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name="ProjectMember Api", description = "ProjectMember 관련 Api")
@RestController
@RequestMapping("/api/projectMember")
@RequiredArgsConstructor
public class ProjectMemberController {
	private final ProjectMemberService service;
	private final ProjectService projectService;
	
	// 프로젝트 참여 멤버 조회 — 같은 회사(ROOT 포함) + (관리자 or 생성자 or 참여멤버)
	// 프로젝트 참여 멤버 조회 — 같은 회사(ROOT 포함)면 조회 가능
	@Operation( summary = "프로젝트 참여 멤버 조회", description = "특정 프로젝트에 참여 중인 멤버 목록을 조회" )
	@GetMapping
	public ResponseEntity<List<ProjmemResponse>> getMembers(
	        @RequestParam("proId") Long proId,
	        @AuthenticationPrincipal CustomUserPrincipal principal) {

	    ProjResponse project = projectService.select(proId);

	    if (project == null) {
	        return ResponseEntity.notFound().build();
	    }

	    // 다른 회사 프로젝트는 접근 불가
	    if (!project.getComId().equals(principal.getComId())) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	    }

	    // 같은 회사 직원이면 프로젝트 멤버가 아니어도 조회 가능
	    return ResponseEntity.ok(service.select(proId));
	}
	
	// 프로젝트 참여 멤버 등록 — 같은 회사(ROOT 포함) + (관리자 or 생성자)
	@Operation(summary = "프로젝트 참여 멤버 등록",description = "특정 프로젝트에 참여 멤버 등록")
	@PostMapping("/proj_member_create") 
	public ResponseEntity<Map<String,Object>>addMember(
			@RequestBody ProjmemRequest dto,
			@AuthenticationPrincipal CustomUserPrincipal principal) { 
		Map<String, Object> result = new HashMap<>();

		ProjResponse project = projectService.select(dto.getProjectProId());
		if (project == null) {
			return ResponseEntity.notFound().build();
		}

		boolean isRoot = principal.getRoles().contains("ROOT");
		if (!project.getComId().equals(principal.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "접근 권한이 없습니다."));
		}

		boolean isAdmin = isRoot || principal.getRoles().contains("ROLE_ADMIN");
		boolean isCreator = project.getEmpId().equals(principal.getEmpId());
		if (!isAdmin && !isCreator) {
			result.put("success", false);
			result.put("message", "프로젝트 생성자 또는 관리자만 멤버를 추가할 수 있습니다.");
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
		}

			try {
			    int insert = service.insert(dto);
			    if (insert > 0) {
			    	result.put("success", true);
			    	result.put("message", "프로젝트 멤버 등록 성공");
			    	result.put("ProjectMember", dto);
			    	return ResponseEntity.status(HttpStatus.CREATED).body(result);
			    }
			    	result.put("success", false);
			    	result.put("message", "프로젝트 멤버 추가 실패");
			    	return ResponseEntity.internalServerError().body(result);

			} catch (IllegalArgumentException e) {
			    	result.put("success", false);
			    	result.put("message", e.getMessage());
			    	return ResponseEntity.badRequest().body(result);}
			}

	// 프로젝트 참여 멤버 삭제 — 같은 회사(ROOT 포함) + (관리자 or 생성자)
	@Operation(summary = "프로젝트 참여 멤버 삭제",description = "특정 프로젝트에 참여 멤버 삭제")
	@DeleteMapping("/{pmId}") 
	public ResponseEntity<Map<String,Object>>deleteProjectMember(
			@PathVariable("pmId")Long pmId,
			@RequestParam("proId") Long proId,
			@AuthenticationPrincipal CustomUserPrincipal principal) {
		
		Map<String,Object> result = new HashMap<>();
		
		ProjResponse project = projectService.select(proId);

		if (project == null) {
			return ResponseEntity.notFound().build();
		}

		boolean isRoot = principal.getRoles().contains("ROOT");
		if (!project.getComId().equals(principal.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "접근 권한이 없습니다."));
		}

		boolean isAdmin = isRoot || principal.getRoles().contains("ROLE_ADMIN");
		boolean isCreator = project.getEmpId().equals(principal.getEmpId());
		if (!isAdmin && !isCreator) {
			result.put("success", false);
			result.put("message", "프로젝트 생성자 또는 관리자만 멤버를 삭제할 수 있습니다.");
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
		}
		
		int delete = service.delete(pmId);
		
		if(delete>0) {
			result.put("success", true);
			result.put("message", "프로젝트 멤버 삭제 성공");
			return ResponseEntity.ok(result);
		}
		result.put("success", false);
		result.put("message", "해당 멤버를 찾을 수 없습니다.");
		return ResponseEntity.notFound().build();
		}
	

}