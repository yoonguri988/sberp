package com.sb.erp.dashboard.admin.repository;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/*
관리자 대시보드 전용 MyBatis Mapper.
다른 도메인의 서비스/매퍼를 우회, 대시보드 요구사항에 맞는 조회 쿼리를 직접 사용 
*/
@Mapper
public interface AdminDashboardMapper {

    /*
     * 회사 전체 프로젝트 중 진행 중인 것을 마감일 임박순으로 조회
     * @param comId  회사 ID
     * @param limit  최대 반환 건수 (예: 5)
     * @return 각 row는 { proId, proName, proStatus, endDate, empName } 을 담은 Map
     */
    List<Map<String, Object>> selectCompanyOngoingProjects(
            @Param("comId") Long comId,
            @Param("limit") int limit);

    /*
     * 특정 사원이 리더이거나 멤버로 소속된 진행 중 프로젝트를 마감일 임박순으로 조회
     * @param empId  로그인 사원 ID
     * @param comId  회사 ID (교차회사 방지)
     * @param limit  최대 반환 건수
     */
    List<Map<String, Object>> selectMyOngoingProjects(
            @Param("empId") Long empId,
            @Param("comId") Long comId,
            @Param("limit") int limit);
}