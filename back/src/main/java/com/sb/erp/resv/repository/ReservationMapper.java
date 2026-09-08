package com.sb.erp.resv.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.api.dto.request.ResvAlertRequest;
import com.sb.erp.api.dto.response.ResvAlertResponse;
import com.sb.erp.resv.dto.request.ResvRequest;
import com.sb.erp.resv.dto.request.ResvSearchRequest;
import com.sb.erp.resv.dto.response.ResvResponse;
import com.sb.erp.resv.dto.response.StatsResvResponse;

@Mapper
public interface ReservationMapper {

	List<ResvResponse> selectAll(ResvSearchRequest search);
    
    int selectCount(ResvSearchRequest search);
    
    ResvResponse selectById(long revId);
    
    int insert(ResvRequest ResvDto);

    int update(ResvRequest ResvDto);

    int delete(long revId);
    
    StatsResvResponse countByStats(ResvSearchRequest search);
    
    int countReservationsByResourceId(long resId);

	int updateApprove(ResvRequest resvDto);
	
	int updateReject(ResvRequest ResvDto);

	// 같은 기간에 이미 예약된 수량 합계 조회
	int selectReservedQuantity(ResvSearchRequest dto);
	
    /**
     * 알림 발송 대상 조회
     * - VEHICLE / EQUIPMENT: end_dt가 지났는데 return_dt가 NULL인 건 (반납 지연)
     * - ROOM: start_dt는 지났고 end_dt 전인데 return_dt가 NULL인 건 (이용 흔적 없음 = 노쇼 의심)
     * - noshow_alert_at이 NULL인 건만 (이미 알림 보낸 건 재발송하지 않음)
     */
    List<ResvAlertResponse> selectNoShowTargets();

    /**
     * 이력 기반 위험도 스코어링 - 변수 1) 해당 사원의 과거 노쇼/미반납 이력 횟수
     * - 이 예약 건(revId)을 제외하고, 과거에 noshow_alert_at이 채워졌던(=알림이 나갔던) 건수.
     * - 회의실 노쇼는 별도 확정 상태가 없어서 "알림이 나간 적 있다"를 이력의 근사치로 쓴다(설계 문서 참고).
     */
    int selectEmpNoShowHistoryCount(@Param("empId") Long empId, @Param("revId") Long revId);

    /**
     * 이력 기반 위험도 스코어링 - 변수 2) 자원 유형(회의실/장비/차량)별 과거 노쇼율
     * - 승인 이후(APP/NORET) 상태로 종결된 건들 중 alert가 나갔던 비율. 이력이 없으면 0.
     */
    Double selectResTypeNoShowRate(@Param("resType") String resType);

    /**
     * 알림 발송 완료 처리 (중복 발송 방지 플래그 세팅) + 계산된 위험도 스코어 기록
     */
    int updateAlertSent(@Param("revId") Long revId, @Param("riskScore") Double riskScore);
    
    // 자원 반납 처리 - 본인 예약(empId 일치) + 승인(APP)/미반납(NORET) 상태 + 미반납(return_dt IS NULL) 건만 처리
    int updateReturn(@Param("revId") long revId, @Param("empId") Long empId,
            @Param("returnDt") LocalDateTime returnDt);

    // 장비(EQUIPMENT) 자동 미반납 처리 - 종료일시가 지났는데 반납되지 않은 승인건을 NORET으로 전환
    int updateEquipmentNoReturn();
    
	/**
     * 반려(REJ) 예약 이력 정리 - 자원을 실제로 삭제하기 직전에 호출해서 FK 제약조건 위반(ORA-02292)을 막는다.
     * WAI/APP/NORET 건은 countReservationsByResourceId 에서 이미 걸러지므로 이 메서드가 지우는 대상이 아니다.
     */
    int deleteRejectedByResourceId(long resId);
}
