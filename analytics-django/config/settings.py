"""
분석 대시보드용 Django 프로젝트 설정.

이 서비스는 기존 Spring Boot(back) 서버를 대체하지 않는다. Spring이 쓰기(등록/수정/삭제)를
전담하고, 이 서비스는 같은 Oracle DB를 "읽기 전용"으로 붙어 집계·통계 API만 제공한다.
로그인도 여기서 하지 않는다 — Spring이 발급한 JWT를 같은 시크릿으로 검증만 한다
(salary/authentication.py 참고).
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "change-me-dev-only")
DEBUG = os.getenv("DJANGO_DEBUG", "true").lower() == "true"

ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",")

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "rest_framework",
    "corsheaders",
    "salary",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# ── DB: Spring(back)의 application.yml datasource와 같은 Oracle을 바라본다. ──
# jdbc:oracle:thin:@localhost:1521/XEPDB1  ==  HOST:PORT/SERVICE_NAME
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.oracle",
        "NAME": f'{os.getenv("ORACLE_HOST", "localhost")}:{os.getenv("ORACLE_PORT", "1521")}/{os.getenv("ORACLE_SERVICE", "XEPDB1")}',
        "USER": os.getenv("DB_USERNAME"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
    }
}

# 이 서비스는 스키마를 만들거나 바꾸지 않는다 (모든 모델이 managed=False).
# 그래도 Django 내부 컴포넌트(auth/contenttypes)가 최소한의 자기 테이블을 요구할 수 있어
# migrate 자체를 막지는 않되, salary 앱은 애초에 migration 파일을 두지 않는다.

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "salary.authentication.SpringJwtAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
}

# ── Spring과 동일한 시크릿으로 JWT를 검증한다 (서명 발급은 Spring만 한다). ──
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ISSUER = os.getenv("JWT_ISSUER", "spring-breeze")

CORS_ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("FRONT_ORIGINS", "http://localhost:3000").split(",") if o.strip()
]
# 프론트의 공용 axios 인스턴스가 withCredentials: true 로 되어 있어 맞춰준다
# (이 서비스 자체는 쿠키를 쓰지 않고 Authorization 헤더만 본다).
CORS_ALLOW_CREDENTIALS = True

TIME_ZONE = "Asia/Seoul"
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
