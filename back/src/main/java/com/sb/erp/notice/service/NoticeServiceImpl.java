package com.sb.erp.notice.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.global.exception.FileUploadException;
import com.sb.erp.notice.dto.request.NoticeRequest;
import com.sb.erp.notice.dto.request.NoticeSearchRequest;
import com.sb.erp.notice.dto.response.NoticeResponse;
import com.sb.erp.notice.repository.NoticeMapper;
import com.sb.erp.util.dto.FileUploadDto;
import com.sb.erp.util.dto.FileUploadType;
import com.sb.erp.util.dto.FileUploadUtil;
import java.io.IOException;
import java.util.Base64;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeServiceImpl implements NoticeService{
	
		private final NoticeMapper noticeMapper;

		@Override // 공지등록
		@Transactional
		public int insert(NoticeRequest dto , MultipartFile file) {
		    if (dto.getBcontent() != null && dto.getBcontent().contains("긴급")) {
		        int urgentCount = noticeMapper.countUrgentNotices(dto.getComId());
		        if (urgentCount >= 5) {
		            throw new IllegalStateException("긴급 공지는 최대 5개까지만 등록할 수 있습니다. 기존 긴급 공지를 해제한 후 다시 시도해주세요.");
		        }
		    }
		    if (file != null && !file.isEmpty()) {
		        FileUploadUtil.validate(file, FileUploadType.NOTICE_ATTACH);
		        try {
		            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
		            dto.setBfile(file.getOriginalFilename() + "|" + file.getContentType() + "|" + base64);
		        } catch (java.io.IOException e) {
		            throw new FileUploadException("파일을 읽는 중 오류가 발생했습니다.", e);
		        }
		    }
		    return noticeMapper.insert(dto);
		}

	    @Override // 공지수정
	    @Transactional
	    public int update(NoticeRequest dto, MultipartFile file) {
	    	NoticeResponse origin = noticeMapper.select(dto.getBno());
	        boolean wasUrgent = origin != null && origin.getBcontent() != null && origin.getBcontent().contains("긴급");
	        boolean willBeUrgent = dto.getBcontent() != null && dto.getBcontent().contains("긴급");

	        // 원래 긴급이 아니었는데 수정으로 긴급이 되려는 경우만 체크 (이미 긴급이었으면 카운트 안 늘어나니 통과)
	        if (willBeUrgent && !wasUrgent) {
	            int urgentCount = noticeMapper.countUrgentNotices(dto.getComId());
	            if (urgentCount >= 5) {
	                throw new IllegalStateException("긴급 공지는 최대 5개까지만 등록할 수 있습니다. 기존 긴급 공지를 해제한 후 다시 시도해주세요.");
	            }
	        }
	    	
			if (file != null && !file.isEmpty()) {
		        FileUploadUtil.validate(file, FileUploadType.NOTICE_ATTACH);
		        try {
		            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
		            dto.setBfile(file.getOriginalFilename() + "|" + file.getContentType() + "|" + base64);
		        } catch (java.io.IOException e) {
		            throw new FileUploadException("파일을 읽는 중 오류가 발생했습니다.", e);
		        }
		    }
			// 새 파일이 없으면 dto.getBfile()은 null → update 쿼리의 <if>가 기존 값을 그대로 유지시켜준다.
	        return noticeMapper.update(dto);
	    }

	    @Override // 공지삭제
	    @Transactional
	    public int delete(long bno) {
	        return noticeMapper.delete(bno);
	    }

	    @Override // 공지 상세 조회
	    public NoticeResponse select(long bno) { return noticeMapper.select(bno); }

	    @Override // 공지 조회수 증가
	    @Transactional
	    public int updateHit(long bno) { return noticeMapper.updateHit(bno); }

	    @Override  // 페이징
	    public List<NoticeResponse> selectAll(NoticeSearchRequest search) {
	    	search.setPstartno((search.getPstartno()-1)*search.getOnepagelist());
	        return noticeMapper.selectAll(search);
	    }

	    @Override // 전체 카운트
	    public int selectCount(NoticeSearchRequest search) { return noticeMapper.selectCount(search); }

		/* 이거 안쓰는거같은데
		 * @Override // 검색+페이징 public List<NoticeDto> selectNoticeList(NoticeSearchDto
		 * search) { return noticeMapper.selectNoticeList(search); }
		 */

	    @Override // 검색 결과 카운트
	    public Integer selectCountNoticeList(NoticeSearchRequest search) { return noticeMapper.selectCountNoticeList(search); }

		@Override // 긴급 공지 리스트
		public List<NoticeResponse> selectUrgentNotices(NoticeSearchRequest search) {  return noticeMapper.selectUrgentNotices(search); }

		@Override // 긴급 공지 갯수 체크용
		public int countUrgentNotices(long comId) {  return noticeMapper.countUrgentNotices(comId); }

		@Override  //긴급 5개 상단 고정 + 나머지 일반 목록 리스트
		public List<NoticeResponse> getNoticeListWithUrgent(NoticeSearchRequest search) {
		    // 1. 긴급 top5 먼저 조회 (pstartno 변형 전에 해야 함, urgent 쿼리는 offset 안 쓰니 순서 상관은 없지만 명확하게 먼저)
		    List<NoticeResponse> urgentList = noticeMapper.selectUrgentNotices(search);

		    // 2. pinnedBnos 세팅 (selectAll, selectCountNoticeList 둘 다 이 값 참조함)
		    search.setPinnedBnos(urgentList.stream().map(NoticeResponse::getBno).map(Long::intValue).toList());

		    // 3. selectAll 호출 -> 이 안에서 pstartno가 offset으로 변형됨
		    List<NoticeResponse> pagedList = selectAll(search);

		    List<NoticeResponse> result = new java.util.ArrayList<>();
		    result.addAll(urgentList);
		    result.addAll(pagedList);
		    return result;
		}
	    
	    
	    
	    
}