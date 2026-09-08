package com.sb.erp.res.service;

import java.util.List;

import com.sb.erp.res.dto.request.ResRequest;
import com.sb.erp.res.dto.request.ResSearchRequest;
import com.sb.erp.res.dto.response.ResResponse;

public interface ResourceService {

	// 회사내 자원 조회
    List<ResResponse> getResourceList(ResSearchRequest search);

    // 전체 자원 갯수 조회
    int getResourceCount(ResSearchRequest search);

    ResResponse getResourceDetail(long resId);

    int insertResource(ResRequest resDto);

    int updateResource(ResRequest resDto);

    int deleteResource(long resId);

    // 자원코드 중복 체크
    ResResponse isDuplicateResCode(ResRequest resDto);

	// 예약 할 수 있는 회사의 자원 정보
	List<ResResponse> getResListForResv(ResSearchRequest search);
}
