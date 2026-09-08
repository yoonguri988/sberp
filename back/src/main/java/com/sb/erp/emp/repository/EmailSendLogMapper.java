package com.sb.erp.emp.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.sb.erp.emp.dto.WelcomeMailTargetDto;

@Mapper
public interface EmailSendLogMapper {

    // ─── 발송 로그 CRUD (MERGE 기반 upsert) ───

    /**
     * 발송 시작 시 상태 'P'로 upsert.
     * - 최초: INSERT
     * - 재시도(기존 'F' 또는 'P'): UPDATE
     */
    int upsertProcessing(@Param("empId") Long empId,
                         @Param("mailType") String mailType);

    /** 발송 성공 시 'S'로 갱신. */
    int updateSuccess(@Param("empId") Long empId,
                      @Param("mailType") String mailType);

    /** 발송 실패 시 'F' + error_msg 저장. */
    int updateFail(@Param("empId") Long empId,
                   @Param("mailType") String mailType,
                   @Param("errorMsg") String errorMsg);


    // ─── 스케줄러용 조회 ───

    /**
     * 3일 전 등록 사원 중 FOLLOWUP_3DAY 미발송자 조회.
     * - LEFT JOIN + IS NULL 로 이력 없는 사원만 필터
     * - 재시도 원할 시 status = 'F'도 대상에 포함하는 별도 쿼리 사용
     */
    List<WelcomeMailTargetDto> selectFollowup3DayTargets();

    /**
     * 환영 메일 미발송자 조회 (afterCommit 이후 서버 다운 등에 대한 안전망).
     * - 최근 7일 이내 등록 사원 중 WELCOME 로그가 없거나 status='F'인 사원
     */
    List<WelcomeMailTargetDto> selectWelcomeOrphans();
}
