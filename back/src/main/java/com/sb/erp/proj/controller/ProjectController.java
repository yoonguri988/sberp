package com.sb.erp.proj.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.global.oauth2.CustomUserPrincipal;
import com.sb.erp.proj.dto.request.ProjRequest;
import com.sb.erp.proj.dto.request.ProjectSearchRequest;
import com.sb.erp.proj.dto.response.ProjResponse;
import com.sb.erp.proj.service.ProjectMemberService;
import com.sb.erp.proj.service.ProjectService;
import com.sb.erp.task.dto.request.TaskSearchRequest;
import com.sb.erp.task.service.TaskService;
import com.sb.erp.util.dto.PagingUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


@Tag(name="Project Api", description = "Project 관련 Api")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
	private final ProjectService service;
	private final TaskService taskService;
	private final ProjectMemberService memberService;

	// 프로젝트 목록 — 같은 회사 프로젝트만 조회. ROOT는 전체 조회
	@Operation(summary = "프로젝트 목록 조회",description = "검색 조건에 맞는 프로젝트 목록 조회")
	@GetMapping
	public ResponseEntity<Map<String, Object>> getProjects(
			@ModelAttribute ProjectSearchRequest search,
			@AuthenticationPrincipal CustomUserPrincipal principal) {

		boolean isRoot = principal.getRoles().contains("ROOT");
		if (!isRoot) {
			search.setComId(principal.getComId());
		}
		
		int totalCnt = service.selectCnt(search);              // 전체 데이터 수
		PagingUtil paging = new PagingUtil(totalCnt, search.getPstartno());
		List<ProjResponse> list = service.selectAll(search);    // 목록 조회

		Map<String, Object> result = new HashMap<>();
		result.put("list", list);
		result.put("paging", paging);
		return ResponseEntity.ok(result);
	}	
	
	// 사원 검색 — comId를 파라미터로 안 받고 로그인 사용자 회사로 강제
	@Operation(summary = "사원 검색",description = "프로젝트 멤버 추가용 사원 검색")
	@GetMapping("/empSearch")
	public ResponseEntity<List<EmpResponse>> empSearch(
			@RequestParam("keyword") String keyword,
			@AuthenticationPrincipal CustomUserPrincipal principal){
		return ResponseEntity.ok(memberService.searchEmpForProject(principal.getComId(), keyword));
	}
	
	// 프로젝트 등록 — comId/empId를 로그인 사용자 값으로 강제 세팅
	@Operation(summary = "프로젝트 등록", description = "신규 프로젝트 등록")
	@PostMapping
	public ResponseEntity<Map<String, Object>> createProject(
			@Valid @RequestBody ProjRequest dto,
			@AuthenticationPrincipal CustomUserPrincipal principal) {

		dto.setComId(principal.getComId());
		dto.setEmpId(principal.getEmpId());

		Map<String, Object> result = new HashMap<>();
		int insert = service.insert(dto);
		if (insert > 0) {
			result.put("success", true);
			result.put("message", "프로젝트 등록 성공");
			result.put("proId", dto.getProId());
			result.put("project", service.select(dto.getProId()));
			return ResponseEntity.status(HttpStatus.CREATED).body(result);
		}

		result.put("success", false);
		result.put("message", "프로젝트 등록 실패");
		return ResponseEntity.internalServerError().body(result);
	}
	
	// 프로젝트 상세조회 — 같은 회사(ROOT 포함) + (관리자 or 생성자 or 참여멤버)
	@Operation(summary = "프로젝트 상세조회", description = "프로젝트 상세 + 태스크 목록 + 멤버 목록 조회")
	@GetMapping("/{proId}")
	public ResponseEntity<Map<String, Object>> getProjectDetail(
			@PathVariable("proId") Long proId,
			@RequestParam(value = "pstartno", defaultValue = "1") int pstartno,
			@AuthenticationPrincipal CustomUserPrincipal principal){

		ProjResponse dto = service.select(proId);
		if (dto == null) {
			return ResponseEntity.notFound().build();
		}

		boolean isRoot = principal.getRoles().contains("ROOT");
		if (!dto.getComId().equals(principal.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "접근 권한이 없습니다."));
		}

