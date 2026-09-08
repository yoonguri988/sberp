package com.sb.erp.rec.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.apct.repository.ApplicantRepository;
import com.sb.erp.com.entity.Company;
import com.sb.erp.emp.entity.Employee;
import com.sb.erp.rec.dto.request.RecruitRequest;
import com.sb.erp.rec.dto.request.RecruitSearchRequest;
import com.sb.erp.rec.dto.response.RecruitResponse;
import com.sb.erp.rec.entity.Recruit;
import com.sb.erp.rec.repository.RecruitRepository;
import com.sb.erp.rec.repository.spec.RecruitSpecs;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecruitService {

    private final RecruitRepository recruitRepository;
    private final ApplicantRepository applicantRepository;
    private final EntityManager em;   

    // 관리자용 - 회사 내 공고 목록 (상태 선택 필터 + 페이징)
    public Page<RecruitResponse> getAdminList(Long comId, String recStatus, String recTitle,Pageable pageable) {
        return recruitRepository.findAll(RecruitSpecs.search(comId, recStatus,recTitle), pageable)
                .map(this::mapToResponse);
    }
    // 관리자용 - 전체 건수
    public int selectCnt(RecruitSearchRequest search) {
        Specification<Recruit> spec = RecruitSpecs.search(search.getComId(), search.getRecStatus(), search.getRecTitle());
        return (int) recruitRepository.count(spec);
    }

    // 관리자용 - 목록 (List로 딱 받기)
    public List<RecruitResponse> selectAll(RecruitSearchRequest search) { 
    	 log.info("comId=" + search.getComId() + ", recStatus=[" + search.getRecStatus() + "]");
        Specification<Recruit> spec = RecruitSpecs.search(search.getComId(), search.getRecStatus(), search.getRecTitle());
        Pageable pageable = PageRequest.of(search.getPageIndex(), search.getOnepagelist(),Sort.by(Sort.Direction.DESC, "recStartDate"));

        return recruitRepository.findAll(spec, pageable)
                .map(this::mapToResponse)
                .getContent();
    }

    // 상세 조회 (공개/관리자 공통)
    public RecruitResponse getDetail(Long recId) {
        Recruit recruit = recruitRepository.findById(recId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공고입니다."));
        return mapToResponse(recruit);
    }

    // 공고 등록 
    @Transactional
    public Long insert(RecruitRequest req, Long comId, Long empId) {
        Recruit entity = Recruit.builder()
                .company(em.getReference(Company.class, comId))
                .employee(em.getReference(Employee.class, empId))
                .recTitle(req.getRecTitle())
                .recDepartment(req.getRecDepartment())
                .recPosition(req.getRecPosition())
                .recHeadcount(req.getRecHeadcount())
                .recEmploymentType(req.getRecEmploymentType())
                .recDescription(req.getRecDescription())
                .recStartDate(req.getRecStartDate())
                .recEndDate(req.getRecEndDate())
                .recStatus(req.getRecStatus())
                .build();

        Recruit saved = recruitRepository.save(entity);
        return saved.getRecId();
    }
    
	// 공고 수정
    @Transactional
    public void update(Long recId, RecruitRequest req, Long comId) {
        Recruit recruit = recruitRepository.findById(recId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공고입니다."));

        if (!recruit.getCompany().getComId().equals(comId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        recruit.setRecTitle(req.getRecTitle());
        recruit.setRecDepartment(req.getRecDepartment());
        recruit.setRecPosition(req.getRecPosition());
        recruit.setRecHeadcount(req.getRecHeadcount());
        recruit.setRecEmploymentType(req.getRecEmploymentType());
        recruit.setRecDescription(req.getRecDescription());
        recruit.setRecStartDate(req.getRecStartDate());
        recruit.setRecEndDate(req.getRecEndDate());
        recruit.setRecStatus(req.getRecStatus());
    }
    // 공고 삭제
    @Transactional
    public void delete(Long recId, Long comId) {
        Recruit recruit = recruitRepository.findById(recId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공고입니다."));

        if (!recruit.getCompany().getComId().equals(comId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        if (applicantRepository.existsByRecruit_RecId(recId)) {
            throw new IllegalStateException("지원자가 있는 공고는 삭제할 수 없습니다.");
        }

        recruitRepository.delete(recruit);
    }

    private RecruitResponse mapToResponse(Recruit recruit) {
        return new RecruitResponse(
                recruit,
                recruit.getEmployee().getEmpName(),
                recruit.getApplicants().size()
        );
    }
    
    // 공개용 - 전체 건수
    public int getOpenCnt(Long comId, String recTitle) {
        return (int) recruitRepository.count(RecruitSpecs.search(comId, "OPEN", recTitle));
    }

    //  공개용 - 특정 회사의 OPEN 공고만 목록 조회 (비회원 지원자용)
    public List<RecruitResponse> getOpenListAsList(Long comId, String recTitle, int pstartno, int onepagelist) {
        Pageable pageable = PageRequest.of(
                pstartno - 1 < 0 ? 0 : pstartno - 1,
                onepagelist,
                Sort.by(Sort.Direction.DESC, "recStartDate")
        );
        return recruitRepository.findAll(RecruitSpecs.search(comId, "OPEN", recTitle), pageable)
                .map(this::mapToResponse)
                .getContent();
    }
    
    // 공고 복제 - 기존 공고 데이터를 RecruitRequest로 반환 (title만 [복사본] 접미사, 날짜/상태는 비워서 재입력 유도)
    public RecruitRequest getCloneData(Long recId, Long comId) {
        Recruit recruit = recruitRepository.findById(recId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공고입니다."));

        if (!recruit.getCompany().getComId().equals(comId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        RecruitRequest cloneReq = new RecruitRequest();
        cloneReq.setRecTitle(recruit.getRecTitle() + " [복사본]");
        cloneReq.setRecDepartment(recruit.getRecDepartment());
        cloneReq.setRecPosition(recruit.getRecPosition());
        cloneReq.setRecHeadcount(recruit.getRecHeadcount());
        cloneReq.setRecEmploymentType(recruit.getRecEmploymentType());
        cloneReq.setRecDescription(recruit.getRecDescription());
        // 시작일/종료일/상태는 새로 입력받아야 하니 세팅 안 함 (null)

        return cloneReq;
    }
}