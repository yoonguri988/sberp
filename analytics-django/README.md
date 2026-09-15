# 급여 분석 서비스 (Django)

기존 Spring Boot(`back`) 서버를 대체하지 않는다. Spring이 쓰기(등록/수정/삭제)를 전담하고,
이 서비스는 같은 Oracle DB에 **읽기 전용**으로 붙어 급여 집계 API 1개(`/api/analytics/salary/summary`)만
제공한다. 로그인도 여기서 하지 않는다 — Spring이 발급한 JWT를 같은 시크릿으로 검증만 한다.

집계 방식: DB에는 원본 행(row)만 요청하고, 부서별 평균·월별 합계 같은 집계는 **pandas**
DataFrame(`groupby`/`agg`)에서 수행한다(`salary/views.py`). Django ORM의 `annotate`/`aggregate`로도
같은 결과를 낼 수 있지만, 이 서비스는 pandas로 집계하는 걸 의도적으로 선택했다 — 이 API를 만든
이유 중 하나가 pandas 활용이었기 때문.

담당 4개 도메인(회사·부서/인증·보안/자원·예약/급여) 중 **급여**부터 붙였다. 자원·예약의 노쇼 위험도는
아직 쌓인 데이터가 적어 이번 1차 구현에서는 뺐다 — 설계는 프로젝트 문서
`claude/analytics-dashboard-design.md`에 그대로 남아 있으니, 데이터가 쌓이면 같은 패턴으로
`resv` 앱만 추가하면 된다.

## 실행 방법

```bash
cd analytics-django
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# .env를 열어서 아래 값을 채운다
#   JWT_SECRET      -> back의 .env / application.yml의 JWT_SECRET과 반드시 동일한 값
#   DB_USERNAME / DB_PASSWORD -> Oracle 계정 (읽기 전용 계정 권장)
#   ORACLE_HOST/PORT/SERVICE  -> back의 datasource url(jdbc:oracle:thin:@localhost:1521/XEPDB1)과 매칭

python manage.py check              # DB 연결 없이 설정/모델 로딩만 검증
python manage.py runserver 0.0.0.0:8000
```

정상이면 `http://localhost:8000/health` 가 `{"status":"ok"}`를 반환한다.

### 확인 사항 (이 세션에서는 네트워크 제약으로 직접 못 돌려봄)

- `pip install`, 실제 Oracle 접속, `python manage.py runserver` 구동 자체는 이 세션 샌드박스에서
  PyPI/Oracle 접근이 막혀 있어 끝까지 실행해보지 못했다. 대신 모든 `.py` 파일을 `py_compile`로
  문법 검증했다 — 로컬/개발 서버에서 위 순서대로 최종 실행 확인을 권장한다.
- Django 5.x + `python-oracledb`(thin mode) 조합을 기본으로 잡았다. 만약 사용 환경의 Django
  버전에서 `python-oracledb`를 오라클 백엔드로 못 알아보면 `requirements.txt`의 그 줄만
  `cx_Oracle`로 바꾸면 된다(`settings.py`의 `ENGINE`은 그대로 `django.db.backends.oracle`).
- 부서별 평균급여 집계에서 `DEPARTMENT.IS_DELETED = 0`(삭제 안 된 부서)만 포함하도록 걸어뒀다 —
  `company-delete-fk-guard-fix.md` / `dashboard-i18n-dept-perm-att-fix-changelog.md`에서 다룬
  기존 삭제 플래그 규칙과 맞춘 것.

## 프론트 연동

- `NEXT_PUBLIC_ANALYTICS_API_BASE_URL` 환경변수로 이 서비스 주소를 알려준다
  (Next.js `.env.local`에 추가, 기본값은 `http://localhost:8000`).
- 화면: `/sal/analytics` (사이드바 "급여관리" 섹션 맨 아래, ROLE_ADMIN/ROOT 전용).
- 인증: 프론트가 로그인 시 받은 Spring accessToken을 그대로 이 서비스에도 Bearer로 보낸다.
  Django 쪽에서 별도 로그인/토큰 발급이 필요 없다.

## API

`GET /api/analytics/salary/summary?months=6` (Bearer 필요, ROLE_ADMIN/ROOT만 허용)

```json
{
  "latestMonth": "2026-08-01",
  "deptAverage": [
    { "deptId": 3, "deptName": "보안관제팀", "empCount": 7, "avgBaseSal": 3200000, "avgNetPay": 2870000 }
  ],
  "monthlyTrend": [
    { "payMonth": "2026-03-01", "totalBaseSal": 0, "totalAllow": 0, "totalDedt": 0, "totalNetPay": 0, "payCount": 0 }
  ],
  "itemBreakdown": [
    { "itemCode": "NATIONAL_PENSION", "itemLabel": "국민연금", "totalAmt": 0 }
  ],
  "statusDistribution": [
    { "status": "PAID", "statusLabel": "지급완료", "count": 0 }
  ]
}
```
