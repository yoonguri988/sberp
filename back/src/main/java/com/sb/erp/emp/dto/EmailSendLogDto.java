package com.sb.erp.emp.dto;

import lombok.Data;

@Data
public class EmailSendLogDto {

    // ─── email_send_log 컬럼 ───
    private int    logId;
    private int    empId;
    private String mailType;      // 'WELCOME', 'FOLLOWUP_3DAY'
    private String status;        // 'P', 'S', 'F'
    private String sentAt;        // TO_CHAR
    private String errorMsg;
    private String createdAt;
    private String updatedAt;

    // ─── 조회용 상수 ───
    public static final String TYPE_WELCOME       = "WELCOME";
    public static final String TYPE_FOLLOWUP_3DAY = "FOLLOWUP_3DAY";

    public static final String STATUS_PROCESSING = "P";
    public static final String STATUS_SUCCESS    = "S";
    public static final String STATUS_FAIL       = "F";
}
