package com.sb.erp.util.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class PagingUtil {
	private int listtotal;    // #1) 전체글 193
	private int onepagelist;  // #2) 한페이지에 보여줄 게시물 수: 10
	private int pagetotal;    // #3) 총 페이지 193/10 19페이지 + 3글 = 20개
	private int bottomlist;   // #4) 하단 페이지 10
	private int pstartno;     // #5) 페이지 시작번호(1) 0,10 (2) 10,10
	private int current;      // #6) 현재 번호
	private int start;        // #7) 시작 번호
	private int end;          // #8) 끝 번호

	public PagingUtil(int listtotal, int pageNo) { this(listtotal, pageNo, 10, 10); }
	
	public PagingUtil(int listtotal, int pageNo, int onepagelist, int bottomlist) {
		this.listtotal = listtotal; // 원본 유지, 0 강제 변환 제거(목록 결과 없을 때 결과값 보이는 것 방지)
		this.onepagelist = onepagelist;
		this.pagetotal = (listtotal <= 0) ? 1 : (int) Math.ceil(listtotal / (double) onepagelist);
		
		this.bottomlist = bottomlist;
		this.current = pageNo; // 23 -> start = 21, end = 30
		this.start = ((current - 1) / bottomlist) * bottomlist + 1;
		// 21 -> (21-1)/10 -> 앞자리를 2로 * 10 +1
		this.end = start + bottomlist - 1; //21+10-1=30
		if (end > pagetotal) { end = pagetotal; } // 30 > 26 마지막은 26
		this.pstartno = (pageNo - 1) * onepagelist;
	}
}
