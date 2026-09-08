package com.sb.erp.appr.repository;


import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.appr.dto.request.ApprFormRequest;
import com.sb.erp.appr.dto.request.ApprFormSearchCondition;
import com.sb.erp.appr.dto.response.ApprFormResponse;

@Mapper
public interface ApprFormMapper {
	
	public String getCompanyName(@Param("comId") Long comId);
	
	// 페이징
	public int listFormCnt(ApprFormSearchCondition condition);
	
	// 양식 파트
	public String findByCode(@Param("forCode") String forCode,
							 @Param("comId") Long comId,
							 @Param("forId") Long forId);
	public ApprFormResponse selectFormAll(@Param("forId") Long forId,
					 					  @Param("forVersion") Long forVersion);
	public int insertForm(ApprFormRequest req);
	public int updateForm(@Param("forId") Long forId,
						  @Param("forVersion") Long forVersion,
						  @Param("req") ApprFormRequest req);
	public int deleteForm(@Param("forId") Long forId,
						  @Param("forVersion") Long forVersion,
						  @Param("comId") Long comId);
	public int updateFormNewVersion(@Param("forId") Long forId,
								    @Param("req") ApprFormRequest req);
	public List<ApprFormResponse> selectFormList(ApprFormSearchCondition condition);
	public List<ApprFormResponse> selectFormVersions(@Param("forId") Long forId,
													 @Param("comId") Long comId);
	
	// insert로 채번된 시퀀스값
	public Long selectCurrentFormSeq();
}
