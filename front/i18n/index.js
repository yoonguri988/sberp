// i18n/index.js
// react-i18next 기반 다국어(KR/EN) 초기화 모듈.
//
// 이 프로젝트는 next-i18next(서버사이드 라우팅 기반 i18n)를 사용하지 않고,
// 클라이언트에서 언어를 전환하는 방식을 채택합니다. 이유:
//  - pages 전반이 getServerSideProps/getStaticProps 없이 클라이언트에서
//    redux-saga로 데이터를 불러오는 구조라 SSR 시점에 사용자별 언어를
//    안전하게 주입하기 까다롭습니다(전역 i18next 인스턴스를 요청마다
//    바꾸면 동시 요청 간 언어가 섞일 위험이 있습니다).
//  - 그래서 SSR/최초 하이드레이션은 항상 기본 언어(ko)로 고정해 서버와
//    클라이언트의 최초 렌더링 결과를 일치시키고(하이드레이션 불일치 방지),
//    마운트 이후에 쿠키에 저장된 사용자의 언어 설정을 적용합니다.
//    (_app.js 참고)
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import commonKo from "./locales/ko/common.json";
import headerKo from "./locales/ko/header.json";
import sidebarKo from "./locales/ko/sidebar.json";
import footerKo from "./locales/ko/footer.json";
import authKo from "./locales/ko/auth.json";
import comKo from "./locales/ko/com.json";
import dashboardKo from "./locales/ko/dashboard.json";
import deptKo from "./locales/ko/dept.json";
import resvKo from "./locales/ko/resv.json";
import resKo from "./locales/ko/res.json";
import loginHistoryKo from "./locales/ko/loginHistory.json";
import noticeKo from "./locales/ko/notice.json";
import projKo from "./locales/ko/proj.json";
import empKo from "./locales/ko/emp.json";
import posKo from "./locales/ko/pos.json";
import permKo from "./locales/ko/perm.json";
import evalKo from "./locales/ko/eval.json";
import apprKo from "./locales/ko/appr.json";
import attKo from "./locales/ko/att.json";
import careersKo from "./locales/ko/careers.json";
import salKo from "./locales/ko/sal.json";
import recKo from "./locales/ko/rec.json";
import apctKo from "./locales/ko/apct.json";

import commonEn from "./locales/en/common.json";
import headerEn from "./locales/en/header.json";
import sidebarEn from "./locales/en/sidebar.json";
import footerEn from "./locales/en/footer.json";
import authEn from "./locales/en/auth.json";
import comEn from "./locales/en/com.json";
import dashboardEn from "./locales/en/dashboard.json";
import deptEn from "./locales/en/dept.json";
import resvEn from "./locales/en/resv.json";
import resEn from "./locales/en/res.json";
import loginHistoryEn from "./locales/en/loginHistory.json";
import noticeEn from "./locales/en/notice.json";
import projEn from "./locales/en/proj.json";
import empEn from "./locales/en/emp.json";
import posEn from "./locales/en/pos.json";
import permEn from "./locales/en/perm.json";
import evalEn from "./locales/en/eval.json";
import apprEn from "./locales/en/appr.json";
import attEn from "./locales/en/att.json";
import careersEn from "./locales/en/careers.json";
import salEn from "./locales/en/sal.json";
import recEn from "./locales/en/rec.json";
import apctEn from "./locales/en/apct.json";


export const SUPPORTED_LANGUAGES = ["ko", "en"];
export const DEFAULT_LANGUAGE = "ko";
// 사용자가 선택한 언어를 저장하는 쿠키 키 (js-cookie로 read/write)
export const LANGUAGE_COOKIE_KEY = "sberp_lang";

const resources = {
  ko: {
    common: commonKo,
    header: headerKo,
    sidebar: sidebarKo,
    footer: footerKo,
    auth: authKo,
    com: comKo,
    dashboard: dashboardKo,
    dept: deptKo,
    resv: resvKo,
    res: resKo,
    loginHistory: loginHistoryKo,
    notice: noticeKo,
    proj: projKo,
    emp: empKo,
    pos: posKo,
    perm: permKo,
    eval: evalKo,
    appr: apprKo,
    att: attKo,
    careers: careersKo,
    sal: salKo,
    rec: recKo,
    apct: apctKo,
  },
  en: {
    common: commonEn,
    header: headerEn,
    sidebar: sidebarEn,
    footer: footerEn,
    auth: authEn,
    com: comEn,
    dashboard: dashboardEn,
    dept: deptEn,
    resv: resvEn,
    res: resEn,
    loginHistory: loginHistoryEn,
    notice: noticeEn,
    proj: projEn,
    emp: empEn,
    pos: posEn,
    perm: permEn,
    eval: evalEn,
    appr: apprEn,
    att: attEn,
    careers: careersEn,
    sal: salEn,
    rec: recEn,
    apct: apctEn,
  },
};

if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE, // 서버/클라이언트 최초 렌더링을 일치시키기 위해 고정
    fallbackLng: DEFAULT_LANGUAGE,
    defaultNS: "common",
    ns: Object.keys(resources[DEFAULT_LANGUAGE]),
    interpolation: { escapeValue: false }, // React가 이미 XSS 이스케이프 처리
    react: { useSuspense: false },
    returnEmptyString: false,
  });
}

export default i18next;
