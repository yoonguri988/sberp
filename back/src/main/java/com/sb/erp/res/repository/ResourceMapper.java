package com.sb.erp.res.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.sb.erp.res.dto.request.ResRequest;
import com.sb.erp.res.dto.request.ResSearchRequest;
import com.sb.erp.res.dto.response.ResResponse;

@Mapper
public interface ResourceMapper {

    List<ResResponse> selectResourceList(ResSearchRequest search);

    int selectResourceCount(ResSearchRequest search);

    ResResponse selectResourceDetail(long resId);

    int insertResource(ResRequest resourceDto);

    int updateResource(ResRequest resourceDto);

    int deleteResource(long resId);

    // 자원코드 중복 체크
    ResResponse selectByResCode(ResRequest resDto);

	// 예약 할 수 있는 회사의 자원 정보
	List<ResResponse> selectResListForResv(ResSearchRequest search);
	
}
