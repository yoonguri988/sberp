package com.sb.erp.pos.service;

import java.util.List;

import com.sb.erp.pos.dto.request.PosRequest;
import com.sb.erp.pos.dto.response.PosResponse;

/**
 * 직급(emp_position) 관리 서비스.
 *
 * <p>회사 격리 원칙: 모든 조회/수정은 Controller가 전달한 {@code comId}로
 * 로그인 사용자의 회사를 강제 적용한다.
 *
 * <p>수업 방식 이관: 기존엔 Service가 SecurityUtil로 직접 comId를 꺼냈으나,
 * AuthUserJwtService(수업 표준) 이관에 따라 Controller가 comId를 파라미터로 전달한다.
 * 이로 인해 Service 계층이 Spring Security와 완전히 분리되어 테스트가 쉬워진다.
 */
public interface PosService {

	// ─── 조회 ────────────────────────
	// 현재 회사의 직급 목록 (pos_order 오름차순)
	List<PosResponse> selectAll(Long comId);

	// 직급 단건 조회. 없거나 타 회사 소속이면 null
	PosResponse selectOneById(long posId, Long comId);


	// ─── 등록 / 수정 ──────────────────
	// 직급 등록. 반환: 1=성공, 0=실패
	// insert 후 dto.posId에 생성된 PK가 채워짐 (pos-mapper.xml의 selectKey)
	int insert(PosRequest dto, Long comId);

	// 직급 수정. 반환: 1=성공, 0=대상 없음(또는 타 회사)
	int update(PosRequest dto, Long comId);


	// ─── 삭제 ────────────────────────
	// 직급 삭제.
	// 반환 규약: 1=성공, 0=대상 없음, -1=해당 직급을 사용 중인 사원이 있어 삭제 불가
	// ※ -1은 FK 제약 위반을 예외로 터뜨리지 않고 미리 검사해서 반환하는 값.
	//    컨트롤러에서 409 CONFLICT로 매핑한다.
	int delete(long posId, Long comId);


	// ─── 중복 검사 ────────────────────
	// 직급코드 중복 여부.
	// @param excludePosId 수정 화면에서 자기 자신을 제외할 때 사용 (등록 시 null)
	boolean isPosCodeDuplicate(String posCode, Long excludePosId, Long comId);
}
