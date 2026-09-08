package com.sb.erp.pos.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.pos.dto.request.PosRequest;
import com.sb.erp.pos.dto.response.PosResponse;

@Mapper
public interface PosMapper {

	// 회사별 직급 목록 (기존)
	List<PosResponse> selectAll(Long comId);

	// 직급 단건 조회 (수정 화면용, com_id 가드)
	PosResponse selectOneById(@Param("posId") long posId, @Param("comId") long comId);

	// 직급 등록
	int insert(PosRequest dto);

	// 직급 수정
	int update(PosRequest dto);

	// 직급 삭제
	int delete(PosRequest dto);

	// 사원 사용 여부 확인 (삭제 전 검증)
	int countEmpUsing(@Param("posId") long posId, @Param("comId") long comId);

	// 회사 내 직급 코드 중복 확인 (등록/수정)
	int countByPosCode(@Param("posCode") String posCode,
	                   @Param("comId") long comId,
	                   @Param("excludePosId") Long excludePosId);
}
