#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "-> git pull"
git pull

echo "-> back 빌드"
(cd back && ./gradlew bootJar -x test --no-daemon)

echo "-> analytics-django 의존성 갱신"
(cd analytics-django && source .venv/bin/activate && pip install -r requirements.txt -q)

echo "-> front 빌드"
(cd front && npm install && npm run build)

echo "-> 서비스 재시작"
sudo systemctl restart sberp-back sberp-analytics sberp-front

echo "완료. 상태 확인: sudo systemctl status sberp-back sberp-analytics sberp-front"
