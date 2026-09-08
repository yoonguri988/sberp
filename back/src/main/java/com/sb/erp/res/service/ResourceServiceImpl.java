package com.sb.erp.res.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.res.dto.request.ResRequest;
import com.sb.erp.res.dto.request.ResSearchRequest;
import com.sb.erp.res.dto.response.ResResponse;
import com.sb.erp.res.repository.ResourceMapper;
import com.sb.erp.resv.repository.ReservationMapper;

@Service
public class ResourceServiceImpl implements ResourceService {

    @Autowired private ResourceMapper dao;
    @Autowired private ReservationMapper resvDao;

    @Override
    public List<ResResponse> getResourceList(ResSearchRequest search) {
    	search.setPstartno((search.getPstartno()-1)*search.getOnepagelist());
        List<ResResponse> resourceList = dao.selectResourceList(search);
        return resourceList;
    }

    @Override
    public int getResourceCount(ResSearchRequest search) {
        return dao.selectResourceCount(search);
    }

    @Override
    public ResResponse getResourceDetail(long resId) {
        return dao.selectResourceDetail(resId);
    }

    @Override
    public int insertResource(ResRequest ResResponse) {
    	return dao.insertResource(ResResponse);
    }

    @Override
    public int updateResource(ResRequest ResResponse) {
    	return dao.updateResource(ResResponse);
    }

    @Override
    @Transactional
    public int deleteResource(long resId) {
    	// 반려(REJ) 예약 이력은 컨트롤러의 삭제 차단 대상이 아니지만, row 자체는 남아있어서
    	// FK 제약조건 때문에 자원을 물리 삭제하기 직전에 먼저 정리해줘야 한다. (WAI/APP/NORET 건은
    	// ResourceController에서 countReservationsByResourceId 로 이미 걸러져서 이 시점엔 없다)
    	resvDao.deleteRejectedByResourceId(resId);
    	return dao.deleteResource(resId);
    }

	@Override
	public ResResponse isDuplicateResCode(ResRequest ResResponse) {
		return dao.selectByResCode(ResResponse);
	}

	@Override
	public List<ResResponse> getResListForResv(ResSearchRequest search) {
		return dao.selectResListForResv(search);
	}
}