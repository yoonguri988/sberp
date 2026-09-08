package com.sb.erp.proj.service;

import java.util.List;

import org.apache.ibatis.annotations.Param;

import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.proj.dto.request.ProjmemRequest;
import com.sb.erp.proj.dto.response.ProjmemResponse;

public interface ProjectMemberService {
	
	//프로젝트 참여 인원 조회
	public List<ProjmemResponse> select(Long proId);
	
	//프로젝트 멤버 추가
	public int insert(ProjmemRequest dto);
	
	//프로젝트 멤버 삭제
	public int delete(Long pmId);
	
	//해당 프로젝트에 참여 중인 멤버 목록
	public List<ProjmemResponse> selectByproject(Long projectProId);
	
	//프로젝트 등록-멤버 이름,유효성 체크
	public ProjmemResponse selectOne(Long pmId);
	
	//사원 이름,번호 조회
	public List<EmpResponse> searchEmpForProject(@Param("comId") Long comId, @Param("keyword") String keyword);
	
}
