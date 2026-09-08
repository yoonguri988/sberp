package com.sb.erp.pos.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sb.erp.pos.dto.request.PosRequest;
import com.sb.erp.pos.dto.response.PosResponse;
import com.sb.erp.pos.repository.PosMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PosServiceImpl implements PosService {

	private final PosMapper posMapper;

	// ─── 조회 ────────────────────────
	@Override
	public List<PosResponse> selectAll(Long comId) {
		return posMapper.selectAll(comId);
	}

	@Override
	public PosResponse selectOneById(long posId, Long comId) {
		// comId를 함께 넘겨 타 회사 직급 조회를 차단
		return posMapper.selectOneById(posId, comId);
	}

	// ─── 등록 / 수정 ──────────────────
	@Override
	public int insert(PosRequest dto, Long comId) {
		// 클라이언트가 보낸 comId는 신뢰하지 않고 세션 값으로 덮어씀
		dto.setComId(comId);
		return posMapper.insert(dto);
	}

	@Override
	public int update(PosRequest dto, Long comId) {
		dto.setComId(comId);
		return posMapper.update(dto);
	}

	// ─── 삭제 ────────────────────────
	@Override
	public int delete(long posId, Long comId) {
		// ⭐ 선검사 방식:
		// 그냥 delete하면 employee.pos_id FK 제약에 걸려 DataIntegrityViolationException 발생.
		// 예외로 처리하면 원인을 사용자에게 설명하기 어려우므로,
		// 사용 중인 사원 수를 먼저 세어 -1로 반환 → 컨트롤러가 409 + 안내 메시지 응답.
		int usingCount = posMapper.countEmpUsing(posId, comId);
		if (usingCount > 0) return -1;

		// Mapper의 delete는 PosRequest를 parameterType으로 받으므로 DTO에 담아 전달
		PosRequest dto = new PosRequest();
		dto.setPosId(posId);
		dto.setComId(comId);
		return posMapper.delete(dto);
	}

	// ─── 중복 검사 ────────────────────
	@Override
	public boolean isPosCodeDuplicate(String posCode, Long excludePosId, Long comId) {
		// excludePosId가 null이면 등록, 값이 있으면 수정(자기 자신 제외)
		return posMapper.countByPosCode(posCode, comId, excludePosId) > 0;
	}
}
