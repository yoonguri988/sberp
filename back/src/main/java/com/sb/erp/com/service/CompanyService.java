package com.sb.erp.com.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.dto.request.CompanySearchRequest;
import com.sb.erp.com.dto.response.ComResponse;
import com.sb.erp.com.dto.response.StatsComResponse;

public interface CompanyService {
	public List<ComResponse> list(CompanySearchRequest search);
	
	public int add(ComRequest dto, MultipartFile logoFile);
	
	public ComResponse isDuplicateBizNo(String bizNo);
	
	public ComResponse selectOneById(long comId);

	int update(long comId, ComRequest dto, MultipartFile logoFile);

	// 연관 데이터가 없으면 완전 삭제(true 반환은 없음), 남아있으면 비활성화 처리 후 true 반환.
	// 반환값: true = 비활성화(soft delete)됨 / false = 완전 삭제됨
	public boolean delete(long comId);

	// 비활성화된 회사를 다시 활성화
	public void restore(long comId);

	public List<ComResponse> getSuggest(String keyword);

	public int listTotal(CompanySearchRequest search);

	public StatsComResponse selectStats();

	public ComResponse selectOneByEmpId(long empId);
}
