package com.sb.erp.proj.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.sb.erp.emp.dto.response.EmpResponse;
import com.sb.erp.proj.dto.request.ProjmemRequest;
import com.sb.erp.proj.dto.response.ProjmemResponse;
import com.sb.erp.proj.repository.ProjectMemberMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectMemberServiceImpl implements ProjectMemberService{
	private final ProjectMemberMapper dao;
	
	//프로젝트 멤버 추가
	@Override 
	@Transactional
	public int insert(ProjmemRequest dto) { 
	    if (dao.existsMember(dto) > 0) {
	        throw new IllegalArgumentException("이미 프로젝트에 참여 중인 사원입니다.");
	    }
		return dao.insert(dto); }
	
	//프로젝트 멤버 삭제
	@Override 
	@Transactional
	public int delete(Long pmId) {  return dao.delete(pmId); }
	
	//프로젝트 참여 인원 조회
	@Override public List<ProjmemResponse> select(Long proId) { return dao.select(proId); }
	
	//해당 프로젝트에 참여 중인 멤버 목록
	@Override public List<ProjmemResponse> selectByproject(Long projectProId) {  return dao.selectByproject(projectProId); }
	
	//프로젝트 등록-멤버 이름,유효성 체크
	@Override public ProjmemResponse selectOne(Long pmId) {  return dao.selectOne(pmId); }
	
	//사원 이름,번호 조회
	@Override public List<EmpResponse> searchEmpForProject(Long comId, String keyword) { return dao.searchEmpForProject(comId, keyword); }

}
