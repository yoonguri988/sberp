package com.sb.erp.task.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class TaskSearchRequest {
    private Long empId;
    private Long comId;
    private Long proId;
    private int pstartno;
    private int onepagelist = 10; // 한 페이지당 개수
    private String taskStatus;

}
