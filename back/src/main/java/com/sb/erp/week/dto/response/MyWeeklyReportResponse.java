package com.sb.erp.week.dto.response;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyWeeklyReportResponse { // 개인보고서 (태스크 집계) / 순수 조회/계산
    private Long empId;
    private String empName;

    private int totalTask;
    private int doneTaskCount;
    private int notDoneTaskCount;
    private int completedThisWeek;
    private int delayTaskCount;
    private int progressRate;
    private double avgTaskDays;
    private int avgDelayDays;

    private List<String> delayedTaskNames;
}
