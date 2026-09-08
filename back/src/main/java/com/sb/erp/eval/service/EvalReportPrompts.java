package com.sb.erp.eval.service;

/*
EvalReport용 GPT 프롬프트 템플릿 모음.

1. 왜 별도 클래스로?
- 프롬프트가 길고 여러 줄 → 서비스 코드에 박으면 가독성 저하
- 프롬프트 튜닝은 자주 발생 → 한 곳만 수정하도록 격리
- 나중에 DB나 파일로 옮길 여지가 생기면 이 클래스만 교체
*/

public class EvalReportPrompts {

    private EvalReportPrompts() {}   // 유틸 클래스 - 인스턴스화 방지

    // ─── System 프롬프트 (역할/규칙) ─────────────

    public static final String SYSTEM_INSTRUCTION = """
        당신은 15년 경력의 인사평가 전문가입니다.

        부서장이 부서원에 대해 작성한 평가 코멘트를 읽고,
        해당 기간의 근태 현황을 함께 분석하여 아래 두 가지를 생성합니다:
        1. 사원 본인이 읽을 종합 요약문 (300~400자, 격려 톤 유지, 개선점은 건설적으로)
    		- 근태가 우수하면(지각/결근 0, 출근율 95%+) 성실성과 책임감을 언급
    		- 지각, 조퇴, 결근이 잦으면 시간 관리 개선의 필요성을 건설적으로 제시
    		- 연장 근로가 많은 경우 업무 헌신을 인정하되 워라밸 주의를 권고
        2. 감성 분석 (positive, neutral, negative 비율, 합계 정확히 100.0)
    		- 근태 현황도 감성 비율에 반영할 것(예: 잦은 지각은 negative의 비율이 소폭 증가)

        답변은 반드시 아래 JSON 형식으로만 출력하세요.
        다른 설명이나 인사말은 절대 붙이지 마세요.

        {
          "summary": "요약문 텍스트",
          "sentimentPositive": 70.0,
          "sentimentNeutral": 20.0,
          "sentimentNegative": 10.0
        }
        """;


    // ─── User 프롬프트 템플릿 (사원마다 값이 바뀜) ─────────

    /*
     ### User 프롬프트 조립.
     @param empName 사원 이름
     @param posName 직급
     @param deptName 부서
     @param strengthComments 강점 코멘트 concat 문자열 (LISTAGG 결과)
     @param improvementComments 개선 코멘트 concat 문자열
     @return GPT에 보낼 user 메시지 내용
     */
    public static String buildUserPrompt(
            String empName,
            String posName,
            String deptName,
            String strengthComments,
            String improvementComments,
            Integer workDays,
            Integer lateCount,
            Integer earlyLeaveCount,
            Integer absentCount,
            String annualUsed,
            String attRate,
            Integer totalWorkMin,
            Integer overtimeMin) {

    	return """
    		    [사원 정보]
    		    이름: %s
    		    직급: %s
    		    부서: %s

    		    [근태 현황]
    		    출근일: %d일 | 지각: %d회 | 조퇴: %d회 | 결근: %d회
    		    연차 사용: %s일 | 출근율: %s%%
    		    총 근로시간: %,d분 (약 %d시간) | 연장근로: %,d분 (약 %d시간)

    		    [강점 코멘트]
    		    %s

    		    [개선 코멘트]
    		    %s
    		    """.formatted(
    		        nullSafe(empName),
    		        nullSafe(posName),
    		        nullSafe(deptName),
    		        safe(workDays),
    		        safe(lateCount),
    		        safe(earlyLeaveCount),
    		        safe(absentCount),
    		        nullSafe(annualUsed, "0"),
    		        nullSafe(attRate, "0"),
    		        safe(totalWorkMin), safe(totalWorkMin) / 60,
    		        safe(overtimeMin), safe(overtimeMin) / 60,
    		        nullSafe(strengthComments, "(수집된 강점 코멘트 없음)"),
    		        nullSafe(improvementComments, "(수집된 개선 코멘트 없음)")
    		    );
    }


    // ─── util ──────────────

    private static String nullSafe(String s) {
        return (s == null || s.isBlank()) ? "정보 없음" : s;
    }

    private static String nullSafe(String s, String defaultValue) {
        return (s == null || s.isBlank()) ? defaultValue : s;
    }
    
    private static int safe(Integer v) {
        return v == null ? 0 : v;
    }
}