package com.sb.erp.appr.service;

import java.util.List;

import com.sb.erp.appr.dto.request.ApprFormRequest;
import com.sb.erp.appr.dto.request.ApprFormSearchCondition;
import com.sb.erp.appr.dto.response.ApprFormListResponse;
import com.sb.erp.appr.dto.response.ApprFormResponse;
import com.sb.erp.appr.dto.response.CodeCheckResponse;


public interface ApprFormService { 
	
	// 목록 조회
	public ApprFormListResponse listForms(ApprFormSearchCondition condition);
	
	// 단건 조회 ( Id + Version )
	public ApprFormResponse getForm(Long forId, Long forVersion, Long comId);
	
	// 특정 양식의 전체 버전 조회 ( 이력 )
	public List<ApprFormResponse> getFormVersions(Long forId, Long comId);
	
	// 양식 등록 ( 생성된 forId 반환 )
	public Long insertForm(ApprFormRequest req);
	
	// 양식 수정 
	public void updateForm(Long forId, Long forVersion, ApprFormRequest req);
	
	// 양식 삭제 ( 소프트 딜리트 )
	public void deleteForm(Long forId, Long forVersion, Long comId);
	
	// 양식 코드 중복 체크
	public CodeCheckResponse checkCode(String forCode, Long comId, Long forId);
}
