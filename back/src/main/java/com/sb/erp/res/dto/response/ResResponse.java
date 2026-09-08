package com.sb.erp.res.dto.response;

import java.time.format.DateTimeFormatter;

import com.sb.erp.res.entity.Resource;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResResponse {

	private static final DateTimeFormatter DATETIME_FORMATTER =
			DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

	private Long resId;
	private Long comId;
	private String resCode;
	private String resName;
	private String resType;
	private Long quantity;

	private String location;
	private Long capacity;
	private String resStatus;

	private Long managerEmpId;
	private String managerEmpName;
	private String managerEmpNo;
	private String managerPosName;

	private String remark;
	private String createdAt;
	private String updatedAt;

	private Long resvCount;
	private Long totQuantity;
	private Long availQuantity;

	public ResResponse(Resource resource) {
		this.resId = resource.getResId();
		this.comId = resource.getCompany().getComId();
		this.resCode = resource.getResCode();
		this.resName = resource.getResName();
		this.resType = resource.getResType();
		this.quantity = resource.getQuantity();
		this.location = resource.getLocation();
		this.capacity = resource.getCapacity();
		this.resStatus = resource.getResStatus();

		// 담당자는 필수 항목이 아니므로 null 체크 후 매핑 (NPE 방지)
		if (resource.getEmployee() != null) {
			this.managerEmpId = resource.getEmployee().getEmpId();
			this.managerEmpName = resource.getEmployee().getEmpName();
			this.managerEmpNo = resource.getEmployee().getEmpNo();
			if (resource.getEmployee().getPosition() != null) {
				this.managerPosName = resource.getEmployee().getPosition().getPosName();
			}
		}

		this.remark = resource.getRemark();
		this.createdAt = resource.getCreatedAt() != null ? resource.getCreatedAt().format(DATETIME_FORMATTER) : null;
		this.updatedAt = resource.getUpdatedAt() != null ? resource.getUpdatedAt().format(DATETIME_FORMATTER) : null;
	}

	// 예약 통계 조회용 (수량 요약)
	public static ResResponse ofQuantityStats(Long resvCount, Long totQuantity, Long availQuantity) {
		return ResResponse.builder()
				.resvCount(resvCount)
				.totQuantity(totQuantity)
				.availQuantity(availQuantity)
				.build();
	}
}