package com.sb.erp.auth.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.sb.erp.global.oauth2.CustomUserPrincipal;
import com.sb.erp.resv.dto.response.ResvResponse;

@Component
public class AuthUserJwtService {
	private static final String ROOT_ROLE = "ROOT";
	
    public Long getCurrentEmpId(Authentication authentication) {
    	CustomUserPrincipal userPrincipal = (CustomUserPrincipal) authentication.getPrincipal();
        return userPrincipal.getEmpId();
    }
    
    public Long getCurrentComId(Authentication authentication) {
    	CustomUserPrincipal userPrincipal = (CustomUserPrincipal) authentication.getPrincipal();
    	return userPrincipal.getComId();
    }
 
    public String getCurrentEmpEmail(Authentication authentication) {
    	CustomUserPrincipal userPrincipal = (CustomUserPrincipal) authentication.getPrincipal();
        return userPrincipal.getUsername();
    }
    
    // 대표 권한 1개만 필요할 때 (여러 개 중 첫 번째)
    public String getCurrentRole(Authentication authentication) {
    	CustomUserPrincipal userPrincipal = (CustomUserPrincipal) authentication.getPrincipal();
    	return userPrincipal.getRole();
    }
 
    // 사원이 가진 모든 권한
    public List<String> getCurrentRoles(Authentication authentication) {
    	CustomUserPrincipal userPrincipal = (CustomUserPrincipal) authentication.getPrincipal();
    	return userPrincipal.getRoles();
    }
    
    // ROOT 여부 판단 - ROOT는 전체 회사를 관리하는 슈퍼 권한이므로 소속회사 검증을 건너뛸 때 사용
    public boolean isRoot(Authentication authentication) {
        return getCurrentRoles(authentication).contains(ROOT_ROLE);
    }
 
    /**
     * 로그인 사용자가 targetComId 회사에 접근 가능한지(=접근 금지가 아닌지) 판단.
     * - ROOT: 모든 회사 접근 가능 → 항상 허용
     * - 그 외(ADMIN, MEMBER 등): 본인 소속 회사(comId)와 targetComId가 일치할 때만 허용
     *
     * @return true = 접근 금지(다른 회사), false = 접근 허용
     */
    public boolean isForbiddenCompanyAccess(Authentication authentication, Long targetComId) {
        if (isRoot(authentication)) {
            return false;
        }
        Long myComId = getCurrentComId(authentication);
        return myComId == null || !myComId.equals(targetComId);
    }
    
    /**
     * 로그인 사용자가 이 예약에 접근(조회/수정/취소)할 수 있는지 판단.
     * - 본인 예약이면 항상 허용
     * - 본인 예약이 아니면 isForbiddenCompanyAccess 로 관리자/ROOT + 같은 회사 소속 여부 확인
     *
     * @return true = 접근 금지, false = 접근 허용
     */
    public boolean isForbiddenReservationAccess(Authentication authentication, ResvResponse existing) {
        Long myEmpId = getCurrentEmpId(authentication);
        boolean isOwner = existing.getEmpId().equals(myEmpId);
        if (isOwner) {
            return false;
        }
        return isForbiddenCompanyAccess(authentication, existing.getComId());
    }
}
