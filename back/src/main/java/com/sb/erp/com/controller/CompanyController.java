package com.sb.erp.com.controller;

import java.util.List;
import java.util.Map;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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
import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.dto.request.CompanySearchRequest;
import com.sb.erp.com.dto.request.DeleteCompanyRequest;
import com.sb.erp.com.dto.response.ComDetailResponse;
import com.sb.erp.com.dto.response.ComResponse;
import com.sb.erp.com.dto.response.StatsComResponse;
import com.sb.erp.com.service.CompanyService;
import com.sb.erp.dept.service.DeptService;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.service.EmpService;
import com.sb.erp.global.exception.FileUploadException;
import com.sb.erp.global.exception.ResourceNotFoundException;
import com.sb.erp.util.dto.ListResponse;
import com.sb.erp.util.dto.PagingUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Company REST API", description = "회사 관리 REST API")
@RestController
@RequestMapping("/api/com")
@RequiredArgsConstructor
public class CompanyController {
	private final CompanyService service;
	private final EmpService empService;
	private final DeptService deptService;
	private final AuthUserJwtService authUserJwtService;

	// 회사 등록 기능 POST /api/com
	@Operation(summary = "회사 등록", description = "새로운 회사를 등록합니다. 로고 이미지를 함께 업로드할 수 있습니다. "
			+ "사업자등록번호는 중복될 수 없습니다. ADMIN 또는 ROOT 권한이 필요합니다.")
	@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> add(
			@Parameter(description = "회사 등록 정보") @Valid @ParameterObject @ModelAttribute ComRequest dto,
			@Parameter(description = "회사 로고 이미지 파일 (선택)") @RequestParam(value = "logoFile", required = false) MultipartFile logoFile) {
		try {
			int result = service.add(dto, logoFile);
			if (result > 0) {
				return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "회사 등록에 성공하였습니다."));
			}
			return ResponseEntity.badRequest().body(Map.of("message", "회사 등록에 실패하였습니다."));
		} catch (FileUploadException e) {
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	// 회사 단건 조회 GET /api/com/{comId}
	@Operation(summary = "회사 상세 조회", description = "회사 ID로 회사 정보 + 부서 통계/조직도를 조회합니다. "
			+ "ROOT는 모든 회사를, 그 외 사용자는 본인 소속 회사만 조회할 수 있습니다.")
	@GetMapping("/{comId}")
	public ResponseEntity<?> detail(
			@Parameter(description = "조회할 회사 ID", example = "1", required = true) @PathVariable("comId") long comId,
			@Parameter(hidden = true) Authentication authentication) {
 
		if (authUserJwtService.isForbiddenCompanyAccess(authentication, comId)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "본인 소속 회사만 조회할 수 있습니다."));
		}
 
		ComResponse com = service.selectOneById(comId);
		if (com == null) {
			throw new ResourceNotFoundException("존재하지 않는 회사입니다. comId=" + comId);
		}
		ComDetailResponse response = ComDetailResponse.builder().com(com).deptStats(deptService.selectStats(comId))
				.deptList(deptService.selectOrgTree(comId)).build();
		return ResponseEntity.ok(response);
	}

	// 회사 목록 조회 GET /api/com
	@Operation(summary = "회사 목록 조회", description = "검색조건(키워드, 업종 대분류 등)에 맞는 회사 목록을 페이징하여 조회합니다. ADMIN 또는 ROOT 권한이 필요합니다.")
	@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
	@GetMapping
	public ResponseEntity<ListResponse<ComResponse>> list(
			@Parameter(description = "검색조건 (keyword, industryGrpCode, pstartno, onepagelist 등)") @ModelAttribute CompanySearchRequest search) {
 
		boolean isEmpty = !search.hasSearchCondition();
		int listTotal = isEmpty ? 0 : service.listTotal(search);
 
		PagingUtil paging = isEmpty 
				? new PagingUtil(0, search.getPstartno())
				: new PagingUtil(listTotal, search.getPstartno(), search.getOnepagelist(), 10);
 
		List<ComResponse> items = isEmpty ? List.of() : service.list(search);
 
		ListResponse<ComResponse> response = ListResponse.<ComResponse>builder().paging(paging).items(items).build();
		return ResponseEntity.ok(response);
	}

	// 회사 수정 PUT /api/com/{comId}
	@Operation(summary = "회사 수정", description = "회사 정보를 수정합니다. 로고 URL을 새로 안 보내면 기존 로고가 유지됩니다. "
			+ "ROOT는 모든 회사를, ADMIN은 본인 소속 회사만 수정할 수 있습니다.")
	@PreAuthorize("hasRole('ADMIN') or hasAuthority('ROOT')")
	@PutMapping(value = "/{comId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> update(
			@Parameter(description = "수정할 회사 ID", example = "1", required = true) @PathVariable("comId") long comId,
			@Parameter(description = "회사 수정 정보") @Valid @ParameterObject @ModelAttribute ComRequest dto,
			@Parameter(description = "새 로고 이미지 파일 (선택, 안 보내면 기존 로고 유지)") @RequestParam(value = "logoFile", required = false) MultipartFile logoFile,
			@Parameter(hidden = true) Authentication authentication) {
 
		if (authUserJwtService.isForbiddenCompanyAccess(authentication, comId)) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "본인 소속 회사만 수정할 수 있습니다."));
		}
 
		try {
			int result = service.update(comId, dto, logoFile);
			if (result > 0) {
				return ResponseEntity.ok(Map.of("message", "회사 정보 수정에 성공하였습니다."));
			}
			return ResponseEntity.badRequest().body(Map.of("message", "회사 정보 수정에 실패하였습니다."));
		} catch (FileUploadException e) {
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	// 회사 삭제 DELETE /api/com/{comId}
	@Operation(summary = "회사 삭제", description = "회사를 삭제합니다. 요청자 본인의 비밀번호 확인이 필요하며, ROOT 권한만 가능합니다. "
			+ "부서/직원/전자결재 등 연관 데이터가 전혀 없으면 완전히 삭제되고, 하나라도 남아있으면 비활성화(soft delete) 처리됩니다.")
	@PreAuthorize("hasAuthority('ROOT')")
	@DeleteMapping("/{comId}")
	public ResponseEntity<?> delete(
			@Parameter(description = "삭제할 회사 ID", example = "1", required = true) @PathVariable("comId") long comId,
			@Valid @RequestBody DeleteCompanyRequest request,
			@Parameter(hidden = true) Authentication authentication) {

		Long empId = authUserJwtService.getCurrentEmpId(authentication);
		EmpRequest dto = new EmpRequest();
		dto.setEmpId(empId);
		dto.setEmpPass(request.getPassword());

		boolean matched = empService.matchPassword(dto);
		if (!matched) {
			return ResponseEntity.badRequest().body(Map.of("message", "비밀번호가 올바르지 않습니다."));
		}

		try {
			boolean softDeleted = service.delete(comId);
			if (softDeleted) {
				return ResponseEntity.ok(Map.of(
						"message", "연관된 데이터가 남아있어 회사를 완전히 삭제하는 대신 비활성화 처리했습니다.",
						"softDeleted", true));
			}
			return ResponseEntity.ok(Map.of("message", "회사가 삭제되었습니다.", "softDeleted", false));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	// 회사 재활성화(복구) PUT /api/com/{comId}/restore
	@Operation(summary = "회사 재활성화", description = "비활성화(soft delete)된 회사를 다시 활성 상태로 되돌립니다. ROOT 권한만 가능합니다.")
	@PreAuthorize("hasAuthority('ROOT')")
	@PutMapping("/{comId}/restore")
	public ResponseEntity<?> restore(
			@Parameter(description = "재활성화할 회사 ID", example = "1", required = true) @PathVariable("comId") long comId) {
		service.restore(comId);
		return ResponseEntity.ok(Map.of("message", "회사를 다시 활성화했습니다."));
	}

	// 사업자 중복 체크 GET /api/com/check-bizno
	@Operation(summary = "사업자번호 중복확인", description = "사업자등록번호 중복 여부를 확인합니다.")
	@GetMapping("/check-bizno")
	public ResponseEntity<Map<String, Object>> checkBizNo(
			@Parameter(description = "확인할 사업자등록번호", example = "123-45-67890", required = true) @RequestParam("bizNo") String bizNo) {
 
		boolean duplicate = service.isDuplicateBizNo(bizNo) != null;
		return ResponseEntity.ok(Map.of("duplicate", duplicate));
	}

	// 회사명 자동완성 GET /api/com/suggest
	@Operation(summary = "회사명 자동완성", description = "키워드로 회사명 상위 5건을 조회합니다.")
	@GetMapping("/suggest")
	public ResponseEntity<List<ComResponse>> suggest(
			@Parameter(description = "검색 키워드 (회사명 일부)", example = "위세", required = true) @RequestParam("keyword") String keyword) {
 
		return ResponseEntity.ok(service.getSuggest(keyword));
	}

	// 회사 통계 조회 GET /api/com/stats
	@Operation(summary = "회사 통계 조회", description = "전체 회사수/임직원수/업종수 등 통계를 조회합니다.")
	@GetMapping("/stats")
	public ResponseEntity<StatsComResponse> stats() {
		return ResponseEntity.ok(service.selectStats());
	}

	// 내 회사 정보 조회 GET /api/com/my
	@Operation(summary = "내 회사 정보 조회", description = "로그인한 사용자가 소속된 회사 정보 + 부서 통계/조직도를 조회합니다.")
	@GetMapping("/my")
	public ResponseEntity<ComDetailResponse> my(@Parameter(hidden = true) Authentication authentication) {
		Long empId = authUserJwtService.getCurrentEmpId(authentication);
		Long comId = authUserJwtService.getCurrentComId(authentication);

		ComDetailResponse response = ComDetailResponse.builder().com(service.selectOneByEmpId(empId))
				.deptStats(deptService.selectStats(comId)).deptList(deptService.selectOrgTree(comId)).build();

		return ResponseEntity.ok(response);
	}
}