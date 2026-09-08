package com.sb.erp.resv.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sb.erp.res.dto.response.ResResponse;
import com.sb.erp.res.repository.ResourceMapper;
import com.sb.erp.resv.dto.request.ResvRequest;
import com.sb.erp.resv.dto.request.ResvSearchRequest;
import com.sb.erp.resv.dto.response.ResvResponse;
import com.sb.erp.resv.dto.response.StatsResvResponse;
import com.sb.erp.resv.repository.ReservationMapper;

@Service
public class ReservationServiceImpl implements ReservationService {
    @Autowired private ReservationMapper dao;
    @Autowired private ResourceMapper resDao;

    @Override
    public List<ResvResponse> getResvList(ResvSearchRequest search) {
        search.setPstartno((search.getPstartno()-1)*search.getOnepagelist());
        List<ResvResponse> list = dao.selectAll(search);
        return list;
    }

    @Override
    public int getResvCount(ResvSearchRequest search) {
        return dao.selectCount(search);
    }

    @Override
    public ResvResponse getResvDetail(long revId) {
        return dao.selectById(revId);
    }

    @Override
    public int insert(ResvRequest dto) {
    	ResResponse res = resDao.selectResourceDetail(dto.getResId());
        if (res == null || !res.getComId().equals(dto.getComId())) {
            throw new IllegalArgumentException("본인 회사의 자원만 예약할 수 있습니다.");
        }
        if (!"AVAILABLE".equals(res.getResStatus())) {
            throw new IllegalStateException("현재 사용할 수 없는 자원입니다.");
        }
        
        ResvSearchRequest search = new ResvSearchRequest();
        search.setResId(dto.getResId());
        search.setStartDt(dto.getStartDt());
        search.setEndDt(dto.getEndDt());
        
        // 같은 기간에 이미 예약된 수량 합계 조회
        long reservedQty = dao.selectReservedQuantity(search);
        long available = res.getQuantity() - reservedQty;

        if (dto.getQuantity() > available) {
            throw new IllegalStateException(
                "해당 기간에 예약 가능한 수량이 부족합니다. (남은 수량: " + available + "개)");
        }
    	
    	return dao.insert(dto);
    }

    @Override
    public int update(ResvRequest dto) {
        ResResponse res = resDao.selectResourceDetail(dto.getResId());
        if (res == null || !res.getComId().equals(dto.getComId())) {
            throw new IllegalArgumentException("본인 회사의 자원만 예약할 수 있습니다.");
        }

        ResvSearchRequest search = new ResvSearchRequest();
        search.setResId(dto.getResId());
        search.setStartDt(dto.getStartDt());
        search.setEndDt(dto.getEndDt());
        // 수정 대상 예약 자신은 잔여수량 계산에서 제외해야, 기존 수량을 유지/축소하는
        // 정상적인 수정까지 "수량 부족"으로 막히지 않는다.
        search.setExcludeRevId(dto.getRevId());

        // 같은 기간에 이미 예약된(자기 자신 제외) 수량 합계 조회
        long reservedQty = dao.selectReservedQuantity(search);
        long available = res.getQuantity() - reservedQty;

        if (dto.getQuantity() > available) {
            throw new IllegalStateException(
                "해당 기간에 예약 가능한 수량이 부족합니다. (남은 수량: " + available + "개)");
        }

        return dao.update(dto);
    }

    @Override
    public int delete(long revId) {
    	return dao.delete(revId);
    }

    @Override
    public StatsResvResponse countByStats(ResvSearchRequest search) {
        return dao.countByStats(search);
    }
    
    @Override
    public int countReservationsByResourceId(long resId) {
        return dao.countReservationsByResourceId(resId);
    }

	@Override
	public int updateApprove(ResvRequest resvDto) {
		return dao.updateApprove(resvDto);
	}

	@Override
	public int updateReject(ResvRequest resvDto) {
		return dao.updateReject(resvDto);
	}

	@Override
	public int getReservedQuantity(ResvSearchRequest search) {
		return dao.selectReservedQuantity(search);
	}
	
	@Override
	public int returnReservation(long revId, Long empId, LocalDateTime returnDt) {
	    return dao.updateReturn(revId, empId, returnDt);
	}
}
