package com.sb.erp.resv.controller;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.auth.service.AuthUserJwtService;
import com.sb.erp.res.dto.response.ResResponse;
import com.sb.erp.res.service.ResourceService;
import com.sb.erp.resv.dto.request.ResvRequest;
import com.sb.erp.resv.dto.request.ResvSearchRequest;
import com.sb.erp.resv.dto.response.ResvResponse;
import com.sb.erp.resv.service.ReservationService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "Reservation REST API", description = "자원 예약 관리 REST API")
@RestController
@RequestMapping("/api/resv")
@RequiredArgsConstructor
public class ReservationController {

    private static final String STATUS_WAIT = "WAI";

    private final ReservationService service;
    private final ResourceService resService;
    private final AuthUserJwtService authUserJwtService;

    // 내 예약 목록 조회 GET /api/resv/my
    @Operation(summary = "내 예약 목록 조회", description = "로그인한 사용자 본인의 예약 목록을 조회합니다.")
    @GetMapping("/my")
    public ResponseEntity<List<ResvResponse>> getMyResvList(
            @ParameterObject @ModelAttribute ResvSearchRequest search,
            @Parameter(hidden = true) Authentication authentication) {
        search.setComId(authUserJwtService.getCurrentComId(authentication));
        search.setEmpId(authUserJwtService.getCurrentEmpId(authentication));

        if (search.getStartDt() == null) {
            search.setStartDt(LocalDateTime.now().minusDays(30));
        }
        if (search.getEndDt() == null) {
            search.setEndDt(LocalDateTime.now());
        } else {
            search.setEndDt(search.getEndDt().toLocalDate().atTime(LocalTime.MAX)); // 23:59:59.999999999
        }

        return ResponseEntity.ok(service.getResvList(search));
    }

    // 내 예약 개수 조회 GET /api/resv/my/count
    @Operation(summary = "내 예약 개수 조회", description = "로그인한 사용자 본인의 예약 전체 개수를 조회합니다.")
    @GetMapping("/my/count")
    public ResponseEntity<Integer> getMyResvCount(
            @ParameterObject @ModelAttribute ResvSearchRequest search,
            @Parameter(hidden = true) Authentication authentication) {
        search.setComId(authUserJwtService.getCurrentComId(authentication));
        search.setEmpId(authUserJwtService.getCurrentEmpId(authentication));

        if (search.getStartDt() == null) {
            search.setStartDt(LocalDateTime.now().minusDays(30));
        }
        if (search.getEndDt() == null) {
            search.setEndDt(LocalDateTime.now());
        } else {
            search.setEndDt(search.getEndDt().toLocalDate().atTime(LocalTime.MAX)); // 23:59:59.999999999
        }

        return ResponseEntity.ok(service.getResvCount(search));
    }

    // 예약 단건 조회 GET /api/resv/{revId}
    // 본인 예약이거나, 관리자/ROOT로서 같은 회사 소속일 때만 조회 가능
    @Operation(summary = "예약 단건 조회", description = "예약 ID로 상세 정보를 조회합니다. (자원 정보 포함)")
    @GetMapping("/{revId}")
    public ResponseEntity<ResvResponse> getResv(
            @Parameter(description = "조회할 예약 ID", example = "1", required = true) @PathVariable("revId") long revId,
            @Parameter(hidden = true) Authentication authentication) {
        ResvResponse resv = service.getResvDetail(revId);
        if (resv == null || authUserJwtService.isForbiddenReservationAccess(authentication, resv)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resv);
    }

