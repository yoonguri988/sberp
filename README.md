# 🏢 SBerp v4 — AWS CI/CD & 급여 분석 서비스 (개인 프로젝트)

spring-breeze-erp **v3**(팀 프로젝트) 위에서 **개인적으로** 진행한 4차 확장입니다.<br/>
팀 산출물인 Spring Boot(`back`) · React/Next.js(`front`)는 그대로 두고, 두 가지를 혼자 새로 얹었습니다.

- **AWS 배포 자동화**: GitHub Actions → EC2로 `back` · `front` · 신규 분석 서비스를 한 번에 자동 배포하는 CI/CD 파이프라인 구축
- **급여 분석 서비스 신규 개발**: `Python + Django`(집계는 **pandas**가 담당)로 만든 읽기 전용 분석 API 1개 급여 대시보드를 추가

> 이 문서가 다루는 범위는 v4에서 **개인적으로 진행한 부분**(CI/CD, `analytics-django`)입니다. <br/>`back`/`front`의 도메인 기능 자체는 v3 README를 따릅니다.

![급여분석대쉬보드](https://github.com/yoonguri988/sberp/blob/8eb353fc536d585dcdd7867d6acd60062085b586/docs/sal_analytics.png)
---

## 1. 왜 이걸 만들었나

v3까지는 EC2에 SSH로 직접 접속해 JAR를 올리고 `nohup`/수동으로 재기동하는 방식이었습니다. 배포할 때마다 사람이 붙어야 했고, 프론트 빌드도 로컬에서 만들어 옮기는 식이었습니다.

또 하나, v3에서 급여 도메인을 맡으면서 "부서별 평균 급여, 월별 지급 추이 같은 걸 관리자가 화면에서 바로 보고 싶다"는 요구가 있었는데, <br/>이 집계를 굳이 Spring/JPA에 얹기보다 **Python·pandas를 실전에서 써보는 것 자체가 이번 확장의 목적**이었습니다. <br/>그래서 기존 Spring 서버를 건드리지 않고, 같은 DB를 읽기 전용으로 보는 별도 Django 서비스로 분리했습니다.

---

## 2. 핵심 키포인트

### ① AWS CI/CD 파이프라인 (GitHub Actions → EC2)

`main` 브랜치에 push되면 `backend` / `frontend` / `analytics` 3개 job이 병렬로 실행되어 EC2 한 대에 세 서비스를 모두 자동 배포합니다.

```
GitHub push(main)
   │
   ├─ backend  : gradle build(JDK17) → JAR 선별(fat jar) → SCP로 EC2 전송 → pm2 start (java -jar)
   ├─ frontend : npm run build → .next/public tar 압축 → SCP 전송 → EC2에서 압축 해제 → pm2 start (npm run start)
   └─ analytics: analytics-django 소스 tar 압축 → SCP 전송 → EC2에서 venv 생성·pip install → pm2 start (gunicorn)
```

- **비밀값 관리**: DB 계정, JWT_SECRET, OAuth 키, OpenAI 키 등 20개 이상의 값을 레포에 커밋하지 않고 전부 **GitHub Secrets**에 저장, 배포 스텝에서 `.env`/`.env.production` 파일로 즉석 생성 후 EC2로 전송
- **프로세스 관리**: 세 서비스 모두 EC2에서 `pm2`로 기동 — 재배포 시 `pm2 delete → pm2 start`로 무중단에 가깝게 교체, `pm2 save`로 재부팅 시에도 유지
- **fat JAR 선별**: `back/build/libs/*SNAPSHOT.jar` 중 `plain.jar`(의존성 미포함)를 제외하고 실행 가능한 JAR만 골라 배포하도록 스텝을 분리
- **의존 서비스 대기**: 백엔드 기동 전, EC2에 이미 떠 있는 Oracle(1521) · Redis(6379) 포트가 열릴 때까지 최대 5분(10초×30회) 재시도 후 진행
- **analytics job 격리**: `back`/`front`와 별도 job으로 분리해, 분석 서비스 배포가 실패해도 핵심 서비스(로그인·업무) 배포에는 영향이 없도록 구성

### ② Python + Django + pandas 급여 분석 서비스 (`analytics-django`)

기존 Spring 서버를 **대체하지 않는 것**을 설계 원칙으로 삼았습니다.

| 원&nbsp;칙 | 구&nbsp;현 |
|---|---|
| 쓰기는 Spring이 전담 | 이 서비스는 `SELECT`만 수행, INSERT/UPDATE/DELETE 없음 |
| 집계는 pandas로 | DB에는 원본 row만 요청하고, <br/>부서별 평균·월별 합계·항목별 구성비·상태 분포는 전부 `pandas.DataFrame.groupby().agg()`로 계산 |

DB 원본 행만 가져와서 애플리케이션 레이어(pandas)에서 집계하는 구조로 의도적으로 설계했습니다.

```
[ React/Next.js 프론트 ]
        │  Bearer accessToken (Spring이 발급한 걸 그대로 재사용)
        │
        ├──────────────► [ Spring Boot(back) ]  — 로그인/쓰기 전담, JWT 발급
        │
        └──────────────► [ Django(analytics-django) ] — 같은 토큰을 같은 시크릿으로 검증만, 읽기 전용
                                │
                                ▼ SELECT only
                         [ Oracle 18c (공용 DB) ] ◄── Spring(JPA)이 계속 쓰기 전담
                                │
                                ▼ pandas groupby/agg
                    부서별 평균 · 월별 추이 · 항목 구성비 · 상태 분포
```

---

## 3. 기술 스택

### 신규 도입 (v4에서 개인적으로 추가)

![AWS EC2](https://img.shields.io/badge/AWS%20EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=pm2&logoColor=white)
![Django](https://img.shields.io/badge/Django%205-092E20?style=for-the-badge&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-A30000?style=for-the-badge&logo=django&logoColor=white)
![pandas](https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![PyJWT](https://img.shields.io/badge/PyJWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![python-oracledb](https://img.shields.io/badge/python--oracledb-F80000?style=for-the-badge&logo=oracle&logoColor=white)
![Gunicorn](https://img.shields.io/badge/Gunicorn-499848?style=for-the-badge&logo=gunicorn&logoColor=white)

### 기존 유지 (v3 팀 산출물)

Spring Boot 4 · JPA · JWT · Redis · React 17 · Next.js 12 · Ant Design · Redux Toolkit/Saga · Oracle 18c — 상세는 [v3 README](https://github.com/yoonguri988/spring-breeze-erp/blob/45d42dcb806cd49737abd4653b22bea5280f96d7/spring-breeze-erp-v3/README.md) 참고

---

## 4. 급여 분석 API

`GET /api/analytics/salary/summary?months=6` — Bearer 토큰 필요, `ROLE_ADMIN`/`ROOT`만 허용

카드 4개(부서별 평균급여 / 월별 지급추이 / 수당·공제 항목 구성비 / 지급상태 분포)를 **엔드포인트 1개**로 한 번에 채웁니다. 프론트가 saga 호출 1번으로 로딩 상태를 단순하게 관리할 수 있도록 의도적으로 쪼개지 않았습니다.

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

**프론트 연동**: `/sal/analytics` 화면(사이드바 "급여관리" 최하단, 관리자 전용)에서 Chart.js(`react-chartjs-2`)로 막대·도넛 차트를 그립니다. axios 인스턴스는 그대로 쓰되 이 요청만 `baseURL`을 Django 주소(`NEXT_PUBLIC_ANALYTICS_API_BASE_URL`)로 덮어써서 호출하고, 401이 나면 기존처럼 Spring의 `/auth/refresh`로 토큰을 갱신한 뒤 같은 요청을 재시도합니다 — 토큰 재발급 로직은 하나만 유지됩니다.

---

## 6. 트러블슈팅 · 설계 결정

| 이슈 | 내용 |
|---|---|
| **JWT를 두 서버가 나눠 검증** | Django가 별도로 로그인을 만들면 인증 로직이 두 곳으로 갈라진다. Spring의 `JwtProvider`(HS256, issuer=`spring-breeze`)와 시크릿·issuer를 그대로 공유하고, Django는 서명 발급 없이 **검증 전용** 인증 클래스만 구현해 로그인 로직을 한 곳(Spring)으로 유지 |
| **Oracle 드라이버 호환성** | Django 5.x 공식 지원 `python-oracledb`(thin mode, Oracle Client 설치 불필요)를 기본값으로 채택. 버전 조합에 따라 인식이 안 되면 `requirements.txt` 한 줄만 `cx_Oracle`로 교체하면 되도록 `settings.py`의 `ENGINE`(`django.db.backends.oracle`)은 그대로 유지 |
| **삭제된 부서 데이터 혼입 방지** | 부서별 평균급여 집계에서 `DEPARTMENT.IS_DELETED = 0`(삭제 안 된 부서)만 포함하도록 필터링 — 기존 팀 프로젝트의 소프트 삭제 규칙과 동일하게 맞춤 |
| **배포 실패 격리** | `back`/`front`/`analytics`를 GitHub Actions job 3개로 분리해, 분석 서비스 배포가 실패해도 핵심 업무(로그인·급여·결재 등) 서비스 배포·기동에는 영향이 가지 않도록 구성 |
| **fat JAR vs plain JAR** | Gradle 빌드 산출물 중 의존성이 빠진 `plain.jar`가 함께 생성되어 배포 스텝에서 `grep -v plain`으로 실행 가능한 fat JAR만 선별하도록 명시적으로 분기 |

---

## 7. 향후 계획

- 담당 4개 도메인(회사·부서 / 인증·보안 / 자원·예약 / 급여) 중 **급여**부터 먼저 붙였습니다. 자원·예약의 "노쇼 위험도" 분석은 아직 쌓인 데이터가 적어 이번 1차 구현에서는 제외했고, 설계는 그대로 남아 있어 데이터가 쌓이면 같은 패턴(`managed=False` 모델 + pandas 집계)으로 `resv` 앱만 추가하면 됩니다.
- pm2 기반의 단일 EC2 배포는 다운타임 · SPOF 위험이 있어, 다음 단계로 로드밸런서 · 다중 인스턴스 · 무중단 배포(blue-green) 적용을 검토 중입니다.

---

## 📄 관련 문서
- [프로젝트 메인 README (v1~v3 전체 진화 과정)](https://github.com/yoonguri988/spring-breeze-erp/blob/45d42dcb806cd49737abd4653b22bea5280f96d7/README.md)
- [SBerp v3 README (팀 프로젝트, back/front 도메인 상세)](https://github.com/yoonguri988/spring-breeze-erp/blob/45d42dcb806cd49737abd4653b22bea5280f96d7/spring-breeze-erp-v3/README.md)

## 📄 라이선스

본 프로젝트는 spring-breeze 팀의 교육용 협업 프로젝트를 기반으로 한 개인 학습용 확장입니다.
