---
layout: post 
title: Protostar review note - 00 - infrastructure 
subtitle: Protostar 구성 요소들에 대한 복습 + 심도 있는 확장을 정리한다 
categories: 문제해결
tags: Backend 개발 Protostar Project Review
thumb: https://paul2021-r.github.io/assets/images/assets/protostar-icon.png
custom-excerpt: Protostar 구성 요소들에 대한 복습 + 심도 있는 확장을 정리한다 
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/2026-01/20260109-010.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## 핵심 특징 5가지
1. 물리적 / 논리적 망 분리 : 서비스 존과 매니징 존을 분리하였고, 이를 통한 운영 안정성을 확보함.
2. 트래픽 제어를 위한 Nginx 레이어에서의 Traffic Dam :
	- 토큰 버킷 알고리즘 기반의 트래픽 제어 
		- Heavy Zone, Light Zone 으로 구분하여서 매크로성을 엄격히 막아야 하는 위치(Backend), 정적 리소스 로딩을 위한 일반 존(Frontend)로 구분하여 로딩속성과 백엔드 서비스 보호를 양립함.
3. 투명한 IP 보존(L4, L7 Proxy Protocol)
	- 두대의 서버, 한대의 공유기의 네트워크 환경에서 클라이언트의 원본 IP 를 추적하기 위함, 동시에 각 서버의 HTTPS 접속을 구현함으로서 서비스 서버와 메인터넌스 서버에 접속하는 루트를 분리. 이를 통한 서비스 서버의 문제가 발생하더라도, 이를 모니터링하는 서버의 접속은 문제 없도록 만들어냄 
4. 중앙집중형 관제 시스템
	- Prometheus 의 Pull 방식과 함께 Promtail을 통해 Loki 기반의 서버 어플리케이션들의 로그를 수집하도록 했음
	- 통합 대시보드를 통해 서버들의 상태, 관리의 중앙 집중구조를 구현함. 
5. AI 서비스를 위한 최적화 데이터베이스 구현
	- pgvector 확장을 위하여 init.spl에서 확장기능을 활성화 시켜 벡터 DB 기능을 사용하였다. 별도의 벡터 DB 가 아닌, RDBMS 인프라 내에서 임베딩 벡터를 저장, 검색함으로써 관리 복잡도를 줄여줌

## 구체적인 구성요소 해석 
### Docker 
#### include 
```yaml
# protostar-server-configs/docker-compose.yml
include:
  - path: ./main-server/docker-compose.yml
    env_file: ./main-server/.env
  - path: ./sub-server/docker-compose.yml
    env_file: ./sub-server/.env
```

```plain
COMPOSE_PROFILES="main"
```

```yaml
# protostar-server-configs/main-server/docker-compose.yml
services:
  nginx-main:
    profiles: ["main"] 
    container_name: ${DOMAIN:-main}-nginx
    image: nginx:alpine
    ulimits:
      nofile:
        soft: 65535
        hard: 65535
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx_target.conf:/etc/nginx/nginx.conf
        .
        .
        .
        (생략)
```
- 기존의 모놀리식 설정 파일을 팀별/ 기능별  쪼개서 관리하기 위한 목적의 명령어
- 기존에는 `-f docker-compose.yml`  이렇게 별도로 파일을 지정하여 설정을 실행함. 하지만 `include`는 파일 내부에 선언적으로 설정함. `.env` 등의 환경 설정을 통해, 키워드를 설정하고, 이를 통해  세부 docker-compose.yml 파일에서 `profiles` 키워드를 찾아서 그 내용을 실행하게 만듬.
- 왜 `include` 는 강력한가? 
	1. 상대 경로 독립성 보장 : 
		- 기존 `-f` 옵션 방식은 루트 디렉토리 기준 상대경로가 꼬일 수 있음. 
		- 해당 명령을 통해선 프로필로 직접 해석하기 때문에, 루트 디렉토리 기준 꼬이지 않고 동작하며, `main-server` 라는 부분만 옯겨도 수정 없이 바로 사용이 가능하다. 
	2. 환경 변수 스코프 분리 :  
		- 만약 모놀리식에 하나의 `.env` 형태라고 치자, 물리적으로 나뉜 설정이 혼재되고 관리하기 어려워진다. 
		- 이에비하면 `main-server`, `sub-server`는 각각 `.env` 파일을 지정할수 있고, 관리 면에서 물리적인 분리로, 변수 이름 충돌 등의 문제가 발생하지 않게 됨. 
	3. 단일 진입점
		- 물리적으로 설정이 완벽하게 분리되지만, 동시에 하나의 진입점에서 명령어를 친다는 점은 관리가 매우 편리함.
		- 개발자는 메인 `.env`의 키워드만 바꿔줌으로써 전체 아키텍쳐 안에서 필요한 환경만 한번에 불러올 수 있음. 
