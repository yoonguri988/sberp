package com.sb.erp.perm.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sb.erp.perm.dto.request.EmpAuthRequest;
import com.sb.erp.perm.dto.request.PermRequest;
import com.sb.erp.perm.dto.response.EmpAuthResponse;
import com.sb.erp.perm.dto.response.PermResponse;
import com.sb.erp.perm.repository.PermMapper;

import lombok.RequiredArgsConstructor;

/**
 * 권한 관리 서비스.
 * ⚠️ AuthService에서 분리!
 *   auth 도메인 = 인증(Authentication) — 로그인, JWT, CustomUserDetails
 *   perm 도메인 = 인가(Authorization) — 권한 CRUD, 사원-권한 매핑
 *
 *  분리한 메서드 9개 (AuthService/AuthServiceImpl에서는 삭제):
 *  selectAll, selectOneById, insert, update, delete,
 *  selectEmpsByAuthId, selectAuthsByEmpId, grantAuth, revokeAuth
 *
 * 대응 SQL 9개도 auth-mapper.xml → perm-mapper.xml로 분리!!
 * namespace가 달라 당장 충돌은 없으나 DB 스키마 변경 시 두 곳을 고쳐야 하므로 auth 도메인 리팩토링 시 원본을 제거할 것.
 *
 * <p>수업 방식 이관: comId를 Service가 SecurityUtil로 꺼내지 않고,
 * Controller가 AuthUserJwtService로 꺼내서 파라미터로 전달한다.
 */
@Service
@RequiredArgsConstructor
public class PermServiceImpl implements PermService {

	private final PermMapper permMapper;


	// ─── 로그인 시 사원 권한 조회 ───
	@Override
	public PermResponse selectByEmpId(long empId) {
		// 로그인 처리 중 호출되므로 SecurityContext가 아직 비어 있음
		// → comId 격리를 적용하지 않는 유일한 메서드
		return permMapper.selectByEmpId(empId);
	}


	// ─── 권한 관리 ────────────────
	@Override
	public List<PermResponse> selectAll(Long comId) {
		// autCount(부여 사원 수)는 emp_auth와 LEFT JOIN 집계로 산출
		// → 아무에게도 부여되지 않은 권한도 0으로 함께 조회됨
		return permMapper.selectAll(comId);
	}

	@Override
	public PermResponse selectOneById(long autId, Long comId) {
		return permMapper.selectOneById(autId, comId);
	}

	@Override
	public int insert(PermRequest dto, Long comId) {
		// 클라이언트가 보낸 comId는 신뢰하지 않고 세션 값으로 덮어씀
		dto.setComId(comId);
		return permMapper.insert(dto);
	}

	@Override
	public int update(PermRequest dto, Long comId) {
		dto.setComId(comId);
		return permMapper.update(dto);
	}

	@Override
	public int delete(long autId, Long comId) {
		
		// 사용 중인 사원이 있으면 FK 제약 예외 대신 -1 반환
	    int usingCount = permMapper.countEmpUsing(autId);
	    if (usingCount > 0) return -1;

	    PermRequest dto = new PermRequest();
	    dto.setAutId(autId);
	    dto.setComId(comId);
	    return permMapper.delete(dto);
	}


	// ─── 사원-권한 매핑 ───────────────
	@Override
	public List<EmpAuthResponse> selectEmpsByAuthId(long autId, Long comId) {
		return permMapper.selectEmpsByAuthId(autId, comId);
	}

	@Override
	public List<EmpAuthResponse> selectAuthsByEmpId(long empId, Long comId) {
		return permMapper.selectAuthsByEmpId(empId, comId);
	}

	/**
	 * 권한 부여 : 부여하려는 권한이 현재 회사 소속인지 먼저 확인한다.
	 * @return 1=성공, 0=권한이 현재 회사 소속이 아님
	 */
	@Override
	public int grantAuth(EmpAuthRequest dto, Long comId) {
		PermResponse auth = permMapper.selectOneById(dto.getAutId(), comId);
		if (auth == null) return 0;

		// 대상 사원의 회사 소속 여부는 컨트롤러 진입 시 EmpService 조회로 커버
		return permMapper.grantAuth(dto);
	}

	/**
	 * 권한 회수.
	 * emp_auth에 UNIQUE(emp_id, aut_id) 제약이 있어야 정확히 1건만 지워진다.
	 * @return 1=성공, 0=대상 없음
	 */
	@Override
	public int revokeAuth(EmpAuthRequest dto,  Long comId) {
		return permMapper.revokeAuth(dto);
	}
}
