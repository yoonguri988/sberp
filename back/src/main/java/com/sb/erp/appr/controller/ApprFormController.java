package com.sb.erp.appr.controller;

import java.net.URI;
import java.util.List;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.appr.dto.request.ApprFormAiSchemaRequest;
import com.sb.erp.appr.dto.request.ApprFormDelegationConfigRequest;
import com.sb.erp.appr.dto.request.ApprFormRequest;
import com.sb.erp.appr.dto.request.ApprFormSearchCondition;
import com.sb.erp.appr.dto.response.ApprFormAiSchemaResponse;
import com.sb.erp.appr.dto.response.ApprFormDelegationConfigResponse;
import com.sb.erp.appr.dto.response.ApprFormListResponse;
import com.sb.erp.appr.dto.response.ApprFormResponse;
import com.sb.erp.appr.dto.response.CodeCheckResponse;
import com.sb.erp.appr.service.ApprFormDelegationConfigService;
import com.sb.erp.appr.service.ApprFormService;
import com.sb.erp.global.integration.ApprFormAiService;
import com.sb.erp.global.oauth2.CustomUserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "결재 양식", description = "전자결재 양식 관리 API")
@RestController
@RequestMapping("/api/appr")
@RequiredArgsConstructor
public class ApprFormController {

	private final ApprFormService appr;
	// private final CompanyService com;
	private final ApprFormAiService gpt;
	private final ApprFormDelegationConfigService deleCfg;
	
	// 양식 목록 조회 ( 검색 + 페이징 )
	@Operation(summary = "양식 목록 조회", description = "검색 조건과 페이징으로 결재양식을 조회, 최신버전만 노출")
	@GetMapping
	public ResponseEntity<ApprFormListResponse> listForms(
			@ParameterObject ApprFormSearchCondition condition,
			@AuthenticationPrincipal CustomUserPrincipal principal
	){
		condition.setComId(principal.getComId());
		return ResponseEntity.ok(appr.listForms(condition));
	}
	
	// 양식 단건 조회 / 특정 버전
	@Operation(summary = "양식 단건 조회", description = "forId + forVersion 조합으로 특정 버전의 양식 상세정보를 조회")
	@GetMapping("/{forId}/{forVersion}")
	public ResponseEntity<ApprFormResponse> getForm(
			@PathVariable("forId") Long forId,
			@PathVariable("forVersion") Long forVersion,
			@AuthenticationPrincipal CustomUserPrincipal principal
	){
		return ResponseEntity.ok(appr.getForm(forId, forVersion, principal.getComId()));
	}
	
	// 특정 양식의 버전 전체 이력 조회
	@Operation(summary = "양식 버전 이력 조회", description = "특정 forId에 해당하는 모든 버전 목록을 조회")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/{forId}/versions")
	public ResponseEntity<List<ApprFormResponse>> getFormVersions(
			@PathVariable("forId") Long forId,
			@AuthenticationPrincipal CustomUserPrincipal principal
	){
		return ResponseEntity.ok(appr.getFormVersions(forId, principal.getComId()));
	}
	
	// 양식 등록
	@Operation(summary = "양식 등록", description = "새 결재 양식을 등록")
	@ApiResponse(responseCode = "201", description = "생성 성공")
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping
	public ResponseEntity<Void> insertForm(
			@Valid
			@RequestBody ApprFormRequest req,
			@AuthenticationPrincipal CustomUserPrincipal principal
	){
		req.setComId(principal.getComId());
		Long forId = appr.insertForm(req);
		
		// 신규 등록 버전은 무조건 1
		URI location = URI.create("/appr/" + forId + "/1");
		return ResponseEntity.created(location).build();
	}
	
	// 양식 수정
	// 버전 증가 처리는 서비스 파트에서 처리
	@Operation(summary = "양식 수정", description = "양식을 수정. 제목/내용/스키마중 하나라도 수정될시 버전 증가")
	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{forId}/{forVersion}")
	public ResponseEntity<Void> updateForm(
			@PathVariable("forId") Long forId,
			@PathVariable("forVersion") Long forVersion,
			@Valid
			@RequestBody ApprFormRequest req,
			@AuthenticationPrincipal CustomUserPrincipal principal
	){
		req.setComId(principal.getComId());
		appr.updateForm(forId, forVersion, req);
		return ResponseEntity.noContent().build();
	}
	
