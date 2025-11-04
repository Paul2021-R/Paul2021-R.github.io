---
layout: post 
title: TIL - HTTPS 인증 받기, 그리고 NPM 도입
subtitle: NPM Plus 를 설정하고 손쉽게 HTTPS 설정하기
categories: 학습
tags: 학습 NextJS DevOps Jenkins Docker Monitoring
thumb: /assets/images/assets/npmplus-icon.png
custom-excerpt: 2025년 11월 3일 개발 내용 요약 및 학습 정리
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/assets/npmplus.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## 2025-11-04 : HTTPS 인증 받기, 그리고 NPM 도입

다시 HTTPS 인증을 받으려고 해보았다. 이젠 서버에 등록도 되었겠지. Fail 캐싱도 해결되서 문제 없겠지 라는 생각으로 해보았다. 

![](/assets/images/posts/2025-11/20251104-003.png)
> 으아ㅏㅏㅏㅏㅏㅏㅏㅏㅏㅏㄱㄱㄱㄱㄱㄱㄱㄱㄱㄱ

내 시간을 도대체 얼마나 잡아 먹을 생각인가 DuckDNS!!! 라는 생각을 하고 검색으로 문제 해결 방법을 조사해보았다. 

그러다 알게된 유사한 경험의 [Reddit 글](https://www.reddit.com/r/selfhosted/comments/1j2nkmv/dns_challenge_with_duckdnsorg_timeouts_and/). 답변을 확인해보니 다음과 같았다.

1. DNSSE 쿼리 처리가 걍 영구적으로 문제 있음 
2. HTTPS 인증 요청하면 아마 답 자체를 안하게 됨. 
3. 그러면 님 무조건 timeout 발생함

(....)

DuckDNS 의 영구적 문제가 있다는 걸 발견하자 오히려 마음이 편해졌다. 그리하여 NoIP 의 서비스를 구매. 어차피 쓸꺼 하고 화끈하게 2년치 구매를 해버렸다...내 십만원..흑흑 앞으로도 서비스를 만들수도 있으니..

어쨌든 그렇게 하고 보니 NPM 서비스라는 것을 발견하여 해당 방식을 적용 후기이다. ~~가즈아~~

---

## Nginx Proxy Manager (NPM)란 무엇인가?

Nginx Proxy Manager(NPM)는 오픈소스 프로젝트 중 하나로, 강력한 웹 서버인 **Nginx**를 기반으로 한다.
Nginx의 핵심 기능 중 하나인 '리버스 프록시'를 누구나 쉽게 사용할 수 있도록 **웹 기반의 그래픽 사용자 인터페이스(GUI)** 를 제공하는 데 목적이 있다.
터미널에 접속하여 복잡한 `.conf` 설정 파일을 직접 작성하는 대신, 사용자는 웹 브라우저로 NPM 관리자 페이지(예: `http://서버IP:81`)에 접속하여 마우스 클릭과 폼 입력만으로 모든 설정을 완료할 수 있다.

## NPM의 핵심 기능

NPM이 제공하는 주요 기능은 크게 세 가지로 나눌 수 있다.

### 1. 리버스 프록시 (Reverse Proxy) 관리

- **호스트 기반 라우팅:** 단일 공인 IP 주소와 80/443 포트를 사용하더라도, `jenkins.yourdomain.com`, `n8n.yourdomain.com` 등 서로 다른 도메인/서브도메인 요청을 받아, 내부의 각기 다른 서비스(예: `localhost:8080`, `localhost:5678`)로 정확하게 연결(전달)해준다.
- **간편한 설정:** GUI의 'Proxy Hosts' 메뉴에서 도메인 이름, 내부 IP 주소, 내부 포트만 입력하면 즉시 리버스 프록시 설정이 완료된다.

### 2. SSL 인증서 자동화 (Let's Encrypt)

- **원클릭 SSL:** Let's Encrypt와 완벽하게 연동되어, GUI에서 스위치 하나만 켜면 자동으로 SSL 인증서를 발급받고 Nginx에 적용한다.
- **인증서 자동 갱신:** 발급받은 인증서가 만료되기 전에 자동으로 갱신(Renew)하여 HTTPS가 중단되지 않게 한다.
- **DNS-01 챌린지 지원:** (한솔의 현재 상황에 핵심) NoIP, Cloudflare 등 주요 DNS 서비스의 API를 지원한다. GUI에 API 키(또는 계정 정보)를 입력하면, **와일드카드 인증서(`*.yourdomain.com`)**를 복잡한 과정 없이 자동으로 발급받을 수 있다.

### 3. 기타 편의 기능

- **접근 제어 (Access Lists):** 특정 도메인에 대해 IP 기반 접근 제한 또는 사용자 로그인(HTTP Basic Auth)을 쉽게 설정할 수 있다.
- **리디렉션 (Redirection):** 특정 주소로 들어온 요청을 다른 주소로 강제 이동(예: HTTP를 HTTPS로)시키는 규칙을 쉽게 생성한다.

## 왜 Nginx 대신 NPM을 사용하는가?

- **압도적인 편의성:** Nginx 원본(Raw Nginx)은 모든 설정을 텍스트 파일(`nginx.conf`)로 관리한다. 문법이 복잡하고, 서비스 하나를 추가할 때마다 SSH 접속, 파일 수정, 문법 검사(`nginx -t`), 서비스 재시작(`reload`) 과정을 거쳐야 한다. NPM은 이 모든 것을 웹 GUI의 '저장' 버튼 하나로 끝낸다.
- **SSL 설정의 간소화:** 원본 Nginx에서 Let's Encrypt를 쓰려면 'Certbot'이라는 별도 도구를 설치하고, Nginx와 연동하는 복잡한 명령어를 실행하며, 갱신을 위한 `cron` 작업을 수동으로 등록해야 한다. NPM은 이 모든 과정을 내부적으로 자동화했다.
- **낮은 진입 장벽:** Nginx에 대한 깊은 지식이 없어도, NPM의 직관적인 GUI를 통해 누구나 강력한 리버스 프록시 환경을 구축할 수 있다.
![](/assets/images/posts/2025-11/20251104-004.png)

---
## 문제 해결 과정
### wildcard DDNS 실패
- NoIP 기준 wildcard 방식으로 url 을 설정하는 것이 가능하다. 
- 이렇게 설정하면 다행이(?) DNS 자리를 줄일 수 있었다. 
![](/assets/images/posts/2025-11/20251104-005.png)

> 
- 그런데 이경우 HTTPS 설정을 해야 하는데, 이때는 방식 두 가지 중 하나로 가능하다. 
	- **HTTP-01 방식:** 개별 URL에 대해서 처리하는 방식 
	- **DNS-01 챌린지 방식:** 특정 사이트 URL 이 소유주가 있음을 인정하여 직접 제어하고, 해당 도메인을 아예 인정해버리는 것. => 이걸 활용해야 원래는 wildcard 방식의 도메인 접근가능 
- 하필이면... NoIP 는 DNS 프로바이더로  없었다. DNS-01 방식은 공용 포트도 불필요, 와일드카드를 위한 인증서용인데 어쩔수 없이 기본적인 HTTP-01 방식으로 마무리 했다. 
  ![](/assets/images/posts/2025-11/20251104-006.png)
- HTTP-01 방식은 전통적인 nginx 의 설정을 그대로 옮긴다고 보면 되었다. 
  ![](/assets/images/posts/2025-11/20251104-007.png)
  
---

하.. DNS-01 방식으로 삽질을 했다. 그런데 안된다는 걸 깨닫고 빠르게 하니 거의 10분? 이 안걸렸다. 

다음부턴 NPM + 쉽게 연결하기로 해결해야지 ㅠ..