// components/Sidebar.js
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const NAV = [
  {
    sectionKey: null,
    items: [
      {
        page: "dashboard",
        href: "/",
        icon: "bi-grid-1x2-fill",
      },
    ],
  },
  {
    sectionKey: "salary",
    items: [
      {
        page: "salmy",
        href: "/sal/my",
        icon: "bi-wallet2",
      },
      {
        page: "salstdlist",
        href: "/sal/std",
        icon: "bi-card-checklist",
        role: "ROLE_ADMIN",
      },
      {
        page: "salpaylist",
        href: "/sal/pay",
        icon: "bi-cash-coin",
        role: "ROLE_ADMIN",
      },
      {
        page: "salacctadmin",
        href: "/sal/acct-admin",
        icon: "bi-bank",
        role: "ROLE_ADMIN",
      },
      {
        page: "salhistlist",
        href: "/sal/hist",
        icon: "bi-clock-history",
        role: "ROLE_ADMIN",
      },
      {
        page: "salpolicylist",
        href: "/sal/policy",
        icon: "bi-sliders2",
        // 4대보험요율/소득세구간표 등록은 ROOT 전용이라, ROLE_ADMIN만 걸어두면
        // ROOT 단독 계정은 이 메뉴 자체를 볼 수 없어 등록 화면에 진입할 방법이 없다.
        role: ["ROOT", "ROLE_ADMIN"],
      },
      {
        page: "salaidocadmin",
        href: "/sal/aidoc-admin",
        icon: "bi-file-earmark-pdf",
        role: "ROLE_ADMIN",
      },
    ],
  },
  {
    sectionKey: "org",
    items: [
      {
        page: "comlist",
        href: "/com/list",
        icon: "bi-building-fill-gear",
        role: "ROOT",
      },
      {
        page: "commypage",
        href: "/com/my",
        icon: "bi-building",
      },
      {
        page: "deptlist",
        href: "/dept/list",
        icon: "bi-diagram-3",
      },
      {
        page: "deptmy",
        href: "/dept/my",
        icon: "bi-tag",
      },
      {
        page: "deptpending",
        href: "/dept/transfer/pending",
        icon: "bi-signpost-split",
        role: "ROLE_ADMIN",
      },
      {
        page: "depttranslog",
        href: "/dept/transfer/log",
        icon: "bi-clock-history",
        role: "ROLE_ADMIN",
      },
    ],
  },
  {
    sectionKey: "hr",
    items: [
      {
        page: "employees",
        href: "/emp/list",
        icon: "bi-people",
      },
      {
        page: "position",
        href: "/pos/list",
        icon: "bi-briefcase",
        role: "ROLE_ADMIN",
      },
      {
        page: "permissions",
        href: "/perm/list",
        icon: "bi-shield-lock",
        role: "ROLE_ADMIN",
      },
      {
        page: "evalperiodlist",
        href: "/eval/period/list",
        icon: "bi-calendar-event",
        role: "ROLE_ADMIN",
      },
      {
        page: "evaldashboard",
        href: "/eval/dashboard",
        icon: "bi-star",
        role: "ROLE_ADMIN",
      },
      {
        page: "evalreport",
        href: "/eval/report/my",
        icon: "bi-file-earmark-bar-graph",
      },
      {
        page: "hraidocadmin",
        href: "/emp/aidoc-admin",
        icon: "bi-file-earmark-pdf",
        role: "ROLE_ADMIN",
      },
    ],
  },
  {
    sectionKey: "att",
    items: [
      {
        page: "attdashboard",
        href: "/att/dashboard",
        icon: "bi-clock",
      },
      {
        page: "attmy",
        href: "/att/my",
        icon: "bi-person-lines-fill",
      },
      {
        page: "attadmin",
        href: "/att/admin",
        icon: "bi-calendar2-week",
        role: "ROLE_ADMIN",
      },
      {
        page: "leavemy",
        href: "/att/leave/my",
        icon: "bi-calendar-check",
      },
      {
        page: "leaveadmin",
        href: "/att/leave/admin",
        icon: "bi-calendar2-plus",
        role: "ROLE_ADMIN",
      },
    ],
  },
  {
    sectionKey: "work",
    items: [
      {
        page: "apprlistform",
        href: "/appr/forms",
        icon: "bi-sliders",
        role: "ROLE_ADMIN",
      },
      {
        page: "apprlistdoc",
        href: "/appr/docs",
        icon: "bi-pencil-square",
      },
      {
        page: "apprDelegadmin",
        href: "/appr/admin/delegations",
        icon: "bi-arrow-left-right",
        role: "ROLE_ADMIN",
      },
      {
        page: "projects",
        href: "/proj/proj_list",
        icon: "bi-kanban",
      },
      {
        page: "tasks",
        href: "/proj/task_list",
        icon: "bi-clipboard-check",
      },
      {
        page: "notices",
        href: "/notice/list",
        icon: "bi-megaphone",
      },
    ],
  },
  {
    sectionKey: "asset",
    items: [
      {
        page: "reslist",
        href: "/res/list?keyword=&resType=&resStatus=AVAILABLE",
        icon: "bi-collection",
      },
      {
        page: "resvmy",
        href: "/resv/my",
        icon: "bi-calendar2-check",
      },
      {
        page: "adminresvlist",
        href: "/admin/resv/list?status=WAI",
        icon: "bi-calendar2-event",
        role: "ROLE_ADMIN",
      },
    ],
  },
  {
    sectionKey: "recruit",
    items: [
      {
        page: "reclist",
        href: "/rec/list",
        icon: "bi-person-badge",
        role: "ROLE_ADMIN",
      },
      {
        page: "apctlist",
        href: "/apct/list",
        icon: "bi-people-fill",
        role: "ROLE_ADMIN",
      },
      {
        page: "resumesearch",
        href: "/apct/resume-search",
        icon: "bi-robot",
        role: "ROLE_ADMIN",
      },
    ],
  },
  {
    sectionKey: "security",
    items: [
      {
        page: "loginHistory",
        href: "/admin/security/loginHistory",
        icon: "bi-shield-exclamation",
        role: "ROOT",
      },
    ],
  },
];

