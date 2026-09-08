package com.sb.erp.week.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sb.erp.global.integration.ReportApi;
import com.sb.erp.global.oauth2.CustomUserPrincipal;
import com.sb.erp.task.service.TaskService;
import com.sb.erp.week.dto.response.MyWeeklyReportResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Weekly Report Api", description = "주간보고서 관련 Api")
@RestController
@RequestMapping("/api/week")
@RequiredArgsConstructor
public class ReportController {

		private final ReportApi reportApi;
	    private final TaskService taskService;

	    // 개인 주간보고서 생성 가능 여부 확인
	    @Operation( summary = "개인 주간보고서 생성 가능 여부 확인", description = "로그인한 사원의 지난주 완료 태스크 존재 여부를 확인" )
	    @GetMapping("/my-report/check")
	    public ResponseEntity<Boolean> checkAvailable(
	    	@AuthenticationPrincipal CustomUserPrincipal principal) {
	    	Long empId = principal.getEmpId();
	        MyWeeklyReportResponse dto = taskService.myWeeklyReport(empId);
	        boolean available = dto != null && dto.getCompletedThisWeek() > 0;
	        return ResponseEntity.ok(available);
	    }


	    // 개인 주간보고서 PDF 생성
	    @Operation(
	        summary = "개인 주간보고서 PDF 생성",
	        description = "로그인한 사원의 지난주 데이터를 이용해 AI 주간보고서를 생성하고 PDF로 반환"
	    )
	    @GetMapping("/my-report")
	    public ResponseEntity<byte[]> createMyWeeklyReport(
	    	@AuthenticationPrincipal CustomUserPrincipal principal) {
	    	Long empId = principal.getEmpId();
	        MyWeeklyReportResponse dto = taskService.myWeeklyReport(empId);
	        // 지난주 완료 태스크가 없으면 생성하지 않음
	        if (dto == null || dto.getCompletedThisWeek() == 0) { return ResponseEntity.badRequest().build(); }
	        dto.setDelayedTaskNames( taskService.delayedTaskNames(empId) );
	        byte[] pdfBytes = reportApi.createMyWeeklyReport(dto);
	        return ResponseEntity.ok()
	                .header(
	                    HttpHeaders.CONTENT_DISPOSITION,
	                    "attachment; filename=\"my-weekly-report.pdf\""
	                )
	                .contentType(MediaType.APPLICATION_PDF)
	                .body(pdfBytes);
	    }
}
/*	@GetMapping("/my-weekly-report") //개인보고서 pdf
    public ResponseEntity<byte[]> myReport(Authentication auth){
    	CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
    	int empId = user.getUser().getEmpId();
    	MyWeeklyReportDto dto = taskService.myWeeklyReport(empId);
        
    	//태스크 없으면 나가주세요
        if(dto == null || dto.getTotalTask() == 0) { return ResponseEntity.badRequest().build(); }
        dto.setDelayedTaskNames( taskService.delayedTaskNames(empId) );
        
        byte[] pdf = reportApi.createMyWeeklyReport(dto);
        return ResponseEntity.ok() .contentType(MediaType.APPLICATION_PDF)
        						   .header("Content-Disposition", "attachment; filename=\"MyWeeklyReport.pdf\"")
        						   .body(pdf);
    }
    
    @GetMapping("/my-weekly-report/check") //태스크 존재여부 확인
    @ResponseBody
    public ResponseEntity<Boolean> checkAvailable(Authentication auth) {
    	CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
    	int empId = user.getUser().getEmpId();
        MyWeeklyReportDto dto = taskService.myWeeklyReport(empId);
        boolean available = (dto != null && dto.getTotalTask() > 0);
        return ResponseEntity.ok(available);
    }*/