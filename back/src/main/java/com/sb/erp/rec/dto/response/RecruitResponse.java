package com.sb.erp.rec.dto.response;

import java.time.LocalDateTime;

import com.sb.erp.rec.entity.Recruit;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @NoArgsConstructor
public class RecruitResponse {

    private Long recId;
    private Long comId;
    private String comName;
    private Long empId;
    private String recTitle;
    private String recDepartment;
    private String recPosition;
    private Long recHeadcount;
    private String recEmploymentType;
    private String recDescription;
    private LocalDateTime recStartDate;
    private LocalDateTime recEndDate;
    private String recStatus;
    private String createdAt;
    private String updatedAt;

    // 조회(JOIN) 결과 전용 - DB에 없는 컬럼
    private String empName; // 담당자명
    private Integer applicantCnt; // 지원자 수

    // insert, update, select 결과물 - Entity 전체 필드를 그대로 옮김
    public RecruitResponse(Recruit recruit) {
        this.recId = recruit.getRecId();
        this.comId = recruit.getCompany().getComId();
        this.comName = recruit.getCompany().getComName();
        this.empId = recruit.getEmployee().getEmpId();
        this.recTitle = recruit.getRecTitle();
        this.recDepartment = recruit.getRecDepartment();
        this.recPosition = recruit.getRecPosition();
        this.recHeadcount = recruit.getRecHeadcount();
        this.recEmploymentType = recruit.getRecEmploymentType();
        this.recDescription = recruit.getRecDescription();
        this.recStartDate = recruit.getRecStartDate();
        this.recEndDate = recruit.getRecEndDate();
        this.recStatus = recruit.getRecStatus();
        this.createdAt = recruit.getCreatedAt() != null ? recruit.getCreatedAt().toString() : null;
        this.updatedAt = recruit.getUpdatedAt() != null ? recruit.getUpdatedAt().toString() : null;
    }

    // 목록 조회(JOIN, 담당자명+지원자수 포함)용 - empName, applicantCnt까지 채운 생성자
    public RecruitResponse(Recruit recruit, String empName, Integer applicantCnt) {
        this(recruit);
        this.empName = empName;
        this.applicantCnt = applicantCnt;
    }
}