	// 양식 삭제
	@Operation(summary = "양식 삭제", description = "특정 버전의 양식을 소프트 삭제 처리")
	@PreAuthorize("hasRole('ADMIN')")
	@DeleteMapping("/{forId}/{forVersion}")
	public ResponseEntity<Void> deleteForm(
			@PathVariable("forId") Long forId,
			@PathVariable("forVersion") Long forVersion,
			@AuthenticationPrincipal CustomUserPrincipal principal
	){
		appr.deleteForm(forId, forVersion, principal.getComId());
		return ResponseEntity.noContent().build();
	}
	
	// 양식 코드 중복 확인
	@Operation(summary = "양식 코드 중복 확인", description = "회사 내 양식 코드 중복 확인")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/check-code")
	public ResponseEntity<CodeCheckResponse> checkCode(
			@RequestParam("forCode") String forCode,
			@RequestParam(value = "forId", required = false) Long forId,
			@AuthenticationPrincipal CustomUserPrincipal principal
	){
		return ResponseEntity.ok(appr.checkCode(forCode, principal.getComId(), forId));
	}
	
//	// 회사 검색
//	@Operation(summary = "회사 검색", description = "키워드로 회사를 검색함")
//	@PreAuthorize("hasAuthority('ROOT')")
//	@GetMapping("/companies")
//	public ResponseEntity<List<ComResponse>> searchCompany(@RequestParam("keyword") String keyword){
//		return ResponseEntity.ok(com.getSuggest(keyword));
//	}
	
	// AI 기반 양식 스키마 생성
	@Operation(summary = "AI 양식 스키마 생성", description = "프롬프르틀 기반으로 AI호출하여 스키마 생성")
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/ai-schema")
	public ResponseEntity<ApprFormAiSchemaResponse> generateSchema(
			@Valid
			@RequestBody ApprFormAiSchemaRequest req
	){
		try {
			String schemaJson = gpt.formSchema(req.getPrompt());
			return ResponseEntity.ok(ApprFormAiSchemaResponse.success(schemaJson));
		} catch (Exception e) {
			// 외부 API 호출 실패는 비즈니스 예외가 아니라 별개취급
			// -> 여기서만 예외적으로 캐치
			return ResponseEntity.ok(ApprFormAiSchemaResponse.fail("AI 양식 생성에 실패했습니다"));
		}
	}
	
	// [스코프 제외] 위임전결 설정 - ApprFormDelegationConfig.java 참고 (comId 소유권 검증 없음, 미배포)
	// 위임전결 설정 조회
	@Operation(summary = "위임전결 설정 조회", description = "양식 버전별 위임 전결 트리거 설정 조회")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping("/{forId}/{forVersion}/delegation-config")
	public ResponseEntity<ApprFormDelegationConfigResponse> getDelegationConfig(
			@PathVariable("forId") Long forId,
			@PathVariable("forVersion") Long forVersion
	) {
		ApprFormDelegationConfigResponse res = deleCfg.getByForm(forId, forVersion);
		return res != null ? ResponseEntity.ok(res) : ResponseEntity.noContent().build();
	}
	
	// [스코프 제외] 위임전결 설정 - ApprFormDelegationConfig.java 참고 (comId 소유권 검증 없음, 미배포)
	// 위임전결 설정 저장 (없으면 생성, 있으면 수정)
	@Operation(summary = "위임전결 설정 저장", description = "양식 버전별 위임전결 트리거 설정 저장")
	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{forId}/{forVersion}/delegation-config")
	public ResponseEntity<Void> saveDelegationConfig(
			@PathVariable("forId") Long forId,
			@PathVariable("forVersion") Long forVersion,
			@Valid
			@RequestBody ApprFormDelegationConfigRequest req
	) {
		req.setForId(forId);
		req.setForVersion(forVersion);
		deleCfg.save(req);
		return ResponseEntity.noContent().build();
	}
}
