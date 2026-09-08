package com.sb.erp.notice.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.notice.dto.request.NoticeRequest;
import com.sb.erp.notice.dto.request.NoticeSearchRequest;
import com.sb.erp.notice.dto.response.NoticeResponse;

public interface NoticeService {
	
	// 공지 등록
	public int insert(NoticeRequest dto, MultipartFile file);
	// 공지 수정
	public int update(NoticeRequest dto, MultipartFile file);
	// 공지 삭제
	public int delete(long bno);
	// 상세 조회
	public NoticeResponse select(long bno);
	// 조회수 증가
	public int updateHit(long bno);
	// 일반 목록   
	public List<NoticeResponse> selectAll(NoticeSearchRequest search);
	// 전체 카운트
	public int selectCount(NoticeSearchRequest search);
	// 페이징 계산용 카운트    
	//public List<NoticeDto> selectNoticeList(NoticeSearchDto search);
	// 검색 결과 카운트
	public Integer selectCountNoticeList(NoticeSearchRequest search);
    // 긴급 공지 리스트
    public List<NoticeResponse> selectUrgentNotices(NoticeSearchRequest search);
    // 긴급 공지 갯수 체크용
    public int countUrgentNotices(long comId);
    //긴급 5개 상단 고정 + 나머지 일반 목록 리스트
    public List<NoticeResponse> getNoticeListWithUrgent(NoticeSearchRequest search);
    
   
	
	}
	


