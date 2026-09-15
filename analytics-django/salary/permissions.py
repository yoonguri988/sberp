from rest_framework.permissions import BasePermission

# 프론트 Sidebar.js에서 급여 관리 메뉴들에 걸어둔 role 제한과 동일한 기준
# (role: "ROLE_ADMIN" 또는 ["ROOT", "ROLE_ADMIN"]) — 급여 분석도 관리자만 본다.
SALARY_ADMIN_ROLES = {"ROLE_ADMIN", "ROOT"}


class IsSalaryAdmin(BasePermission):
    message = "급여 분석은 관리자만 조회할 수 있습니다."

    def has_permission(self, request, view):
        user = request.user
        roles = set(getattr(user, "roles", []) or [])
        return bool(roles & SALARY_ADMIN_ROLES)
