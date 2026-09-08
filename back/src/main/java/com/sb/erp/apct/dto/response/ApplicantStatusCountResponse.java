package com.sb.erp.apct.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter @AllArgsConstructor
public class ApplicantStatusCountResponse { // 대시보드 용이긴한데 쓰려나?
    private String apctStatus;
    private Long count;
}