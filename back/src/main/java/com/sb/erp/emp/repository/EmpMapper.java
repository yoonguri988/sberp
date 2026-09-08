package com.sb.erp.emp.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.emp.dto.request.EmpRequest;
import com.sb.erp.emp.dto.request.EmpSearchRequest;
import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.perm.dto.response.EmpAuthResponse;

@Mapper
public interface EmpMapper {

	// ─── 사원 정보 ────────────────────────────────────

	// 상세조회
	EmpResponse selectByEmpId(@Param("empId") long empId, @Param("comId") long comId);

	// 검색 필터 + 페이징(limit 추가)
	List<EmpResponse> search(EmpSearchRequest dto);

	// 사원 등록
	int insert(EmpRequest dto);

	// 정보 수정
	int update(EmpRequest dto);

	// 이메일 중복 유무
	int countByEmpEmail(String empEmail);

	// 연락처 중복 유무
	int countByEmpMobile(String empMobile);

	// 사번 중복 유무
	int countByEmpNo(@Param("empNo") String empNo, @Param("comId") long comId);

	/*	paging	*/
	int selectCnt(EmpSearchRequest dto);

	// 비밀번호 찾기시 해당하는 사원 정보가 있는지 확인
	EmpResponse selectForVerify(EmpRequest dto);

	// 비밀번호 재설정
	int updatePassByEmpId(EmpRequest dto);

	// 이메일을 기준으로 사용자 정보 확인
	EmpResponse selectByEmpEmail(String empEmail);

	// 아이디를 기준으로 패스워드 확인
	String selectPassById(long empId);

	// 부서 아이디를 기준으로 사원 정보 확인
	List<EmpResponse> selectByDeptId(long deptId);

	// 회사 아이디를 기준으로 권한 정보와 엮여있는 사원 정보 확인
	List<EmpAuthResponse> selectAuthByComId(long comId);

	// 비밀번호 분실 - session(empId) 기반, 본인확인 후에만 진입 가능
	EmpResponse selectAuthByEmpId(long empId);

	// 비밀번호 분실시 본인 확인 - EMP_ID로만 조회해서 업데이트
	int updatePassByEmpIdOnly(EmpRequest dto);
}