    // 자원 예약 등록 POST /api/resv
    // 예약 가능 수량/자원 상태 검증은 ReservationServiceImpl.insert()에서 처리 (IllegalArgumentException/IllegalStateException)
    @Operation(summary = "자원 예약 등록", description = "신규 예약을 신청합니다. 자원 상태와 기간별 예약 가능 수량을 검증합니다.")
    @PostMapping
    public ResponseEntity<Map<String, Object>> insert(
            @Parameter(hidden = true) Authentication authentication,
            @Valid @RequestBody ResvRequest resvDto) {
        Map<String, Object> result = new HashMap<>();

        resvDto.setEmpId(authUserJwtService.getCurrentEmpId(authentication));
        resvDto.setComId(authUserJwtService.getCurrentComId(authentication));
        resvDto.setStatus(STATUS_WAIT);

        try {
            int inserted = service.insert(resvDto);
            if (inserted > 0) {
                result.put("success", true);
                result.put("message", "예약이 신청되었습니다.");
                return ResponseEntity.status(HttpStatus.CREATED).body(result);
            }
            result.put("success", false);
            result.put("message", "예약 신청 실패");
            return ResponseEntity.internalServerError().body(result);
        } catch (IllegalStateException e) {
            // 예: "해당 기간에 예약 가능한 수량이 부족합니다. (남은 수량: 2개)"
            result.put("success", false);
            result.put("reason", "notEnoughQuantity");
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        } catch (IllegalArgumentException e) {
            result.put("success", false);
            result.put("reason", "invalidResource");
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }

    // 자원 예약 수정 PUT /api/resv/{revId}
    // 본인 예약만 수정 가능 (관리자라도 타인 예약 내용을 대신 수정하지 않음)
    // 예약 가능 수량 검증은 ReservationServiceImpl.update()에서 처리 (자기 자신은 제외하고 계산)
    @Operation(summary = "자원 예약 수정", description = "본인 예약의 수량/기간 등을 수정합니다. 자원 상태와 기간별 예약 가능 수량을 검증합니다.")
    @PutMapping("/{revId}")
    public ResponseEntity<Map<String, Object>> update(
            @Parameter(description = "수정할 예약 ID", example = "1", required = true) @PathVariable("revId") long revId,
            @Valid @RequestBody ResvRequest resvDto,
            @Parameter(hidden = true) Authentication authentication) {
        Map<String, Object> result = new HashMap<>();

        ResvResponse existing = service.getResvDetail(revId);
        Long myEmpId = authUserJwtService.getCurrentEmpId(authentication);
        if (existing == null || !existing.getEmpId().equals(myEmpId)) {
            result.put("success", false);
            result.put("message", "본인 예약만 수정할 수 있습니다.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        }

        resvDto.setRevId(revId);
        resvDto.setEmpId(myEmpId);
        resvDto.setComId(existing.getComId());
        resvDto.setResId(existing.getResId()); // 예약 자원은 수정 화면에서 변경 불가 - 클라이언트 값 대신 기존 값을 신뢰

        try {
            int updated = service.update(resvDto);
            if (updated > 0) {
                result.put("success", true);
                result.put("message", "예약 수정 성공");
                return ResponseEntity.ok(result);
            }

            result.put("success", false);
            result.put("message", "예약 수정 실패");
            return ResponseEntity.internalServerError().body(result);
        } catch (IllegalStateException e) {
            // 예: "해당 기간에 예약 가능한 수량이 부족합니다. (남은 수량: 2개)"
            result.put("success", false);
            result.put("reason", "notEnoughQuantity");
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        } catch (IllegalArgumentException e) {
            result.put("success", false);
            result.put("reason", "invalidResource");
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }

    // 자원 예약 취소 DELETE /api/resv/{revId}
    @Operation(summary = "자원 예약 취소", description = "예약을 취소합니다. 본인 예약이거나 관리자 권한이 필요합니다.")
    @DeleteMapping("/{revId}")
    public ResponseEntity<Map<String, Object>> cancel(
            @Parameter(description = "취소할 예약 ID", example = "1", required = true) @PathVariable("revId") long revId,
            @Parameter(hidden = true) Authentication authentication) {
        Map<String, Object> result = new HashMap<>();

        ResvResponse existing = service.getResvDetail(revId);
        if (existing == null) {
            result.put("success", false);
            result.put("message", "해당 예약을 찾을 수 없습니다.");
            return ResponseEntity.notFound().build();
        }
        if (authUserJwtService.isForbiddenReservationAccess(authentication, existing)) {
            result.put("success", false);
            result.put("message", "본인 예약이거나 관리자만 취소할 수 있습니다.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        }

        service.delete(revId);
        result.put("success", true);
        result.put("message", "예약이 취소되었습니다.");
        return ResponseEntity.ok(result);
    }

    // 기간 선택 후 실시간 잔여수량 조회 GET /api/resv/available
    @Operation(summary = "실시간 잔여수량 조회", description = "선택한 자원의 특정 기간 내 예약 가능 잔여 수량을 조회합니다.")
    @GetMapping("/available")
    public ResponseEntity<Map<String, Object>> getAvailableQty(
            @ParameterObject @ModelAttribute ResvSearchRequest search,
            @Parameter(hidden = true) Authentication authentication) {
        ResResponse res = resService.getResourceDetail(search.getResId());
        Long comId = authUserJwtService.getCurrentComId(authentication);

        // 소속 회사 재검증 (다른 회사 자원의 잔여수량을 조회하지 못하도록)
        if (res == null || authUserJwtService.isForbiddenCompanyAccess(authentication, res.getComId())) {
            throw new IllegalArgumentException("잘못된 자원 요청입니다.");
        }

        // 특정 자원의 특정 기간에 이미 예약(대기+승인)된 수량 합계
        int reservedQty = service.getReservedQuantity(search);
        long availableQty = res.getQuantity() - reservedQty;

        Map<String, Object> result = new HashMap<>();
        result.put("totalQuantity", res.getQuantity());
        result.put("reservedQty", reservedQty);
        result.put("availableQty", Math.max(availableQty, 0));
        result.put("resStatus", res.getResStatus());
        return ResponseEntity.ok(result);
    }
    
    // 자원 반납 처리 PUT /api/resv/{revId}/return
    // 자원을 예약해서 빌린 본인(신청자 본인)만 반납 처리할 수 있다. (관리자도 대신 반납 처리하지 않음)
    @Operation(summary = "자원 반납 처리", description = "본인이 예약한 자원을 반납 처리합니다. 승인(APP) 또는 미반납(NORET) 상태에서만 가능합니다.")
    @PutMapping("/{revId}/return")
    public ResponseEntity<Map<String, Object>> returnResv(
            @Parameter(description = "반납 처리할 예약 ID", example = "1", required = true) @PathVariable("revId") long revId,
            @Parameter(hidden = true) Authentication authentication) {
        Map<String, Object> result = new HashMap<>();

        ResvResponse existing = service.getResvDetail(revId);
        Long myEmpId = authUserJwtService.getCurrentEmpId(authentication);

        if (existing == null || !existing.getEmpId().equals(myEmpId)) {
            result.put("success", false);
            result.put("message", "본인이 예약한 자원만 반납할 수 있습니다.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        }
        if (existing.getReturnDt() != null) {
            result.put("success", false);
            result.put("message", "이미 반납 처리된 예약입니다.");
            return ResponseEntity.badRequest().body(result);
        }
        if (!"APP".equals(existing.getStatus()) && !"NORET".equals(existing.getStatus())) {
            result.put("success", false);
            result.put("message", "승인된 예약만 반납할 수 있습니다.");
            return ResponseEntity.badRequest().body(result);
        }

        LocalDateTime returnDt = LocalDateTime.now();
        int updated = service.returnReservation(revId, myEmpId, returnDt);
        if (updated > 0) {
            result.put("success", true);
            result.put("message", "반납 처리되었습니다.");
            result.put("returnDt", returnDt);
            return ResponseEntity.ok(result);
        }

        result.put("success", false);
        result.put("message", "반납 처리에 실패했습니다.");
        return ResponseEntity.internalServerError().body(result);
    }
}