package com.sb.erp.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LoginHistoryStatsResponse {
    private long total;
    private long successCount;
    private long failCount;
}
