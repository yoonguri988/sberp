package com.sb.erp.com.dto.response;

import java.time.format.DateTimeFormatter;

import com.sb.erp.com.entity.Company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComResponse {

	private static final DateTimeFormatter DATETIME_FORMATTER =
			DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	private long comId;
	private String industryGrpCode;
	private String industryCode;
	private String comName;
	private String comCeo;
	private String bizNo;
	private String comTel;
	private String comLogo;
	private String comStatus; // ACTIVE / INACTIVE
	private String createdAt;
	private String updatedAt;

	private long empCount; // 목록조회 시 임직원수

	public ComResponse(Company company) {
		this.comId = company.getComId();
		this.industryGrpCode = company.getIndustryGrpCode();
		this.industryCode = company.getIndustryCode();
		this.comName = company.getComName();
		this.comCeo = company.getComCeo();
		this.bizNo = company.getBizNo();
		this.comTel = company.getComTel();
		this.comLogo = company.getComLogo();
		this.comStatus = company.getComStatus();
		this.createdAt = company.getCreatedAt() != null ? company.getCreatedAt().format(DATETIME_FORMATTER) : null;
		this.updatedAt = company.getUpdatedAt() != null ? company.getUpdatedAt().format(DATETIME_FORMATTER) : null;
	}

	// 목록 조회 시 임직원수만 담아 반환하는 용도 (comId와 혼동되지 않도록 정적 팩토리로 명시)
	public static ComResponse ofEmpCount(long empCount) {
		return ComResponse.builder()
				.empCount(empCount)
				.build();
	}

}