# 배포 방식 변경 — Docker는 Oracle 하나만

로컬(내 PC)에서는 Docker 없이 `python manage.py runserver`, `npm run dev`, IDE에서 Spring 실행,
이렇게 그냥 프로세스로 돌려서 잘 됐다. EC2에 올릴 때도 그 방식을 그대로 따른다.

**Docker는 Oracle DB 컨테이너 하나에만 쓴다.** 이유는 하나뿐이다 — Oracle은 우분투용 공식 apt
패키지가 없다(RPM만 배포, Oracle Linux/RHEL 전용). 우분투에 네이티브로 깔려면 비공식 방법을
써야 해서 오히려 더 복잡하고 불안정하다. 반면 `back`(Spring Boot jar), `analytics-django`
(Python venv + gunicorn), `front`(Next.js)는 전부 우분투에 그냥 설치가 되는 런타임이라 로컬과
동일하게 "설치 → 실행"으로 끝난다. Redis도 `apt install redis-server`로 네이티브 설치한다.

정리하면:

| 구성요소 | 로컬(지금)  | EC2(이 방식) |
|---|---|---|
| Oracle | 로컬 PC에 설치된 Oracle | **Docker 컨테이너 1개** (`oracle-run.sh`) |
| Redis | 로컬 Redis | `apt install redis-server` (네이티브) |
| back | IDE/gradlew bootRun | `java -jar` (systemd로 상시 실행) |
| analytics-django | venv + runserver | venv + gunicorn (systemd로 상시 실행) |
| front | npm run dev | npm run build && npm run start (systemd로 상시 실행) |

이전에 만들었던 `docker-compose.prod.yml` / 각 서비스 `Dockerfile` / ECR push 절차는 이제
**쓰지 않는다.** (당장 지운 건 아니니 나중에 여러 대로 스케일 아웃할 일이 생기면 그때 다시
참고해도 된다 — 지금 1대짜리 EC2 배포에는 필요 없다.)

## EC2 최초 세팅 (한 번만)

Ubuntu 22.04 EC2 인스턴스에 SSH로 접속한 뒤:

```bash
ssh -i "SBerp.pem" ubuntu@ec2-43-200-171-91.ap-northeast-2.compute.amazonaws.com

sudo apt update && sudo apt upgrade -y

# 1) Java 17 (JDK - back을 EC2에서 직접 빌드하므로 JRE 말고 JDK)
sudo apt install -y openjdk-17-jdk

# 2) Python 3 + venv (우분투 22.04 기본 python3은 3.10 - Django 5.x 요구사항 충족)
sudo apt install -y python3-venv python3-pip

# 3) Node.js 20.x (우분투 기본 apt의 nodejs는 버전이 너무 낮아서(v12) NodeSource로 새로 설치)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4) Redis (네이티브 설치 - Docker 안 씀)
sudo apt install -y redis-server
sudo systemctl enable --now redis-server

# 5) Docker (Oracle 컨테이너 하나 띄우는 용도로만 사용)
sudo apt install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu
# 이 명령 이후 한 번 로그아웃 후 재접속해야 docker 그룹 권한이 적용된다
exit
```

다시 SSH 접속 후:

```bash
# 6) 소스 클론
git clone https://github.com/yoonguri988/sberp.git
cd sberp

# 7) Oracle 컨테이너 기동 (최초 1회) - 비밀번호는 본인이 원하는 값으로
export ORACLE_SYS_PASSWORD='원하는_시스템_비밀번호'
export DB_USERNAME='sberp'
export DB_PASSWORD='원하는_DB_비밀번호'
chmod +x deploy/*.sh
./deploy/oracle-run.sh

# 기동 확인 (DATABASE IS READY TO USE! 나올 때까지 대기 - 최초는 2~5분 걸림)
docker logs -f sberp-oracle
```

## back / analytics-django / front 환경변수 설정

각 폴더에 `.env` 파일을 만든다 (`DB_USERNAME`은 위에서 설정한 값과 반드시 동일하게):

- `back/.env` — 로컬에서 쓰던 것과 동일한 항목. `DATASOURCE_URL`은
  `jdbc:oracle:thin:@localhost:1521/XEPDB1` (같은 EC2 안에서 접속하므로 localhost 그대로 둔다).
- `analytics-django/.env` — `JWT_SECRET`은 back의 `.env`와 **반드시 동일한 값**.
  `ORACLE_HOST=localhost`, `ORACLE_PORT=1521`, `ORACLE_SERVICE=XEPDB1`.
- `front/.env.production` — Next.js는 빌드 시점에 `NEXT_PUBLIC_*` 값을 번들에 박아 넣는다.
  반드시 EC2의 **실제 접속 주소**로 설정해야 한다 (localhost 아님!):
  ```
  NEXT_PUBLIC_API_BASE_URL=http://ec2-43-200-171-91.ap-northeast-2.compute.amazonaws.com:8080
  NEXT_PUBLIC_ANALYTICS_API_BASE_URL=http://ec2-43-200-171-91.ap-northeast-2.compute.amazonaws.com:8000
  ```

## 빌드 + 최초 실행

```bash
cd ~/sberp

# back 빌드
cd back && ./gradlew bootJar -x test --no-daemon && cd ..

# analytics-django 세팅
cd analytics-django
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install gunicorn
deactivate
cd ..

# front 빌드 (.env.production이 있어야 위 주소가 번들에 박힌다)
cd front && npm install && npm run build && cd ..
```

## systemd 등록 (상시 실행 + 재부팅/장애 자동 재시작)

```bash
sudo cp deploy/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now sberp-back sberp-analytics sberp-front

# 상태 확인
sudo systemctl status sberp-back sberp-analytics sberp-front

# 로그 확인
journalctl -u sberp-back -f
journalctl -u sberp-analytics -f
journalctl -u sberp-front -f
```

정상이면:
- `http://<EC2주소>:8080` — Spring
- `http://<EC2주소>:8000/health` — Django (`{"status":"ok"}`)
- `http://<EC2주소>:3000` — 프론트

EC2 보안그룹(Security Group)에서 인바운드 8080/8000/3000 포트를 열어둬야 외부에서 접속된다.

## 코드 수정 후 재배포

```bash
cd ~/sberp
./deploy/redeploy.sh
```

`git pull` → back 재빌드 → analytics 의존성 갱신 → front 재빌드 → 3개 서비스 재시작까지
한 번에 해준다. Oracle 컨테이너는 이미 떠 있는 걸 계속 쓰므로 건드리지 않는다.

## 스크립트 목록

- `oracle-run.sh` — Oracle 컨테이너 최초 기동 (한 번만 실행)
- `start-back.sh` / `start-analytics.sh` / `start-front.sh` — 각 서비스 실행 스크립트
  (systemd가 이걸 호출한다. 직접 실행할 일은 거의 없음)
- `redeploy.sh` — 코드 갱신 + 재빌드 + 재시작 한 번에
- `systemd/*.service` — `/etc/systemd/system/`에 복사해서 쓰는 서비스 정의 파일 3개
