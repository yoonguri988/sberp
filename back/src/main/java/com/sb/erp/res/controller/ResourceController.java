package com.sb.erp.res.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
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

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.service.EmpService;
import com.sb.erp.res.dto.request.DeleteResRequest;
import com.sb.erp.res.dto.request.ResRequest;
import com.sb.erp.res.dto.request.ResSearchRequest;
import com.sb.erp.res.dto.response.ResResponse;
import com.sb.erp.res.service.ResourceService;
import com.sb.erp.resv.service.ReservationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name="Resource REST API", description = "자원 관리 REST API")
@RestController
@RequestMapping("/api/res")
@RequiredArgsConstructor
public class ResourceController {
	private final ResourceService service;
    private final ReservationService resvService;
    private final EmpService empService;
    private final AuthUserJwtService authUserJwtService;

    @Operation(summary = "자원 목록 조회", description = "검색 조건에 맞는 자원 목록을 조회합니다.")
    @GetMapping
    public ResponseEntity<List<ResResponse>> getResources(
            @ParameterObject @ModelAttribute ResSearchRequest search,
            @Parameter(hidden = true) Authentication authentication) 
    {
        search.setComId(authUserJwtService.getCurrentComId(authentication));
        return ResponseEntity.ok(service.getResourceList(search));
    }
    
    // 자원 관리 전체 개수 조회 GET /api/res/count  (페이징 계산용)
    @Operation(summary = "자원 전체 개수 조회", description = "검색 조건에 맞는 자원의 전체 개수를 조회합니다.")
    @GetMapping("/count")
    public ResponseEntity<Integer> getResourceCount(
            @ParameterObject @ModelAttribute ResSearchRequest search,
            @Parameter(hidden = true) Authentication authentication) {
        search.setComId(authUserJwtService.getCurrentComId(authentication));
        return ResponseEntity.ok(service.getResourceCount(search));
    }
    
