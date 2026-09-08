package com.sb.erp.resv.service;

import java.time.LocalDateTime;
import java.util.List;

import com.sb.erp.resv.dto.request.ResvRequest;
import com.sb.erp.resv.dto.request.ResvSearchRequest;
import com.sb.erp.resv.dto.response.ResvResponse;
import com.sb.erp.resv.dto.response.StatsResvResponse;

public interface ReservationService {
	// 자원 예약 조회
    List<ResvResponse> getResvList(ResvSearchRequest search);
    // 자원 예약 전체 갯수
    int getResvCount(ResvSearchRequest search);

    ResvResponse getResvDetail(long revId);

    int insert(ResvRequest ResvDto);

    int update(ResvRequest ResvDto);

    int delete(long revId);

    // 통계 (전체/승인/대기/반려)
    StatsResvResponse countByStats(ResvSearchRequest search);

    // 예약 관리에서 예약 된 자원이 있는지 확인
    int countReservationsByResourceId(long resId);
    
    int updateApprove(ResvRequest resvDto);
    int updateReject(ResvRequest resvDto);
    
    //
	int getReservedQuantity(ResvSearchRequest search);
	
	int returnReservation(long revId, Long empId, LocalDateTime returnDt);

}
