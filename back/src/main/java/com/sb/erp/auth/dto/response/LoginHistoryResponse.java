package com.sb.erp.auth.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LoginHistoryResponse {
    private Long loginId;
    private String empEmail;
    private Long empId;
    private String empName;
    private String status;      // 'S' | 'F'
    private String failReason;
    private String loginIp;
    private String userAgent;
    private LocalDateTime loginAt;
}