#### restart 정책  : `always` vs `unless-stopped` 
##### 1. `restart: always` (좀비 모드)

- **동작:** 컨테이너가 멈추면 무조건 다시 살려냄.
- **수동 종료 시:** `docker stop`으로 멈춰도, 도커 데몬이 재시작되거나(예: 서버 재부팅) 하면 **다시 살아난다.**
- **특징:** 개발자가 "이제 그만 죽어 있어"라고 명령해도, 컴퓨터를 껐다 켜면 "짜잔" 하고 다시 살아난다. 무조건 켜져 있어야 하는 핵심 데몬에 적합하다.

##### 2. `restart: unless-stopped` (매너 모드)

- **동작:** `always`와 똑같이 컨테이너가 죽으면 살려내지만, **"명시적으로 멈춘 상태"는 존중**.
- **수동 종료 시:** `docker stop`으로 멈춘 상태에서 서버를 재부팅하면, **계속 멈춰 있다.** (되살아나지 않음)
- **특징:** "내가 껐으면 끈 거야"라는 의도를 기억한다. 유지보수를 위해 잠시 꺼둔 DB나 서비스를 재부팅 후에도 꺼진 채로 유지하고 싶을 때 유용

결론적으로, 이러한 특성 때문에 온프레미스 환경에서 운영중이고 유지보수나 점검을 해야할 때 멋데로 다시 켜지거나 하여 충돌, 데이터 오염을 최소화 하고자, 개발자의 의도를 최우선으로 삼았기 때문에 모든 아키텍쳐는 `unless-stopped` 로 설정 되어 있음 

#### deploy.resources.limits vs deploy.resourcs.reservations 

1. Limits : 컨테이너의 사용 가능한 자원의 최대치를 제한을 건다. 특정 컨테이너가 과도한 리소스 점유를 방지하는 역할
2. Resrvations : 컨테이너 구동에 필요한 최소한의 자원을 예약하거나, 자원 부족 시 우선순위를 결정하는 기준이 됨. 
	1. 메모리의 경우, 평소엔 limits 까지 쓰이지만, reservations 설정이 있으면, host 의 메모리 부족 시 `reservations`의 값을 기반으로 컨테이너의 메모리 먼저 회수, 종료 함으로써 최소 사양으로 돌아가고 살아 있지만, 그 외의 리소스는 최대한 외부의 서비스가 쓸 수 있도록 제공해주는 역할을 함. 

#### logging 설정

```yaml
.
.
.
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    .
    .
    .
```

- Docker 컨테이너의 로그가 무한정 커질 수 있으니, 로그의 로테이션을 설정함으로써 로깅을 제한을 걸기 위해 쓸 수 있다. 
- `driver: "json-file"` : 로깅하는 방식, 호스트 머신에 어떤 포맷으로 적용할지,
- `max-size` : 최대치 설정
- `max-file` : 최대 파일 개수, 설정 만큼 파일이 차고 용량 역시 정한 만큼 넘어가면, 가장 오래된 로그는 삭제한다. 
- `node-exporter` , `cadvisor` 같은 모니터링에 적용된다. 이유는 간단하다. 여기서의 수집되는 데이터들이 Grafana에 모이고 있기 때문에 물리적 파일 형태로 갖추는 건 긴급한 상황 보기 위한 수준만 있으면 되고, 그 이상은 이미 Grafna 대시보드에 수집됨. 

