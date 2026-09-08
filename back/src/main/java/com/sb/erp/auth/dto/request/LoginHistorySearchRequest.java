package com.sb.erp.auth.dto.request;

import lombok.Getter;
import lombok.Setter;

//관리자용 로그인 이력 조회 검색조건
@Getter @Setter
public class LoginHistorySearchRequest {
 private String empEmail;      // 이메일 부분검색
 private String status;        // 'S' | 'F' | null(전체)
 private String startDt;       // yyyy-MM-dd
 private String endDt;         // yyyy-MM-dd
 private Integer page = 1;     // 1-base
 private Integer size = 10;
}
