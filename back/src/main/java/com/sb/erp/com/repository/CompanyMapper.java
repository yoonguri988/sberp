package com.sb.erp.com.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.com.dto.request.ComRequest;
import com.sb.erp.com.dto.request.CompanySearchRequest;
import com.sb.erp.com.dto.response.ComResponse;
import com.sb.erp.com.dto.response.StatsComResponse;

@Mapper
public interface CompanyMapper {
	public List<ComResponse> selectAll(CompanySearchRequest search);

	public int insert(ComRequest dto);
	
	public ComResponse selectByBizNo(String bizNo);

	public ComResponse selectOneById(long comId);

	public int update(ComRequest dto);

	public int delete(long comId);

	// 회사를 FK로 참조하는 하위 테이블(부서/직원/전자결재 등)에 남아있는 데이터 건수 합계.
	// 0이면 delete()로 완전 삭제해도 안전하고, 1 이상이면 softDelete()로 비활성화 처리한다.
	public long countRelatedData(long comId);

	// 하위 데이터가 남아있어 완전 삭제할 수 없을 때 대신 사용하는 비활성화 처리(com_status = INACTIVE)
	public int softDelete(long comId);

	// 비활성화된 회사를 다시 사용 가능한 상태로 되돌림(com_status = ACTIVE)
	public int reactivate(long comId);

	public List<ComResponse> selectSuggest(@Param("keyword") String keyword);

	public int listTotal(CompanySearchRequest search);

	public StatsComResponse selectStats();

	public ComResponse selectOneByEmpId(long empId);

}