// 백엔드 roles는 AuthResponse.autName 목록(예: "ROOT", "ROLE_ADMIN") 기준.
// 실제 사용 중인 role 문자열에 맞게 조정하세요.
function hasRole(user, role) {
  return Boolean(user?.roles?.includes(role));
}

// role은 문자열(단일 권한) 또는 배열(OR 조건, 백엔드 hasAnyAuthority에 대응)을 받는다.
// 예: 급여정책 화면은 백엔드가 조회를 hasAnyAuthority('ROOT','ROLE_ADMIN')로 열어두므로
// 메뉴 노출도 role: ["ROOT", "ROLE_ADMIN"]처럼 배열로 지정해야 ROOT 단독 계정도
// 진입 메뉴를 볼 수 있다. 단일 role만 넣으면 그 권한을 정확히 가진 계정만 통과한다.
function canShow(role, user) {
  if (!role) return true;
  const roles = Array.isArray(role) ? role : [role];
  return roles.some((r) => hasRole(user, r));
}

export default function Sidebar() {
  const router = useRouter();
  const { t } = useTranslation("sidebar");
  const { user, accessToken } = useSelector((state) => state.auth);

  const currentPath = router.pathname;
  const isAuthenticated = Boolean(user);

  const isActive = (href) => {
    const path = href.split("?")[0];
    return path === "/" ? currentPath === "/" : currentPath.startsWith(path);
  };

  return (
    <>
      <div className="sb-brand">
        <div className="sb-brand__mark">S</div>
        <div className="sb-brand__name">
          SB<b>erp</b>
        </div>
      </div>

      <nav className="sb-nav" id="sbNav">
        {NAV.map((group, gi) => (
          <React.Fragment key={gi}>
            {group.sectionKey && (
              <div className="sb-nav__section">
                {group.sectionLabel || t(`sections.${group.sectionKey}`)}
              </div>
            )}
            {group.items
              .filter((it) => canShow(it.role, user))
              .map((it) => {
                const tip = it.label || t(`items.${it.page}.tip`);
                const label =
                  it.label ||
                  t(`items.${it.page}.label`, {
                    defaultValue: tip,
                  });

                return (
                  <Link key={it.page} href={it.href} passHref>
                    <a
                      className={
                        "sb-nav__item" + (isActive(it.href) ? " active" : "")
                      }
                      data-page={it.page}
                      data-tip={tip}
                    >
                      <i className={"bi " + it.icon} />
                      <span className="sb-nav__label">{label}</span>
                    </a>
                  </Link>
                );
              })}
          </React.Fragment>
        ))}
      </nav>

      {isAuthenticated && (
        <div className="sb-sidebar__foot">
          <Link href={`/emp/detail?empId=${user?.empId}`} passHref>
            <div className="sb-userchip">
              <div className="sb-avatar">{user?.empName?.[0]}</div>
              <div className="sb-userchip__meta">
                <b>{user?.empName}</b>
                <span>{user?.posName}</span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </>
  );
}