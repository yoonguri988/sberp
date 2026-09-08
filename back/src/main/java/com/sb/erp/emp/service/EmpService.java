package com.sb.erp.emp.service;

import java.util.List;

import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.dto.request.EmpSearchRequest;
import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.perm.dto.response.EmpAuthResponse;

/**
 * 사원 관리 서비스.
 *
 * <p>수업 방식 이관: Service가 SecurityUtil로 comId/isAdmin을 꺼내지 않고,
 * Controller가 AuthUserJwtService로 꺼내서 파라미터로 전달한다.
 * Service는 Spring Security 의존성이 완전히 제거되어 테스트가 쉬워짐.
 */
public interface EmpService {


	// ─── 조회 ────────────────────────
	// 상세 보기
	EmpResponse selectByEmpId(long empId, Long comId);

	// 이메일을 기준으로 사용자 정보 확인 (comId 불필요 — 로그인 처리 등에서 사용)
	EmpResponse selectByEmpEmail(String empEmail);

	// 사원 목록(검색). isAdmin=false일 때 민감정보 마스킹.
	List<EmpResponse> search(EmpSearchRequest dto, Long comId, boolean isAdmin);

	// paging
	int selectCnt(EmpSearchRequest dto, Long comId);

	// 부서 id를 통해 사원정보 조회 (comId 불필요)
	List<EmpResponse> selectByDeptId(long deptId);


	// ─── 등록/수정 ─────────────────────
	// 사원 등록
	int insert(EmpRequest dto, Long comId);

	// 사원 정보 수정
	int update(EmpRequest dto, Long comId);


	// ─── 중복 검사 ─────────────────────
	boolean isEmailDuplicate(String empEmail);
	boolean isMobileDuplicate(String empMobile);
	boolean isEmpNoDuplicate(String empNo, Long comId);


	// ─── 비밀번호 ──────────────────────
	// 비밀번호 재설정
	int updatePassByEmpId(EmpRequest dto, Long comId);

	// 관리자 초기화 (사번으로)
	int resetPassByEmpNo(long empId, Long comId);

	// 본인 변경
	int changePassword(long empId, String currentPass, String newPass, Long comId);

	// 기존 비밀번호와 일치 확인
	boolean matchPassword(EmpRequest dto);

	// 비밀번호 찾기시 해당하는 사원 정보가 있는지 확인
	EmpResponse selectForVerify(EmpRequest dto);


	// ─── 권한 표시 ─────────────────────
	// 회사 아이디를 기준으로 권한 정보와 엮여있는 사원 정보 확인
	List<EmpAuthResponse> selectAuthByComId(Long comId);

	// 비밀번호 분실시 본인 확인 - session(empId)기반 (comId 불필요)
	EmpResponse selectAuthByEmpId(long empId);

	// 비밀번호 분실시 본인 확인 - EMP_ID로만 조회해서 업데이트 (comId 불필요)
	int updatePassByEmpIdOnly(EmpRequest dto);
}