#### network 'external'
- 네트워크를 해당 `docker-compose.yml` 에서 만들 수도 있다. 하지만 여러 컨테이너가 연결되어 있을 수 잇다보니, 또한 여러 컨테이너를 추가로 붙이는 경우에도 이렇게 설정하면 외부에 이미 되어 있으니 생성하라고 하지 않을 수 있으며, 당연히 네트워크 그룹으로 묶이니 소통이 편리해진다. 
- **네트워크의 수명과 컨테이너의 분리** 
	1. 실수로 인한 고립 방지 : 기본 설정만 할 경우 네트워크가 자동 생성, 삭제된다.  
	2. 다른 프로젝트와의 연결 : 공용도로로 연결되기 때문에, 향후 다른 서비스를 별도로 붙이더라도 손쉽게 붙이기가 가능함. 

### Shell Script

- SSL인증서 갱신을 위하여 구현하였던 쉘 스크립트.

```shell
  #!/bin/bash

  # 1. 스크립트가 있는 '진짜' 폴더 위치 계산 (절대 경로)
  SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

  # 2. Crontab용 PATH 설정
  export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

  # 에러 발생 시 멈춤
  set -e

  echo "========================================"
  echo "🚀 SSL Renewal Started at $(date)"
  echo "   Target Dir: $SCRIPT_DIR"
  echo "========================================"

  # --- [핵심] 환경 감지 로직 (COMPOSE_PROFILES 활용) ---
  # .env 파일을 읽어서 COMPOSE_PROFILES 변수에 'main'이 포함되어 있는지 확인합니다.

  ENV_FILE="$SCRIPT_DIR/.env"

  # .env 파일 로드 (변수 불러오기)
  if [ -f "$ENV_FILE" ]; then
      source "$ENV_FILE"
  fi

  # COMPOSE_PROFILES 변수 확인 (메인 서버인지 판단)
  if [[ "$COMPOSE_PROFILES" == *"main"* ]]; then
      echo ">> Detected Environment: Main Server (A5) (Profile: $COMPOSE_PROFILES)"
      CERTBOT_SVC="certbot-main"
      NGINX_SVC="nginx-main"
  else
      echo ">> Detected Environment: Standard/Sub Server (Profile: ${COMPOSE_PROFILES:-none})"
      CERTBOT_SVC="certbot"
      NGINX_SVC="nginx"
  fi

  echo "   Target Services -> Certbot: $CERTBOT_SVC / Nginx: $NGINX_SVC"
  echo "========================================"

  # 3. Docker Compose 실행 (공통 변수 사용)
  DC_CMD="docker compose --project-directory $SCRIPT_DIR --env-file $ENV_FILE"

  echo "[Step 1] Certbot Renew..."
  $DC_CMD run --rm "$CERTBOT_SVC" renew

  echo "[Step 2] Nginx Reload..."
  $DC_CMD exec "$NGINX_SVC" nginx -s reload

  echo "========================================"
  echo "✅ SSL Renewal Completed!"
  echo "========================================"
```

1. `crontab`으로 스케줄링을 걸면, 실행 위치가 엉뚱한 곳이 될 수 있음. `.env`와 `docker-compose.yml` 를 정확히 찾기 위한 장치가 필요하여 스크립트 위치를 계산한다. 
2. `cron` 환경은 일반 사용자 쉘과는 다름. 따라서 `PATH`가 최소 지정으로 `docker` 명령어를 못찾을 수 있어서 지정해주는게 안전한 실행을 발생 시킴
3. `if [조건]; then [실행할 명령]; fi` : 조건문
4. `[[ ... ]]` : 확장 테스트 명령, 일반 `[ ... ]` 에서 `==` 우측에 와일드카드를 써도 패턴 매칭안되고 단순 문자열 취급. '패턴매칭' 이 동작하고, 키워드가 맞는지 검사하는게 된다. 
5. 결과적으로 if 문을 통해 환경을 파악하고, 적용해야하는 컨테이너 이름들의 값을 확정지은다. 
6. `DC_CMD="~"` 명령어도 변수로 담아 둘 수 있으며, 이를 통해 반복 입력을 최소화한다. 
7. 결론
	1. 이 스크립트는 환경 인식을 통한 코드 중복을 제거하여, 스크립트를 여러개 만들지 않는 구조를 채택함 
	2. Cron 환경을 고려하여 환경변수, 현재 위치 등을 파악하고, 먼저 안전하게 수행하도록 함.
	3. `nginx -s reload` 등, 마지막 부분에서는 인증서 갱신이 되더라도 안정적이고, 트래픽이 끊기지 않게 만들고자 reload 를 사용함으로써 무중단 운영이 되도록 신경을 썼다. 
