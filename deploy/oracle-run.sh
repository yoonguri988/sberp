#!/bin/bash
# Oracle만 Docker 컨테이너로 띄운다 (Ubuntu에 Oracle을 네이티브로 까는 게 훨씬 번거로워서
# 이거 하나만 예외로 둔다 - back/analytics/front는 전부 직접 설치해서 그냥 실행한다).
# 최초 1회만 실행하면 되고, --restart unless-stopped 덕분에 EC2가 재부팅돼도 자동으로 다시 뜬다.
set -e
docker volume create oracle-data >/dev/null

docker run -d \
  --name sberp-oracle \
  --restart unless-stopped \
  -p 1521:1521 \
  -e ORACLE_PASSWORD="${ORACLE_SYS_PASSWORD:?ORACLE_SYS_PASSWORD 환경변수를 설정하세요}" \
  -e APP_USER="${DB_USERNAME:?DB_USERNAME 환경변수를 설정하세요}" \
  -e APP_USER_PASSWORD="${DB_PASSWORD:?DB_PASSWORD 환경변수를 설정하세요}" \
  -v oracle-data:/opt/oracle/oradata \
  -v "$(cd "$(dirname "$0")/../db-init" && pwd)":/container-entrypoint-initdb.d \
  gvenzl/oracle-xe:21-slim

echo "기동 확인: docker logs -f sberp-oracle  (DATABASE IS READY TO USE! 나올 때까지 대기, 최초는 몇 분 걸림)"
