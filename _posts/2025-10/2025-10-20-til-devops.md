---
layout: post 
title: TIL - HTTPS 적용 및 갱신 구조 적용하기(Nginx, NextJS)
subtitle: nextjs 기반 앱을 무중단 배포 구성하기
categories: 학습
tags: 학습 NextJS DevOps Jenkins Docker
thumb: /assets/images/posts/2025-10/2025-10-20-050.png
custom-excerpt: 2025년 10월 20일 개발 내용 요약 및 학습 정리
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/2025-10/2025-10-17-026.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## 2025년 10월 20일: Docker Compose와 Nginx 환경에 Let's Encrypt (Certbot)로 HTTPS 적용 및 자동 갱신 설정

### 요약

기존에 `docker-compose.yml`로 관리하던 Nginx 리버스 프록시와 Next.js (Blue/Green) 환경에, Let's Encrypt의 Certbot을 도입하여 HTTPS를 적용했다. 이 과정에서 포트포워딩, Nginx 설정 충돌, 도메인 CAA 정책 등 다양한 문제를 마주쳤으며, 이를 해결한 뒤 최종적으로 호스트 서버의 `Crontab`을 이용해 인증서 자동 갱신 스크립트까지 설정하여 전체 배포 아키텍처를 완성했다.

---

### 1. 최종 목표

Nginx 리버스 프록시에 SSL을 적용하여 `http://` 요청을 `https://`로 강제 리디렉션하고, 443 포트를 통해 암호화된 트래픽을 처리한다. 인증서는 무료 발급 기관인 Let's Encrypt를 사용하며, 발급 및 갱신은 Certbot을 통해 자동화한다.

