package com.sb.erp.appr.dto.response;

import java.util.List;

import com.sb.erp.appr.entity.ApprLineFavorite;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ApprLineFavoriteResponse {
	private Long favId;
	private Long deptId;
	private Long forId;
	private List<ApprLineResponse> approvers;
	private int useCount;
	
	public static ApprLineFavoriteResponse of(
			ApprLineFavorite fav,
			List<ApprLineResponse> approvers
	) {
		ApprLineFavoriteResponse res = new ApprLineFavoriteResponse();
		res.favId = fav.getFavId();
		res.deptId = fav.getDepartment().getDeptId();
		res.forId = fav.getForId();
		res.approvers = approvers;
		res.useCount = fav.getUseCount();
		return res;
	}
}
