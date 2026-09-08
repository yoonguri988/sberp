package com.sb.erp.emp.service;

/**
 * 온보딩 이메일 템플릿.
 * 기존 EmailApi의 인라인 HTML 패턴을 유지하되, 종류가 늘어날 때 Service를 오염시키지 않도록 별도 유틸로 분리.
 * 차후 SMS, 프로젝트 결재 알림 등의 템플릿이 별도로 생긴다면
 * 서비스에 하위 폴더(Templates)를 만들어서 옮길 예정입니다.
 */

public class MailTemplates {

    private MailTemplates() {}

    // ─── 환영 메일 ───
    public static String welcomeSubject(String comName, String empName) {
        return String.format("[%s] %s님, 입사를 진심으로 환영합니다!", comName, empName);
    }

    public static String welcomeBody(String comName, String empName) {
        return wrap(comName + " 온보딩 안내",
              "<h2 style='color:#005bac;'>🎉 " + comName + "에 오신 것을 환영합니다!</h2>"
            + "<p><b>" + empName + "</b>님, 정식 사원 등록이 완료되었습니다.</p>"
            + "<p>아래 온보딩 가이드를 통해 사내 시스템 사용법과 초기 세팅 정보를 확인하세요.</p>"
            + "<div style='background:#f5f9ff;padding:15px;border-radius:6px;margin:20px 0;font-size:14px;'>"
            + "  💡 <b>첫 로그인 안내</b><br>"
            + "  - ID: 등록시 사용한 이메일<br>"
            + "  - 초기 비밀번호: 사번과 동일 (최초 로그인 시 비밀번호 변경 화면으로 자동 이동합니다)"
            + "</div>"
            + "<p>궁금한 점이 있으면 언제든 인사팀 또는 부서장에게 문의해주세요.</p>");
    }

    // ─── 3일 차 확인 메일 ───
    public static String followup3DaySubject(String comName, String empName) {
        return String.format("[%s] %s님, 입사 3일 차 안부 메일입니다", comName, empName);
    }

    public static String followup3DayBody(String comName, String empName) {
        return wrap(comName + " 3일 차 안내",
              "<h2 style='color:#005bac;'>🌱 " + empName + "님, 잘 지내고 계신가요?</h2>"
            + "<p>" + comName + "에 입사하신 지 벌써 <b>3일</b>이 지났습니다.</p>"
            + "<p>새로운 환경과 업무에 적응하시느라 분주한 시간을 보내셨을 텐데, 큰 어려움은 없으셨는지요?</p>"
            + "<div style='background:#f9f9f9;padding:15px;border-radius:6px;margin:20px 0;font-size:13px;'>"
            + "  💡 <b>초기 적응 꿀팁</b><br>"
            + "  - 사내 <b>공지사항</b> 탭에서 전사 주요 일정을 확인하세요.<br>"
            + "  - 회의실/장비가 필요하다면 <b>예약</b> 메뉴를 이용할 수 있습니다.<br>"
            + "  - 직급 · 부서 정보는 <b>내 프로필</b>에서 확인 가능합니다."
            + "</div>"
            + "<p>" + empName + "님이 잘 적응하실 수 있도록 모든 구성원이 응원하고 있습니다!</p>");
    }
    
    // ─── 비밀번호 재설정 안내 메일 ───
    public static String passwordResetSubject(String comName) {
        return String.format("[%s] 비밀번호 재설정 안내", comName);
    }

    public static String passwordResetBody(String comName, String empName, String resetLink) {
        String greetName = (empName != null && !empName.isBlank()) ? empName : "고객";
        return wrap(comName + " 비밀번호 재설정",
              "<h2 style='color:#005bac;'>🔐 비밀번호 재설정 요청</h2>"
            + "<p><b>" + greetName + "</b>님, 비밀번호 재설정이 요청되었습니다.</p>"
            + "<p>아래 버튼을 눌러 새 비밀번호를 설정해주세요. 본인이 요청하지 않았다면"
            + " 이 메일을 무시하셔도 됩니다.</p>"
            + "<div style='text-align:center;margin:28px 0;'>"
            + "  <a href='" + resetLink + "' "
            + "     style='display:inline-block;padding:12px 28px;background:#005bac;color:#fff;"
            + "     text-decoration:none;border-radius:6px;font-weight:bold;'>"
            + "     비밀번호 재설정하기</a>"
            + "</div>"
            + "<div style='background:#fff7e6;padding:15px;border-radius:6px;margin:20px 0;font-size:13px;'>"
            + "  ⏱ 이 링크는 <b>발급 후 10분간</b>만 유효합니다. 시간이 지났다면 다시 요청해주세요."
            + "</div>"
            + "<p style='font-size:12px;color:#999;'>버튼이 동작하지 않으면 아래 주소를 브라우저에 복사해 붙여넣어주세요.<br>"
            + resetLink + "</p>");
    }

    // ─── 공통 래퍼 ───

    private static String wrap(String title, String innerHtml) {
        return "<div style='max-width:600px;margin:auto;background:#fff;"
            + "border:1px solid #e0e0e0;border-radius:8px;padding:30px;"
            + "font-family:Segoe UI,sans-serif;color:#333;'>"
            + innerHtml
            + "<hr style='margin:40px 0;border:none;border-top:1px solid #eee;'>"
            + "<p style='font-size:11px;color:#999;text-align:center;'>"
            + "본 메일은 SBerp 시스템에서 자동 발송된 안내 메일입니다.<br>"
            + title
            + "</p>"
            + "</div>";
    }
}