**사용한 핵심 기술:**
- Docker Compose
- Nginx (Reverse Proxy)
- Certbot (Let's Encrypt Client)
- `webroot` (HTTP-01) 인증 방식

---

### 2. HTTPS 적용 절차

HTTPS 적용은 '최초 발급'과 '최종 적용'의 두 단계로 나누어 진행했다.

#### 1단계: Certbot 서비스 및 볼륨 정의

`docker-compose.yml` 파일에 `certbot` 서비스를 추가하고, Nginx와 Certbot이 인증서 및 인증용 파일을 공유할 수 있도록 2개의 볼륨을 마운트했다.
- `./nginx/certs:/etc/letsencrypt`: 발급된 인증서가 저장될 경로
- `./nginx/www:/var/www/certbot`: Certbot이 `webroot` 인증을 위해 임시 파일을 생성할 경로

또한 Nginx 서비스의 `ports`에 `"443:443"`을 추가했다.

#### 2단계: Nginx 임시 설정 (인증서 발급용)

`webroot` 방식은 80번 포트의 특정 경로(`/.well-known/acme-challenge/`)로 HTTP 요청이 들어왔을 때, Certbot이 생성한 파일을 Nginx가 서빙할 수 있어야 한다.
이를 위해 `nginx/nginx.conf`를 80번 포트만 리스닝하고, 해당 경로의 요청만 처리하는 임시 파일로 수정했다.

```nginx
# nginx.conf (임시 인증용)
server {
    listen 80;
    server_name paulryu9309.ddns.net;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 404; # 나머지 요청은 404 처리
    }
}
```

#### 3단계: Certbot 최초 발급 실행

Nginx를 임시 설정으로 실행한 뒤(`docker compose up -d nginx`), `docker compose run` 명령어로 Certbot 컨테이너를 일회성 실행했다.

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d paulryu9309.ddns.net --email [이메일] --agree-tos --no-eff-email
```

#### 4단계: Nginx 최종 설정 (HTTPS 적용)

인증서 발급이 성공한 후, `nginx/nginx.conf`를 `upstream`을 포함한 최종 버전으로 다시 수정했다.

**핵심 내용:**
1. **HTTP (80) 서버**: `/.well-known/` 경로는 갱신을 위해 남겨두고, 나머지 모든 요청(`location /`)은 `https://` (443 포트)로 301 리디렉션.
2. **HTTPS (443) 서버**: `listen 443 ssl;`을 활성화하고, `ssl_certificate`와 `ssl_certificate_key` 경로에 1단계에서 공유한 볼륨의 인증서 경로(`.../live/paulryu9309.ddns.net/...`)를 지정. `location /`에는 `proxy_pass http://nextjs_app;`을 설정.

#### 5단계: 전체 시스템 재시작
최종 설정이 적용된 `docker compose up -d` 명령으로 전체 시스템을 실행하여 `https://paulryu9309.ddns.net` 접속 및 자물쇠(🔒) 아이콘을 확인했다.

---

### 3. 문제 해결 과정 (Troubleshooting "Battle")
HTTPS를 적용하는 과정은 순탄하지 않았으며, 여러 에러를 단계적으로 해결해야 했다.

#### 문제 1: `Connection refused` (연결 거부)
- **증상**: Certbot이 80번 포트로 접속을 시도했으나 연결이 거부됨.
- **원인**: 로컬 환경에서 테스트 하는 것으로 가능하다고 생각했음. 원격 서버에 수동 배포 및 공유기의 **포트포워딩** 설정이 누락되어 있었다.
- **해결**: 수동 배포하여 초기 구동 및 80포트 접속 가능 여부 확인함. iptime 관리자 페이지에서 외부 80 포트를 Docker가 실행 중인 서버의 내부 IP 80 포트로 포트포워딩 설정하여 해결.

#### 문제 2: `404 Not Found` (파일 없음)
- **증상**: `Connection refused` 해결 후, Certbot이 인증 파일을 찾을 수 없다고 응답.
- **원인**: `docker compose restart nginx`를 했음에도, Nginx가 임시 `nginx.conf` 설정을 제대로 불러오지 못함. `/.well-known/` location이 아닌 `location / { return 404; }`가 모든 요청을 처리함. 확인 결과 nginx.conf 파일의 주소 경로 오타 + 이미 설정 된 레이어가 에러를 일으킴. 
- **해결**: 오타 수정 후 `docker compose down --rmi all` 후 `up -d nginx`로 컨테이너를 완전히 다시 생성하여 임시 설정을 강제로 적용. 

#### 문제 3: Nginx 컨테이너 무한 재시작

- **증상**: Nginx 컨테이너가 `restarting` 상태를 반복.
- **원인**: `docker logs project-mini-nginx`로 로그 확인 결과, `nginx.conf`의 문법 오류(`[emerg]`). 임시 설정 파일임에도 불구하고 `upstream nextjs_app { ... }` 블록을 삭제하지 않아 발생한 오류였다.
- **해결**: 임시 `nginx.conf`에서 `upstream` 블록을 제거하여 문법 오류 해결.
    

#### 문제 4: `Type: caa` (CAA 레코드 문제)

- **증상**: 모든 설정이 완벽했음에도 `CAA record for iptime.org prevents issuance` 에러 발생.
- **원인**: 사용 중이던 `iptime.org` DDNS의 상위 도메인 정책(CAA 레코드)이 Let's Encrypt 기관의 인증서 발급을 허용하지 않음.
- **해결**: `iptime.org` DDNS 사용을 포기하고, CAA 레코드 제한이 없는 **No-IP** DDNS (`paulryu9309.ddns.net`)로 교체하여 즉시 해결.

#### 문제 5: `duplicate upstream "nextjs_app"` (Upstream 중복)

- **증상**: 최종 HTTPS 설정 적용 후 Nginx가 다시 무한 재시작.
- **원인**: `docker logs` 확인 결과, `upstream` 정의가 중복되었다고 나옴.
    1. `nginx/Dockerfile`: `COPY nginx.conf ...`로 이미지 빌드 시점에 설정 파일이 복사되어 컨테이너 내부로 들어감.
    2. docker-compose.yml: volumes: - ./nginx.conf:...로 컨테이너 실행 시점에 설정 파일이 또 마운트됨.
    3. 결론 적으로 Nginx가 설정 폴더 내의 두 파일을 모두 읽어 충돌 발생
- **해결**: `nginx/Dockerfile`의 `COPY` 라인을 삭제하고, `docker compose`의 **볼륨 마운트 방식만 사용**하여 설정 파일을 관리하도록 통일. `docker compose build --no-cache nginx`로 이미지를 재생성하여 해결.
    

---

### 4. 인증서 자동 갱신 설정

Let's Encrypt 인증서는 90일마다 만료되므로, 호스트 서버의 `Crontab`을 이용해 자동 갱신을 설정했다.
1. 갱신 스크립트 (renew-ssl.sh) 생성:
    프로젝트 루트 폴더로 cd 한 뒤, docker compose run으로 Certbot 갱신을 시도하고, docker compose exec로 Nginx를 리로드하는 쉘 스크립트를 작성했다.
    ```bash
    #!/bin/sh
    cd /home/hansol/workspace/project-mini-frontend/ # 실제 경로
    docker compose run --rm certbot renew
    docker compose exec nginx nginx -s reload
    ```
    
2. 실행 권한 부여:
    
	```bash
	chmod +x /home/hansol/workspace/project-mini-frontend/renew-ssl.sh
	```
    
3. Crontab 등록:
    
    crontab -e 명령어로 편집기를 열고, 매일 새벽 3시 30분에 스크립트를 실행하도록 등록했다.
	
    ```vim
    30 3 * * * /home/hansol/workspace/project-mini-frontend/renew-ssl.sh
    ```
    

### 5. 배운 점

- Dockerfile의 `COPY`는 빌드 시점(Build-time)에, Docker Compose의 `volumes`는 실행 시점(Run-time)에 작동한다. 설정 파일처럼 자주 바뀌는 것은 `volumes`로 마운트하는 것이 이미지 재빌드 없이 유연하게 대처할 수 있다.
- 에러 로그를 읽는 것이 문제 해결의 90%이다. `docker logs [컨테이너]`는 항상 가장 먼저 확인해야 할 정보다.
- Let's Encrypt의 `webroot` 방식은 80번 포트가 외부 인터넷에 반드시 열려있어야 한다. 공유기 환경에서는 포트포워딩이 필수이다.
- 도메인의 CAA 레코드는 내가 제어할 수 없는 상위 정책일 수 있다. DDNS 사용 시 서비스 제공자의 정책을 확인해야 한다.
- Nginx 설정 문법이 틀리면 Nginx는 아예 시작조차 하지 않는다. `docker compose run --rm nginx nginx -t` 명령어로 문법을 미리 테스트해볼 수 있다.

---

### 6. 코드레빗 지적 사항 학습 및 개선 

PR 을 통해 머지 전, 발생한 Major 이슈로 문제가 되는 부분이 뭔지, 그리고 그 부분의 문제 개선 내용을 요약해두었다.

#### Certbot 네트워크 설정 없음(Docker-Compose.yml)
![](/assets/images/posts/2025-10/2025-10-20-046.png)
- 개요 : 기본적으로 현재 방식은 공유 볼룸을 기반으로 `weebroot` 방식은 공유 되는 파일을 주고 받아, 컨테이너들 사이의 네트워크, 특히나 도커 네트워크 기반으로 설정할 필요가 없음. 그러나 AI 의 지적은 몇가지 타당성이 있기 때문에 문제시 될 수 있다. 
	1. 구성의 일관성 및 명확성
	2. docker compose run 동작 시 연결되는 네트워크 : 현재 프로젝트의 `project-mini-network`에 접속하여 연결되는 구조가 성립되어 있으나, 이러한 설정이 없으면 아무래도 기본 네트워크에 연결이 되며, 이 점은 비일관적이고 오작동을 유발 할 수도 있다.
	3. 향후 확장성 : 현재는 심플한 webroot 방식이지만 nginx의 플러그인을 활용한다면, certbot 이 nginx 컨테이너에 직접 연결될수도 있음. 그렇다면 누락시켜서 문제시 되는 거 보다 일단 네트워크는 사용하지 않더라도 연결해두는게 낫다. 
- 결정 : 일관성과 향후를 위해 간단하게 네트워크 통일 

#### SSL/TLS 보안 설정 부족 
- 기본 설정 만으론 보안 표준 충족 안됨 TLS 프로토콜에 대한 버전 제안, 암호화 스위트, 기타 보안 헤더 설정이 필요 
1. **`ssl_protocols TLSv1.2 TLSv1.3;`**
    - **설명:** Nginx 서버가 허용할 TLS 프로토콜 버전을 명시적으로 지정한다.
    - **이유:** `TLSv1.0`과 `TLSv1.1` 버전은 POODLE, BEAST와 같은 심각한 보안 취약점이 발견되어 사용이 권장되지 않음. 이 설정을 통해 **안전하다고 검증된 `TLSv1.2`와 최신 버전인 `TLSv1.3`만** 허용하여 하위 버전의 취약점을 원천적으로 차단하는 역할을 함.
        
2. **`ssl_prefer_server_ciphers on;`**
    - **설명:** SSL/TLS 연결 협상 시, 클라이언트(브라우저)가 제안하는 암호화 스위트 목록과 서버가 제안하는 목록 중 **서버(Nginx)의 목록을 우선**하도록 설정한다.
    - **이유:** 서버는 관리자가 의도한 강력한 암호화 방식(아래 `ssl_ciphers`에서 설정)을 사용하도록 구성되어 있음. 만약 클라이언트가 약한 암호화 방식을 우선적으로 제안하더라도, 이 옵션을 켜두면 서버가 선택한 가장 강력한 방식을 강제할 수 있다.
        
3. **`ssl_ciphers '...';`**
    - **설명:** 서버가 허용할 **암호화 스위트(Cipher Suites)의 목록**을 강력한 순서대로 지정한다. 제안된 목록(`ECDHE-ECDSA-AES128-GCM-SHA256` 등)은 모두 강력한 보안을 제공하는 최신 알고리즘으로 설정하는 역할을 함.
    - **이유:** 이 목록은 특히 **PFS(Perfect Forward Secrecy)** 를 지원하는 `ECDHE` 계열의 암호화를 우선한다. PFS는 만약 서버의 개인 키가 미래에 유출되더라도, 과거에 이 키로 암호화되어 저장된 트래픽(통신 내용)을 해독할 수 없도록 보장하는 매우 중요한 보안 기능이다.
        
4. **`ssl_session_cache shared:SSL:10m;`**
    - **설명:** SSL 세션 정보를 서버 메모리에 캐시할 공간을 설정한다. `shared:SSL:10m`은 모든 Nginx 워커 프로세스가 공유하는 `SSL`이라는 이름의 10MB 캐시 공간을 의미한다.
    - **이유 (성능 향상):** HTTPS는 연결 시마다 암호화 키를 교환하는 복잡한 과정(Handshake)을 거치는데, 이 과정은 CPU 자원을 소모함. 이 설정을 통해 한 번 연결했던 클라이언트가 다시 접속할 때(예: 페이지 내의 여러 이미지 로드) Handshake 과정을 생략하고 캐시된 세션 정보를 재사용하여 **HTTPS 연결 속도를 크게 향상**시키는 역할을 함. 기본적으로 설정을 안할 경우 `none` 으로 설정되므로 세션 캐시를 만들지 않음. 
    - 1MB 는 약 4천개의 세션을 저장하는데(하나의 세션이 256 바이트 정도된다), 따라서 10MB 설정은 약 40,000개의 동시 세션을 저장하는 공간이다. 따라서 기본적으로 중소 규모 웹 사이트의 트래픽을 감당할 수준이라고 보면 된다. 
        
5. **`ssl_session_timeout 10m;`**
    - **설명:** 위에서 만든 세션 캐시가 **10분** 동안 유효하도록 설정한다.
    - **이유 (성능 향상):** `ssl_session_cache`와 함께 작동하여, 10분 이내에 재접속하는 사용자는 빠른 세션 재개를 통해 성능 이점을 누릴 수 있다. 비 설정 시 기본값은 5분이지만, 새션 캐시가 존재하지 않으면 의미가 없기 때문에 세트로 옵션이 설정되어야 한다.
        
6. **`add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;`**
    - **설명:** **HSTS(HTTP Strict Transport Security)** 헤더를 브라우저에 전송한다.
    - **이유 (보안 강화):** 이 헤더를 한 번이라도 받은 브라우저는 `max-age`에 설정된 시간(31536000초 = 1년) 동안 해당 도메인(및 `includeSubDomains` 설정 시 하위 도메인까지)에 **절대로 HTTP로 접속하지 않고, 무조건 HTTPS로만 접속**하게 된다. 이는 사용자가 실수로 `http://`로 접속 시도하는 것을 방지하고, 중간자 공격(MITM)의 일종인 **SSL 스트리핑(SSL Stripping)** 공격을 완벽하게 방어하는 역할을 수행한다. 

- 모르는 내용 정리 
	- 암호화 스위트 : 클라이언트와 서버 사이의 HTTPS 통신 전, 통신 암호화 규칙을 설정하는 묶음 세트. 명시적으로 설정함으로써 통신의 규약을 확정 짓는 방법 
		- 구성요소 : 
			- 키 교환 알고리즘
			- 인증 알고리즘
			- 대칭키 알고리즘 
			- 메시지 인증/ 무결성 알고리즘
	- OCSP 스테이플링 적용 :
	  - 개념 : 
		  - OCSP 스테이플링은 SSL/TLS 인증서의 유효성(폐기 여부)을 확인하는 책임을 클라이언트(브라우저)가 아닌 **서버(Nginx)가 대신 수행**하는 기능이다.
		  - 기본적으로 브라우저는 HTTPS 사이트 접속 시, 해당 인증서가 폐기되지 않았는지 확인하기 위해 인증 기관(CA) 서버에 OCSP(Online Certificate Status Protocol) 요청을 별도로 전송한다. 이 방식은 연결 속도를 저하(지연 발생)시키고, 사용자의 접속 기록이 CA에 노출되는 프라이버시 문제를 야기한다.
	- 적용 예시 
	  ```nginx
	  # nginx.conf 내 http { ... } 또는 server { ... } 블록
		# OCSP 스테이플링 활성화
		ssl_stapling on;
		ssl_stapling_verify on;
		
		# 스테이플링 검증을 위한 신뢰할 수 있는 인증서 체인 지정
		# Let's Encrypt의 fullchain.pem은 서버 인증서와 체인 인증서를 모두 포함하고 있음
		ssl_trusted_certificate /etc/letsencrypt/live/paulryu9309.ddns.net/fullchain.pem;
		
		# (선택 사항) OCSP 응답 확인을 위한 리졸버 (예: Google DNS)
		# resolver 8.8.8.8;
	  ```
	- 작동 원리
		1. **서버의 사전 확인:** Nginx 서버가 주기적으로 CA 서버에 "내 인증서는 유효한가?"라고 질의한다.
		2. **응답 캐싱:** Nginx는 CA로부터 타임스탬프가 찍힌 "유효함" 응답(OCSP 응답)을 받아 캐시한다.
		3. **응답 첨부 (Stapling):** 클라이언트가 최초 연결(SSL Handshake)을 시도할 때, Nginx는 SSL 인증서와 함께 이 캐시된 "유효함" 응답을 **"찝어서(Stapling)"** 함께 전송한다.
		4. **브라우저 확인 생략:** 클라이언트는 서버가 제공한 OCSP 응답을 신뢰하므로, CA 서버에 직접 질의하는 단계를 생략한다.
	- 적용 이점
		- **성능 향상 (속도):** 브라우저가 CA 서버에 추가 질의하는 과정을 생략함으로써, HTTPS 초기 연결(Handshake) 속도가 빨라진다.
		- **프라이버시 보호:** 사용자의 접속 정보(IP, 방문 사이트)가 CA 서버에 노출되지 않아 개인정보 보호 수준이 향상된다.

#### Critical 인증서 경로 초기 설정 추가 필요 내역
![](/assets/images/posts/2025-10/2025-10-20-047.png)
- 핵심 문제 : docker 를 통해 nginx 서비스가 실행 -> 이때 nginx.conf 를 참조하는데, 이때 인증서 존재여부를 보게 되니, 최초에 현재 conf(SSL 설정이 된) 로는 에러가 발생한다는 것이 문제. 
- 개선 방안은 다음과 같다. 
	1. **init-letsencrypt.sh** 와 같은 초기화 스크립트를 활용할 것
	2. **가짜 인증서**를 만드는 전략을 활용해 구동을 하고 certbot으로 진짜 인증서를 받고, 유효한 심볼링 링크를 생성하는 방식 -> 초기화 스크립트는 복잡하고, 여러 수정 작업등이 존재하므로, 차라리 가짜 인증서를 certbot으로 진짜 인증서 발급 이후 새롭게 접근하는 방식. (향후 적용 예정)

#### 갱신 스크립트의 하드코딩 경로 문제 
![](/assets/images/posts/2025-10/2025-10-20-048.png)
- 개요 : 하드 코딩 & 에러처리의 간단한 구조이다보니 문제 있음
- 개선 : AI 지적한데로 개선된 형태를 그대로 차용하여 적용

#### Certbot 갱신 실패 에러 핸들링 추가

![](/assets/images/posts/2025-10/2025-10-20-049.png)
- 개요 : 갱신 절차에 대해 실행 결과를 확인하지 않고 해야할 일만 바로 수행하도록 되어 있음
- 개선 : 지적한 대로 스크립트 수정 