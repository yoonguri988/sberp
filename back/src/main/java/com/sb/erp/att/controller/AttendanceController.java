package com.sb.erp.att.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.att.dto.request.AttendanceRequest;
import com.sb.erp.att.dto.response.AttendanceResponse;
import com.sb.erp.att.service.AttendanceService;
import com.sb.erp.auth.service.AuthUserJwtService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/att")
@RequiredArgsConstructor
@Tag(name = "근태 관리", description = "사원 근태 등록, 조회 및 수정")
public class AttendanceController {

	private final AttendanceService attendanceService;
	private final AuthUserJwtService authUserJwtService;
	
	//GET /api/att getAllAttendances @RequestParam (startDate, endDate, start, end)
	@Operation(summary = "근태 목록 조회", description = "검색 조건과 페이징을 적용한 근태 목록")
	@PreAuthorize("hasRole('ADMIN')")
	@GetMapping
	public ResponseEntity<List<AttendanceResponse>> list(
	        Authentication auth,
	        @RequestParam("startDate") LocalDate startDate,
	        @RequestParam("endDate") LocalDate endDate,
	        @RequestParam(name="keyword", required=false) String keyword,
	        @RequestParam("start") int start,
	        @RequestParam("end") int end) {

	    Long comId = authUserJwtService.getCurrentComId(auth);
	    List<AttendanceResponse> list = attendanceService
	            .getAllAttendances(startDate, endDate, comId, keyword, start, end);

	    return ResponseEntity.ok(list);
	}
	
	
	//GET	/api/attendance/my	getAttendanceByEmpId	JWT에서 empId
	@Operation(summary = "근태 상세 조회", description = "자신의 근태 목록 조회")
	@GetMapping("/my")
	public ResponseEntity<List<AttendanceResponse>> my(Authentication auth){
		Long empId = authUserJwtService.getCurrentEmpId(auth);
		List<AttendanceResponse> list = attendanceService.getAttendanceByEmpId(empId);
		return ResponseEntity.ok(list);
	}
	
	
	//POST	/api/attendance/check-in	checkIn	JWT에서 empId
	@Operation(summary = "출근", description = "출근 상태 확인")
	@PostMapping("/check-in")
	public ResponseEntity<AttendanceResponse> checkIn(Authentication auth){
		Long empId = authUserJwtService.getCurrentEmpId(auth);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(attendanceService.checkIn(empId));
	}
	
	
	//PUT	/api/attendance/check-out	checkOut	JWT에서 empId
	@Operation(summary = "퇴근", description = "퇴근 상태 확인")
	@PutMapping("/check-out")
	public ResponseEntity<AttendanceResponse> checkOut(Authentication auth){
		Long empId = authUserJwtService.getCurrentEmpId(auth);
		return ResponseEntity.ok(attendanceService.checkOut(empId));
	}
	
	//POST
	@Operation(summary = "관리자 근태 등록")
	@PreAuthorize("hasRole('ADMIN')")
	@PostMapping("/admin")
	public ResponseEntity<?> create(
			Authentication auth,
			@Valid @RequestBody AttendanceRequest request){
		Long comId = authUserJwtService.getCurrentComId(auth);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(attendanceService.createAtt(request, comId));
	}
	
	
	//PUT	/api/attendance/{attId}	editAtt	@PathVariable + @RequestBody
	@Operation(summary = "기록된 근태 내용 수정")
	@PreAuthorize("hasRole('ADMIN')")
	@PutMapping("/{attId}")
	public ResponseEntity<?> edit(
			Authentication auth,
			@PathVariable("attId") Long attId,
			@Valid @RequestBody AttendanceRequest request) {
		Long comId = authUserJwtService.getCurrentComId(auth);
		AttendanceResponse updated = attendanceService.editAtt(attId, request, comId);
		return ResponseEntity.ok(updated);
	}
}