    // 자원 관리 단건 조회 GET /api/res/{resId}
    @Operation(summary = "자원 단건 조회", description = "자원 ID로 상세 정보를 조회합니다.")
    @GetMapping("/{resId}")
    public ResponseEntity<ResResponse> getResource(
            @Parameter(description = "조회할 자원 ID", example = "1", required = true)
            @PathVariable("resId") long resId,
            @Parameter(hidden = true) Authentication authentication) {
        ResResponse res = service.getResourceDetail(resId);
        Long comId = authUserJwtService.getCurrentComId(authentication);
        if (res == null || !res.getComId().equals(comId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(res);
    }
    
    // 자원 관리 등록 POST /api/res
    @Operation(summary = "자원 등록", description = "신규 자원을 등록합니다. 자원코드는 회사 내에서 중복될 수 없습니다.")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Map<String, Object>> insertResource(
            @Parameter(hidden = true) Authentication authentication,
            @Valid @RequestBody ResRequest resDto) {
        Map<String, Object> result = new HashMap<>();
 
        resDto.setComId(authUserJwtService.getCurrentComId(authentication));
 
        // 자원코드 중복 체크
        if (service.isDuplicateResCode(resDto) != null) {
            result.put("success", false);
            result.put("reason", "duplicateResCode");
            result.put("message", "이미 등록된 자원코드입니다.");
            return ResponseEntity.badRequest().body(result);
        }
 
        int inserted = service.insertResource(resDto);
        if (inserted > 0) {
            result.put("success", true);
            result.put("message", "자원 등록 성공");
            result.put("resource", resDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        }
 
        result.put("success", false);
        result.put("message", "자원 등록 실패");
        return ResponseEntity.internalServerError().body(result);
    }
    
    // 자원 관리 수정 PUT /api/res/{resId}
    @Operation(summary = "자원 수정", description = "자원 정보를 수정합니다. 전달된 필드만 부분 수정됩니다.")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{resId}")
    public ResponseEntity<Map<String, Object>> updateResource(
            @Parameter(description = "수정할 자원 ID", example = "1", required = true)
            @PathVariable("resId") Long resId,
            @Valid @RequestBody ResRequest resDto,
            @Parameter(hidden = true) Authentication authentication) {
        Map<String, Object> result = new HashMap<>();
 
        Long comId = authUserJwtService.getCurrentComId(authentication);
        ResResponse existing = service.getResourceDetail(resId);
        if (existing == null || !existing.getComId().equals(comId)) {
            result.put("success", false);
            result.put("message", "해당 자원을 찾을 수 없습니다.");
            return ResponseEntity.notFound().build();
        }
 
        resDto.setResId(resId);
        resDto.setComId(comId); // comId는 요청 바디 값 대신 로그인 사용자 기준 고정
 
        int updated = service.updateResource(resDto);
        if (updated > 0) {
            result.put("success", true);
            result.put("message", "자원 수정 성공");
            return ResponseEntity.ok(result);
        }
 
        result.put("success", false);
        result.put("message", "자원 수정 실패");
        return ResponseEntity.internalServerError().body(result);
    }

    // 자원 관리 삭제 DELETE /api/res/{resId}
    @Operation(summary = "자원 삭제", description = "비밀번호 확인 후 자원을 삭제합니다. 진행 중인 예약이 있으면 삭제할 수 없습니다.")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{resId}")
    public ResponseEntity<Map<String, Object>> deleteResource(
            @Parameter(description = "삭제할 자원 ID", example = "1", required = true)
            @PathVariable("resId") long resId,
            @Valid @RequestBody DeleteResRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        Map<String, Object> result = new HashMap<>();
 
        Long comId = authUserJwtService.getCurrentComId(authentication);
        ResResponse existing = service.getResourceDetail(resId);
        if (existing == null || !existing.getComId().equals(comId)) {
            result.put("success", false);
            result.put("message", "해당 자원을 찾을 수 없습니다.");
            return ResponseEntity.notFound().build();
        }
 
        // 비밀번호는 로그인 본인 것으로만 검증
		Long empId = authUserJwtService.getCurrentEmpId(authentication);
		EmpRequest dto = new EmpRequest();
		dto.setEmpId(empId);
		dto.setEmpPass(request.getPassword());
 
		boolean matched = empService.matchPassword(dto);
		if (!matched) {
			return ResponseEntity.badRequest().body(Map.of("message", "비밀번호가 올바르지 않습니다."));
		}
 
        // 예약 처리 중인 자원의 경우 삭제 불가
        int resvCount = resvService.countReservationsByResourceId(resId);
        if (resvCount > 0) {
            result.put("success", false);
            result.put("reason", "hasReservations");
            result.put("message", "이 자원에는 진행 중인 예약이 " + resvCount + "건 있습니다. 예약을 먼저 취소하거나 완료한 뒤 다시 시도해주세요.");
            return ResponseEntity.badRequest().body(result);
        }
 
        service.deleteResource(resId);
        result.put("success", true);
        result.put("message", "자원 삭제 성공");
        return ResponseEntity.ok(result);
    }
    
    // 자원코드 중복 체크 GET /api/res/check-rescode
    @Operation(summary = "자원코드 중복 체크", description = "회사 내 자원코드 중복 여부를 확인합니다.")
    @GetMapping("/check-rescode")
    public ResponseEntity<Map<String, Boolean>> checkResCode(
            @Parameter(description = "중복 여부를 확인할 자원코드", example = "RES-001", required = true)
            @RequestParam(value = "resCode", required = true) String resCode,
            @Parameter(hidden = true) Authentication authentication) {
        ResRequest dto = new ResRequest();
        dto.setComId(authUserJwtService.getCurrentComId(authentication));
        dto.setResCode(resCode);
 
        ResResponse existing = service.isDuplicateResCode(dto);
 
        Map<String, Boolean> result = new HashMap<>();
        result.put("duplicate", existing != null);
        return ResponseEntity.ok(result);
    }
    
    // 예약 가능한 회사 자원 목록 조회 GET /api/res/reservable
 // 예약 화면(자원 선택)에서 사용 - RES_STATUS = 'AVAILABLE' && QUANTITY > 0 인 자원만 조회
    @Operation(summary = "예약 가능 자원 목록 조회", description = "예약 화면에서 선택 가능한(AVAILABLE, 재고 있음) 자원 목록을 조회합니다.")
    @GetMapping("/reservable")
    public ResponseEntity<List<ResResponse>> getReservableResources(
            @ParameterObject @ModelAttribute ResSearchRequest search,
            @Parameter(hidden = true) Authentication authentication) {
        search.setComId(authUserJwtService.getCurrentComId(authentication));
        return ResponseEntity.ok(service.getResListForResv(search));
    }
}