//		boolean isAdmin = isRoot || principal.getRoles().contains("ROLE_ADMIN");
//		boolean isCreator = dto.getEmpId().equals(principal.getEmpId());
//		boolean isMember = memberService.select(proId).stream()
//				.anyMatch(m -> m.getEmpId().equals(principal.getEmpId()));
//
//		if (!isAdmin && !isCreator && !isMember) {
//			return ResponseEntity.status(HttpStatus.FORBIDDEN)
//					.body(Map.of("message", "접근 권한이 없습니다."));
//		}

		 // 태스크 페이징 처리
	    int taskTotalCnt = taskService.selectCnt(proId);
	    PagingUtil paging = new PagingUtil(taskTotalCnt, pstartno);

	    TaskSearchRequest taskSearch = new TaskSearchRequest();
	    taskSearch.setProId(proId);
	    taskSearch.setPstartno((pstartno - 1) * taskSearch.getOnepagelist());
	    
	    Map<String, Object> result = new HashMap<>();
	    result.put("dto",dto);
	    result.put("list", taskService.selectAll(taskSearch));
	    result.put("paging", paging);
	    result.put("memberList", memberService.select(proId));
	    return ResponseEntity.ok(result);
	}
	
	// 프로젝트 수정 — 같은 회사(ROOT 포함) + (관리자 or 생성자)
	@Operation(summary = "프로젝트 수정", description = "프로젝트 정보를 수정")
	@PutMapping("/{proId}")
	public ResponseEntity<Map<String, Object>> updateProject(
			@PathVariable("proId") Long proId,
			@Valid @RequestBody ProjRequest dto,
			@AuthenticationPrincipal CustomUserPrincipal principal) {

		ProjResponse original = service.select(proId);
		if (original == null) {
			return ResponseEntity.notFound().build();
		}

		boolean isRoot = principal.getRoles().contains("ROOT");
		if (!original.getComId().equals(principal.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "접근 권한이 없습니다."));
		}

		boolean isAdmin = isRoot || principal.getRoles().contains("ROLE_ADMIN");
		boolean isCreator = original.getEmpId().equals(principal.getEmpId());
		if (!isAdmin && !isCreator) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "프로젝트 생성자 또는 관리자만 수정할 수 있습니다."));
		}

		dto.setProId(proId);
		Map<String, Object> result = new HashMap<>();

		int updated = service.edit(dto);
		if (updated > 0) {
			result.put("success", true);
			result.put("message", "프로젝트 수정 성공");
			result.put("project", service.select(proId));
			return ResponseEntity.ok(result);
		}

		result.put("success", false);
		result.put("message", "해당 프로젝트를 찾을 수 없습니다.");
		return ResponseEntity.notFound().build();
	}

	// 프로젝트 삭제 — 같은 회사(ROOT 포함) + (관리자 or 생성자)
	@Operation(summary = "프로젝트 삭제", description = "프로젝트를 삭제")
	@DeleteMapping("/{proId}")
	public ResponseEntity<Map<String, Object>> deleteProject(
			@PathVariable("proId") Long proId,
			@AuthenticationPrincipal CustomUserPrincipal principal) {

		ProjResponse original = service.select(proId);
		if (original == null) {
			return ResponseEntity.notFound().build();
		}

		boolean isRoot = principal.getRoles().contains("ROOT");
		if (!original.getComId().equals(principal.getComId())) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "접근 권한이 없습니다."));
		}

		boolean isAdmin = isRoot || principal.getRoles().contains("ROLE_ADMIN");
		boolean isCreator = original.getEmpId().equals(principal.getEmpId());
		if (!isAdmin && !isCreator) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "프로젝트 생성자 또는 관리자만 삭제할 수 있습니다."));
		}
		
		Map<String, Object> result = new HashMap<>();
		int deleted = service.delete(proId);

		if (deleted > 0) {
	        result.put("success", true);
	        result.put("message", "프로젝트 삭제 성공");
	        return ResponseEntity.ok(result);
	    }

	    result.put("success", false);
	    result.put("message", "프로젝트 삭제 실패");
	    return ResponseEntity.notFound().build();
	}
	
	// AI 프로젝트 분석 결과 — 같은 회사(ROOT 포함) + (관리자 or 생성자 or 참여멤버)
	@Operation(summary = "AI 프로젝트 분석", description = "프로젝트 리스크 분석 결과를 반환")
	@GetMapping("/{proId}/analysis")
	public ResponseEntity<?> analyzeProject(
			@PathVariable("proId") Long proId,
			@AuthenticationPrincipal CustomUserPrincipal principal) {

		ProjResponse project = service.select(proId);
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
		boolean isMember = memberService.select(proId).stream()
				.anyMatch(m -> m.getEmpId().equals(principal.getEmpId()));

		if (!isAdmin && !isCreator && !isMember) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN)
					.body(Map.of("message", "접근 권한이 없습니다."));
		}

	    return ResponseEntity.ok(service.analyzeProject(proId));
	}

}