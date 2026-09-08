package com.sb.erp.apct.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sb.erp.apct.dto.request.ApplicantRequest;
import com.sb.erp.apct.dto.response.ApplicantResponse;
import com.sb.erp.apct.dto.response.ApplicantStatusCountResponse;
import com.sb.erp.apct.dto.response.MyApplicationResponse;
import com.sb.erp.apct.entity.Applicant;
import com.sb.erp.apct.oauth2.ApplicantPrincipal;
import com.sb.erp.apct.repository.ApplicantRepository;
import com.sb.erp.apct.repository.spec.ApplicantSpecs;
import com.sb.erp.rec.entity.Recruit;
import com.sb.erp.rec.repository.RecruitRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicantService {

    private final ApplicantRepository applicantRepository;
    private final RecruitRepository recruitRepository;

    
    // 지원하기
    @Transactional
    public Long apply(ApplicantRequest req, Authentication authentication) {

        ApplicantPrincipal applicant = (ApplicantPrincipal) authentication.getPrincipal();
        Recruit recruit = recruitRepository.findById(req.getRecId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 공고입니다."));
        if (!"OPEN".equals(recruit.getRecStatus())) {
            throw new IllegalStateException("현재 지원할 수 없는 공고입니다.");
        }
        boolean alreadyApplied = applicantRepository
                .existsByRecruit_RecIdAndProviderAndProviderId(
                        req.getRecId(), applicant.getProvider(), applicant.getProviderId());
        if (alreadyApplied) {
            throw new IllegalStateException("이미 지원한 공고입니다.");
        }
        String email = (req.getApctEmail() != null && !req.getApctEmail().isBlank())
                ? req.getApctEmail()
                : applicant.getEmail();
        Applicant entity = Applicant.builder()
                .company(recruit.getCompany())
                .recruit(recruit)
                .apctName(req.getApctName())
                .provider(applicant.getProvider())
                .providerId(applicant.getProviderId())
                .apctEmail(email)
                .apctPhone(req.getApctPhone())
                .apctStatus("RECEIVED")
                .build();
        Applicant saved = applicantRepository.save(entity);
        return saved.getApctId();
    }

    // 내 지원현황 조회
    public List<MyApplicationResponse> getMyApplications(Authentication authentication) { 
        ApplicantPrincipal applicant = (ApplicantPrincipal) authentication.getPrincipal();
        return applicantRepository.findMyApplications(applicant.getProvider(), applicant.getProviderId());
    }

    // 관리자용 - 지원자 목록 (상태 선택 필터 + 페이징, 최신 지원순 정렬)
    public Page<ApplicantResponse> getAdminList(Long comId, Long recId, String apctStatus, Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "apctDate")
        );
        return applicantRepository.findAll(ApplicantSpecs.search(comId, recId, apctStatus), sortedPageable)
                .map(this::mapToResponse);
    }

    // 관리자용 - 지원자 상세 (이력서 수 포함)
    public ApplicantResponse getDetail(Long apctId) {
        Applicant applicant = applicantRepository.findById(apctId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지원자입니다."));
        return mapToResponse(applicant);
    }

    // 관리자용 - 대시보드 (상태별 집계) ## ( 당장은 안씀 )
    public List<ApplicantStatusCountResponse> getDashboardStats(Long comId) {
        return applicantRepository.countByStatusGrouped(comId).stream()
                .map(row -> new ApplicantStatusCountResponse((String) row[0], ((Number) row[1]).longValue()))
                .collect(Collectors.toList());
    }

    // 관리자용 - 공고별 fit_score 순위
    public Page<ApplicantResponse> getRankByFitScore(Long recId, Pageable pageable) {
        return applicantRepository.findByRecIdOrderByFitScore(recId, pageable);
    }

    // 관리자용 - 상태 변경
    @Transactional
    public void updateStatus(Long apctId, String newStatus, Long comId) {
        if (!newStatus.matches("^(RECEIVED|SCREENING|INTERVIEW|HIRED|REJECTED)$")) {
            throw new IllegalArgumentException("유효하지 않은 상태입니다.");
        }

        Applicant applicant = applicantRepository.findById(apctId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지원자입니다."));

        if (!applicant.getCompany().getComId().equals(comId)) {
            throw new IllegalArgumentException("접근 권한이 없습니다.");
        }

        applicant.setApctStatus(newStatus);
    }

    private ApplicantResponse mapToResponse(Applicant applicant) {
        return new ApplicantResponse(
                applicant,
                applicant.getRecruit().getRecTitle(),
                applicant.getResumes().size(),
                null
        );
    }
    
    // 지원 수정
    @Transactional
    public void update(Long apctId, ApplicantRequest req, Authentication authentication) {
        ApplicantPrincipal principal = (ApplicantPrincipal) authentication.getPrincipal();
        Applicant entity = applicantRepository.findById(apctId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지원입니다."));

        if (!entity.getProvider().equals(principal.getProvider())
                || !entity.getProviderId().equals(principal.getProviderId())) {
            throw new IllegalArgumentException("본인 지원 내역만 수정할 수 있습니다.");
        }
        if (!"RECEIVED".equals(entity.getApctStatus())) {
            throw new IllegalStateException("이미 검토가 시작된 지원 건은 수정할 수 없습니다.");
        }

        entity.setApctName(req.getApctName());
        entity.setApctEmail(req.getApctEmail());
        entity.setApctPhone(req.getApctPhone());
    }
    
    // 지원 취소 (본인만 가능)
    @Transactional
    public void cancel(Long apctId, Authentication authentication) {
        ApplicantPrincipal applicant = (ApplicantPrincipal) authentication.getPrincipal();

        Applicant entity = applicantRepository.findById(apctId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 지원입니다."));

        if (!entity.getProvider().equals(applicant.getProvider())
                || !entity.getProviderId().equals(applicant.getProviderId())) {
            throw new IllegalArgumentException("본인 지원 내역만 취소할 수 있습니다.");
        }
        
        if (!"RECEIVED".equals(entity.getApctStatus())) {
            throw new IllegalStateException("이미 검토가 시작된 지원은 취소할 수 없습니다. 담당자에게 문의해 주세요.");
        }

        applicantRepository.delete(entity);
    }
    
    // 칸반보드용
    public List<ApplicantResponse> getKanbanList(Long comId, Long recId) {
        Specification<Applicant> spec = ApplicantSpecs.search(comId, recId, null); // apctStatus는 null → 전체
        return applicantRepository.findAll(spec).stream()
                .map(this::mapToResponse)
                .toList();
    }
}