package com.sb.erp.global.security;

/**
 * 컨트롤러가 {@code com.sb.erp.auth.service.AuthUserJwtService}로 JWT에서 꺼낸
 * 로그인 사용자 정보(empId/comId/ROOT 여부)를 서비스 계층에 전달하기 위한 값 객체.
 *
 * 급여 모듈의 Service는 Spring Security(Authentication)에 직접 의존하지 않고
 * 이 객체만 받아서 처리한다(EmpServiceImpl과 동일한 설계 원칙: "Controller가 꺼내서 파라미터로 전달").
 */
public record ActorContext(Long empId, Long comId, boolean root) {

    /**
     * targetComId 소속 데이터에 접근 가능한지 여부.
     * ROOT는 모든 회사에 접근 가능하고, 그 외(ADMIN 등)는 본인 소속 회사와 일치해야 한다.
     */
    public boolean canAccessCompany(Long targetComId) {
        return root || (comId != null && comId.equals(targetComId));
    }
}
