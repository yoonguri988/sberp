package com.sb.erp.global.integration;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sb.erp.week.dto.response.MyWeeklyReportResponse;
import com.sb.erp.week.dto.response.WeeklyReportResponse;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ReportApi {
	@Autowired private OpenAiGpt openAiGpt;
	@Autowired private GoogleDocsApi googleDocsApi;
	
	    // 역할별 템플릿 문서 ID (구글 docs에서 미리 만들어둔 문서)
		// https://docs.google.com/document/d/1LtPrMMW0UqF6Dks-Fg_j3t9wJsRgseGp8yMC_XIvHko/edit?tab=t.0 팀장용
		// https://docs.google.com/document/d/1YcvPLTg2601gLI-Ri0t3F3eOd34XqY-sQOU78UvDoQM/edit?tab=t.0 사원용
	   private static final String TEMPLATE_MANAGER_DOC_ID = "1LtPrMMW0UqF6Dks-Fg_j3t9wJsRgseGp8yMC_XIvHko";
	   private static final String TEMPLATE_DEVELOPER_DOC_ID = "1YcvPLTg2601gLI-Ri0t3F3eOd34XqY-sQOU78UvDoQM";
	  // private static final String TARGET_FOLDER_ID ="https://drive.google.com/drive/u/0/folders/1I2BQgF0xYZLmj0TGgadTVjDjGBuueKhA";
	   //관리자용
	   public void createReport(WeeklyReportResponse dto) {
		   
		String accessToken = googleDocsApi.getNewAccessToken().trim();
     
       	ReportSections sections = openAiGpt.weeklyReportSections(dto);
      
       	String newDocTitle=dto.getProjectName()+"주간보고서_"+dto.getEndDate();
       	String newDocId =googleDocsApi.copyTemplate(accessToken, TEMPLATE_MANAGER_DOC_ID, newDocTitle);
       	
        //placeholder 치환
        Map<String, Object> values=new HashMap<>();
        
        values.put("{{projectName}}", dto.getProjectName());
        values.put("{{endDate}}", String.valueOf(dto.getEndDate()));
        values.put("{{totalTask}}", String.valueOf(dto.getTotalTask()+"개"));
        values.put("{{doneTaskCount}}", String.valueOf(dto.getDoneTaskCount()+"개"));
        values.put("{{notDoneTaskCount}}", String.valueOf(dto.getNotDoneTaskCount()+"개"));
        values.put("{{completedThisWeek}}", String.valueOf(dto.getCompletedThisWeek()+"개"));
        values.put("{{delayTaskCount}}", String.valueOf(dto.getDelayTaskCount()+"개"));
        values.put("{{progressRate}}", dto.getProgressRate() + "%");
        values.put("{{avgTaskDays}}", dto.getAvgTaskDays() + "일");
        values.put("{{avgDelayDays}}", dto.getAvgDelayDays() + "일");
        values.put("{{remainDays}}", String.valueOf(dto.getRemainDays()+"일"));
        
        values.put("{{summary}}",sections.summary());
        values.put("{{risks}}",sections.risks());
        values.put("{{priorities}}",sections.priorities());
        values.put("{{recommendation}}",sections.recommendation());
        
        googleDocsApi.replacePlaceholders(accessToken, newDocId, values);

	   }
	   // 개발자 개인용 - 즉시 PDF 다운로드, 저장 없음
	    public byte[] createMyWeeklyReport(MyWeeklyReportResponse dto) {
	        String accessToken = googleDocsApi.getNewAccessToken().trim();

	        ReportSections sections = openAiGpt.myWeeklyReportSections(dto);

	        String newDocTitle = dto.getEmpName() + "_개인주간보고서_" + java.time.LocalDate.now();
	        String newDocId = googleDocsApi.copyTemplate(accessToken, TEMPLATE_DEVELOPER_DOC_ID, newDocTitle);

	        String delayedListText = dto.getDelayedTaskNames() == null || dto.getDelayedTaskNames().isEmpty()
	                ? "없음"
	                : dto.getDelayedTaskNames().stream()
	                    .map(name -> "- " + name)
	                    .collect(Collectors.joining("\n"));

	        Map<String, Object> values = new HashMap<>();
	        values.put("{{empName}}", dto.getEmpName());
	        values.put("{{totalTask}}", dto.getTotalTask() + "개");
	        values.put("{{doneTaskCount}}", dto.getDoneTaskCount() + "개");       
	        values.put("{{notDoneTaskCount}}", dto.getNotDoneTaskCount() + "개"); 
	        values.put("{{completedThisWeek}}", dto.getCompletedThisWeek() + "개");
	        values.put("{{delayTaskCount}}", dto.getDelayTaskCount() + "개");
	        values.put("{{progressRate}}", dto.getProgressRate() + "%");
	        values.put("{{avgTaskDays}}", dto.getAvgTaskDays() + "일");
	        values.put("{{avgDelayDays}}", dto.getAvgDelayDays() + "일");
	        values.put("{{delayedTaskList}}", delayedListText);
	        
	        values.put("{{summary}}", sections.summary());
	        values.put("{{risks}}", sections.risks());
	        values.put("{{priorities}}", sections.priorities());
	        values.put("{{techIssues}}", sections.techIssues());

	        googleDocsApi.replacePlaceholders(accessToken, newDocId, values);

	        byte[] pdfBytes = googleDocsApi.exportAsPdf(accessToken, newDocId); // 개발자용만 PDF 변환
	        CompletableFuture.runAsync(() -> { //사본정리 성능개선
	            try{
	                googleDocsApi.deleteDoc(accessToken,newDocId);
	            }catch(Exception e){
	                log.error("보고서 사본 문서 삭제 실패", e);
	            }
	        });

	        return pdfBytes;
	    }
	    //중첩 recod - Ai가 생성한 보고서 텍스트 5개의 항목을 담는 데이터 묶음(dto)
		 public record ReportSections(String summary, String risks, String priorities, String recommendation, String techIssues) {}
}
