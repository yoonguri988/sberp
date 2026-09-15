"""
Spring(back)이 발급한 JWT를 "같은 시크릿"으로 검증만 하는 DRF 인증 클래스.

이 서비스는 로그인을 하지 않는다 — /auth/login은 여전히 Spring 담당이고,
프론트는 그 로그인으로 받은 accessToken을 그대로 이 서비스에도 Bearer로 실어 보낸다.
back의 JwtProvider(HS256, issuer="spring-breeze")와 짝을 맞춘 것이므로,
back의 jwt.secret / jwt.issuer 설정이 바뀌면 이 서비스의 JWT_SECRET / JWT_ISSUER도
반드시 같이 바꿔야 한다.

back의 JwtAuthenticationFilter와 동일하게 처리한다:
  - subject = empId
  - claims: comId, empEmail, roles(list), pwdChangeRequired
  - type == "APPLICANT" 인 토큰(채용 지원자용)은 이 서비스 대상이 아니므로 거부
  - pwdChangeRequired가 true면 막는다(첫 로그인 강제 비밀번호 변경 미이행 상태)
"""

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class EmployeePrincipal:
    """SecurityContextHolder의 CustomUserPrincipal에 대응하는 최소 정보만 담은 객체."""

    def __init__(self, emp_id, com_id, emp_email, roles, pwd_change_required):
        self.emp_id = emp_id
        self.com_id = com_id
        self.emp_email = emp_email
        self.roles = roles or []
        self.pwd_change_required = pwd_change_required
        self.is_authenticated = True  # DRF/Django가 기대하는 속성

    def __str__(self):
        return f"emp:{self.emp_id}"


class SpringJwtAuthentication(BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        header = request.headers.get("Authorization", "")
        if not header.startswith(f"{self.keyword} "):
            return None  # 다른 인증 클래스가 없으므로 곧 401 (AnonymousUser 취급)

        token = header[len(self.keyword) + 1 :]

        if not settings.JWT_SECRET:
            # 운영 실수 방지: 시크릿을 안 넣고 띄우면 모든 토큰이 통과하는 게 아니라
            # 명확하게 500으로 터지게 한다.
            raise AuthenticationFailed("JWT_SECRET이 설정되지 않았습니다 (.env 확인)")

        try:
            payload = jwt.decode(
                token,
                key=settings.JWT_SECRET,
                algorithms=["HS256"],
                issuer=settings.JWT_ISSUER,
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("accessToken이 만료되었습니다")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("유효하지 않은 토큰입니다")

        if payload.get("type") == "APPLICANT":
            raise AuthenticationFailed("사원 전용 API입니다")

        if payload.get("pwdChangeRequired"):
            raise AuthenticationFailed("비밀번호를 변경해야 이용할 수 있습니다")

        try:
            emp_id = int(payload["sub"])
        except (KeyError, ValueError, TypeError):
            raise AuthenticationFailed("토큰에 사원 정보가 없습니다")

        principal = EmployeePrincipal(
            emp_id=emp_id,
            com_id=payload.get("comId"),
            emp_email=payload.get("empEmail"),
            roles=payload.get("roles") or [],
            pwd_change_required=bool(payload.get("pwdChangeRequired")),
        )
        return (principal, token)
