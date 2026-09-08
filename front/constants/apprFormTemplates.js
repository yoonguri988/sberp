const apprFormTemplates = {
	leave: `
<h2>휴 가 신 청 서</h2>
<p><strong>휴가 종류 : </strong>(연차 / 오전반차 / 오후반차 / 공가 / 병가) 중 기입</p>
<p><strong>비상 연락처 : </strong>010-</p>
<p><strong>기간 : </strong>2026년 __월 __일 ~ 2026년 __월 __일 (총 __일간)</p>
<p><br></p>
<p><strong>휴가 사유</strong></p>
<p>※ 구체적인 휴가 사유를 입력해 주세요.</p>
<p><br></p>
<p><em>위와 같이 휴가를 신청하오니 승인하여 주시기 바랍니다.</em></p>
	`,
	expense: `
<h2>지 출 결 의 서</h2>
<p><strong>회계 구분 : </strong>(법인카드 / 개인환급 / 세금계산서)</p>
<p><strong>총 지출 금액 : </strong>금 ________________ 원정 (₩               )</p>
<p><br></p>
<p><strong>지출 내역</strong></p>
<ol>
	<li>예) 사무실 탕비실 비품 구매 — 수량 1 / 단가 50,000원 / 금액 50,000원</li>
	<li></li>
</ol>
<p><strong>합계 : </strong>50,000원</p>
	`,
	biz: `
<h2>기 안 / 품 의 서</h2>
<p><strong>기안 제목 : </strong>[기안 제목을 입력하세요]</p>
<p><strong>시행 일자 : </strong>2026년 __월 __일</p>
<p><br></p>
<p><strong>1. 목적 및 배경</strong></p>
<p>- 내용을 입력하세요.</p>
<p><br></p>
<p><strong>2. 주요 골자 (상세 내용)</strong></p>
<p>- 내용을 입력하세요.</p>
<p><br></p>
<p><strong>3. 기대 효과 및 결론</strong></p>
<p>- 내용을 입력하세요.</p>
	`,
};

export default apprFormTemplates;