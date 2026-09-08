package com.sb.erp.appr.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.appr.dto.response.ApprLineResponse;

@Mapper
public interface ApprLineMapper {
	
	public int insertLine(@Param("docId") Long docId,
						  @Param("empId") Long empId,
						  @Param("linOrder") Integer linOrder,
						  @Param("linStatus") String linStatus);
	public int updateLineStatus(@Param("docId") Long docId,
								@Param("empId") Long empId,
								@Param("linStatus") String linStatus);
	public int activeNextLine(@Param("docId") Long docId,
							  @Param("empId") Long empId);
	public ApprLineResponse selectLineByOrder(@Param("docId") Long docId,
											  @Param("linOrder") Integer linOrder);
	
	public List<ApprLineResponse> selectLinesByDocId(@Param("docId") long docId);
}
