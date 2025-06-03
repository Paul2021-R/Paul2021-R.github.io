---
layout: post 
title: NestJS 컴파일러 성능 비교 - tsc vs SWC
subtitle: SWC를 적용하고 개발이 200프로 빨라진다. 대신 300프로 조심해라...
categories: Backend
tags: Backend Node NestJS TypeScript Programming
thumb: https://i.namu.wiki/i/lESG3ZnlLtV8zKQbWkUT8BMOhfdB150eNx3kL4UgcF7JpgiZcc4a71PM0tPrvfeg7hyAJtgBPBGs8URwIS1vhMQf6eJa0OanfRs_XQU1LI3jwe22GUND1TuQlxUSRQBgksnj1r1wvWNiSw85F2voog.svg
custom-excerpt: 빠른 개발을 하고 싶다면 SWC 를 써보자. 대신에.... 
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  image: /assets/images/posts/2025-06/2025-06-01-0001.png
  opacity: 0.5
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## introduce
Node 계열 프레임워크에서 TypeScript 언어 방식으로 개발을 하게 되면, 잘 알듯 JavaScript 로의 변환의 과정이 반드시 필요하다. 타입 체크를 비롯한 TypeScript의 강력한 기능으로 한 번 더 래핑된 상태라, JS 로의 변환 과정은 필수인 것이다. 

### tsc 기본 컴파일러
TypeScript 컴파일러는 ms 에서 강력한 정적 분석과 엄격한 타입을 관리한다는 철학을 기반으로 만들어져 있다. 매우 큰 커뮤니티를 통해 안정성, 신뢰성, 쉽게 이용 가능하다는 기본적인 특징들은 이미 충분히 라이브서비스에 쓸만하다고 볼 수 있다. 그런 점에서 NestJS 프로젝트를 시작하면 시작과 동시에 기본 값으로 설정 되어 있는 것은 이러한 부분을 증명해주는 것이리라.

하지만 라이브 서비스로 쓰다보면 약간 답답함을 경험하게 될 것이다. 비교적 충분히 빠르긴 하지만, 프로젝트가 커지면 성능 병목은 어쩔 수 없이 필요하게 되고, 특히나 다중 타입 등이 많아질 수록, 포괄적인 검사는 엄청난 병목으로 다가온다. 제네릭스 타입이나, 타입의 수단계를 거친 복잡한 타입의 인스턴스화는 개발경험, CI 속도에 영향을 느끼게 된다. 

특히나 AWS 에서 개발 환경이 존재하는 경우에도 문제가 있다. 감시모드를 켜게 되면 tsc 는 초기에는 메모리가 낮은 편이지만, 파일 변경으로 재 컴파일 트리거가 발동하면 메모리 사용량이 급격히 증가하게 된다. 피크 수준이 200 ~ 300mb 수준을 차지하게 되는데, 문제는 리소스가 부족한 서버를 갖고 있거나, 리소스에 맞춰진 수준의 dev 서버를 구동한다고 하면 피크 메모리 점유율로 인해 AWS 인스턴스가 멈추는 경우가 발생하게 된다. 

### NestJS 의 SWC(Speedy Web Compiler)

이러한 점들을 경험하고 나면 살짝 불편함을 느끼게 되고, 검색을 하게 된다. 그러다보면 마치 군대에서 '사제'를 찾듯이(?) 사제 컴파일러가 그렇게 좋다더라~ 하는 소문을 듣게 되고, 나름의 대안을 찾아 보게된다. 그 중에 하나가 `SWC` 라는 컴파일러. 러스트 기반이자, 트랜스파일링 프로세스를 최적화 시켜 Babel 의 직접적인 대체제라는 평가를 가진 컴파일러이다. 

![SWC로고](https://i.namu.wiki/i/lESG3ZnlLtV8zKQbWkUT8BMOhfdB150eNx3kL4UgcF7JpgiZcc4a71PM0tPrvfeg7hyAJtgBPBGs8URwIS1vhMQf6eJa0OanfRs_XQU1LI3jwe22GUND1TuQlxUSRQBgksnj1r1wvWNiSw85F2voog.svg)<br/>

[공식 사이트](https://swc.rs/)<br/>

[공식 깃허브](https://github.com/swc-project/swc?tab=readme-ov-file)

SWC는 NestJS v10에서 공식으로 통합이 도입되었고, `@swc/cli`, `@swc/core` 패키지를 통해 사용이 가능하다. `nest-cli.json` 에서 컴파일러 옵션의 builder 를 swc 로 넣어주면 SWC 컴파일러를 사용할 수 있다. 

이러한 SWC 의 근본적인 목적은 Babel(tsc)의 기본적인 타입 검사를 수행하지 않고, 고속변환에 포커스를 맞추고 있다는 점이다. 그럼에도 왜 써야 하는가? 라고 하면 다음과 같이 정리 할 수 있다. 

- 기본적으로 SWC의 벤치 내용은 [여기](https://swc.rs/docs/benchmarks)를 참조하면 기본적으로 제공해주는 것을 알 수 있다. 프로젝트마다 다를 순 있지만, 기본적으로 평균 20배 내외의 성능을 나타낸다는 결과를 보여주었다. 

    실제로 사내 메인 서비스의 NestJS 서버의 경우 단순 빌드 작업만 수행한다고 할 때, 기본 컴파일러 상태에서 총 4930ms가 수행되었으나, SWC 적용할 경우 2700ms 가 소요되었다. 약 82% 성능 향상을 보는 것이다(뒤에서 언급하기도 하겠지만, 현재는 SWC, TSC 의 병행 구조이다보니 파일 복사 과정이 포함되어 있고, 해당 부분을 공통으로 제외하면 훨씬 높은 성능을 보여주는 것이다). 

- 1번과 함께 HMR(Hot Module Replacement)가 이루어져서, 대단히 생산적인 워크 플로우를 짤 수 있다. 시간이 중요한 상황에서 이러한 즉각적인 피드백은 개발의 반복 속도, 테스팅 속도 등을 줄여주니, 그만큼 생산성에 직결된다고 볼 수 있다.

## SWC 사용 후기는 그래서?

### 빌드시간 비교 
공식자료들을 기반으로 정리해 보면, 약 6000 줄의 코드 구성의 소규모 NestJS 프로젝트는 tsc의 경우 약 5.2 초의 빌드가, SWC 의 경우 0.38초가 걸렸다. 이러한 수치는 트랜스파일링 단계의 속도 향상에 대한 내용이 주를 이루며, 타입 검사는 해당하지 않는다. 

공식 내용을 정리한 표를 보면 더욱 이 차이는 명백해진다.

| 이름                | 1 코어, 동기   | 4 Promise      | 100 Promise     |
|---------------------|----------------|----------------|-----------------|
| swc (es3)           | 616 ops/sec    | 1704 ops/sec   | 2199 ops/sec    |
| swc (es2015)        | 677 ops/sec    | 1688 ops/sec   | 1911 ops/sec    |
| swc (es2016)        | 1963 ops/sec   | 3948 ops/sec   | 5580 ops/sec    |
| swc (es2017)        | 1971 ops/sec   | 3948 ops/sec   | 6259 ops/sec    |
| swc (es2018)        | 2555 ops/sec   | 4884 ops/sec   | 8108 ops/sec    |
| swc-optimize (es3)  | 645 ops/sec    | 1716 ops/sec   | 1860 ops/sec    |
| babel (es5)         | 34.05 ops/sec  | 27.28 ops/sec  | 32 ops/sec      |

> 단위: **ops/sec (operations per second)**  
> 참고: 수치가 높을수록 더 빠름

더불어 자원이 풍부하지 않은 회사도 있을 수 있으므로(...) 메모리 소비도 분석하면 다음과같은 패턴이 보여진다. 아래 수치는 외부 오버헤드 최소화를 위하여, `node_modules`에서 직접 명령어를 실행 했을 때 수치다. 

| 컴파일러/설정              | 시작 시 메모리 | 파일 변경 시 메모리 | 1분 비활성 후 메모리 |
|---------------------------|----------------|----------------------|------------------------|
| tsc                       | ~50            | ~200                 | ~60                   |
| tsc (without --noCheck)   | ~200           | ~300                 | ~65                   |
| SWC                       | ~310           | 변화 없음            | 변화 없음             |
| SWC (with --workers 1)    | ~195           | 변화 없음            | 변화 없음             |

> 참고: `변화 없음`은 감지 가능한 메모리 증감이 없음을 의미함

tsc 는 일반적으로 낮은 기본 메모리 사용량을 보여준다. 그러나 피크 시의 경우 상당한 변화량을 가지는데, 여기서 좀 특이한 경험을 했었다. 

[AWS EC2 먹통, 멈춤 현상 해결방법](https://g-db.tistory.com/entry/AWS-EC2-%EB%A8%B9%ED%86%B5-%EB%A9%88%EC%B6%A4-%ED%98%84%EC%83%81-%ED%95%B4%EA%B2%B0%EB%B0%A9%EB%B2%95), 이 글이 아마 가장 명확한 이유일 것으로 보이는데,... AWS는 인스턴스의 다른 리소스보다 메모리에 민감한 것으로 보여진다. 특히나 순간적으로 치솟는 경우 AWS 인스턴스 자체가 멈추는 경우가 있고, 이 때는 AWS 의 CloudWatch 가 먹통이 되는 데, 이로인해 모니터링도 에러라고 핸들링을 못하고, SSH 접속도 안되고, 재부팅도 빠르게 이루어지지 않는다. 서버가 타임아웃하는 문제가 발생하는 것이다. 정말 열 받는 부분인데(...) 한술 더 떠 개발들 위하여 사용하는 VSC IDE 의 SSH 접속 도 메모리를 매우 많이 먹는 다는 점이다. 

이 두 가지 조건이 합쳐지고, tsc 로 HMR 를 수행하게 되면 서버는 정말 랜덤 확률로 터지고, 터진 뒤에도 터졌는지를 전혀 모르는 (...) 상황이 발생할 수 있다. 계속 값을 바꾸면서, 세팅에 따른 백엔드의 서빙 특성을 조사하거나 해야 할 때는 1변경 1리붓을 경험할 수 도 있다.(리소스가 적으면 어쩔 수 없다...) 

이를 개선하기 위해 스왑 메모리 등을 설정하는 방법도 있지만, 특성 상 이러한 임시 대비책을 사용하면 안되는 서버도 있기 때문에, 이러한 방법 만으론 온전하게 해결되었다고 보기도 좀 문제가 있다.

따라서 dev 환경 등엣 SWC를 적용하고 --watch 모드를 켠 상태로 접속하여 사용 및 코드 수정 -> 빌드 -> 다시 테스트 이 환경을 히먄 tsc 로 컴파일을 할 때보다 월등히 안정적인 작업, 빠른 변경이 가능해진다. 

### 개발 환경의 최적화는 좋다.. 하지만 

tsc 는 오래 걸리며, 메모리가 피크 되는 순간마다 인스턴스는 죽을 걱정(?)을 해야 할 수 있다. 제일 문제는 수 초 씩 걸리는 과정이 은근히 하고 있던 작업의 맥을 끊거나 흐름을 끊는 역할을 한다는 점이고, 이는 집중하여 개발하는 과정을 도와주기 보단 버퍼를 자꾸 일으키는 방해 요소가 된다. ~~그러라고 성능 좋은 로컬 환경이 필요한 거다~~ 

SWC의 도입은 이러한 점에서 충분히 훌륭하다. 이러한 파격적인 성능, 개발 시의 안정성을 제공해주는 것은 좋았지만, 한가지 결정적인 문제는 계속 언급되는 '타입 체크' 의 부재이다. 

![](/assets/images/posts/2025-06/2025-06-02-0001.png)
> 동일한 브랜치에서 tsc 컴파일러로 빌드를 했을 때

![](/assets/images/posts/2025-06/2025-06-02-0002.png)
> 동일한 브랜치에서 SWC 컴파일러로 빌드를 했을 때 

타입체크는 TypeScript의 근본이다. JS의 막무가내 스럽고, 당혹스러울 정도의 '강력함'을 정리하고 다듬어서, 에러를 최소화 시키기 위한 패러다임이 TypeScript이다. 아무리 욕을 먹거나, TS를 배제하려고 해도 여전히 TypeScript가 배제되지 않는 것은 JS가 가진 한계를 매우 유용하게 보완해주기 때문이다. 

그런데 SWC는 이를 가볍게 무시해준다. 같은 환경이지만, 수 많은 타입 에러를 무시해버린다. 심지어 그런 문제를 갖고 있는 데도 구동되고 일정하게 서벅 '실행된다'. 이건 매우 큰 문제였다. dev 환경에서 SWC 를 기반으로 작업을 하고 테스트 할 때는 전혀 문제가 아닌 기능들이, 막상 production 환경에 올려놓고 보면 다른데서 터지거나 하는 일이 발생하고 그제서야 서버가 뻗을 수 있다. 왜냐면 타입이 제대로 지정이 안되거나 버그가 있지만, 내가 작업하던 곳, 내지는 SWC 상태에서는 어떻게든 돌려버리는 것이다.

몇 번이나 CTO에게 이 부분을 지적받고 난 이후, SWC 없이 작업하기 너무 싫다고 생각은 하지만, 동시에 내가 만능이 아닌 이상 TypeError에 대한 두려움, 확신이 없는 상태로 괜찮은가? 라고 생각했다. 그렇기에 반드시 검사 내지는 tsc 를 활용한 완벽한 타입 체킹이 필요하다고 생각했다. (참고로 SWC도 설정을 켜서 할 수 있으나, 완벽하지 않다.) 

## 그렇기에..

SWC 는 개발하기에 매우 편안한 환경을 구현해준다. 하지만 결정적으로 급박하게 개발하는 과정이라고 해도, 빨라서 편하다고 해도, Type 에러 발생, 라이브 서버 폭발이라는 사태는 정말 막아야 한다. 나름대로의 대안이 필요했다. 따라서 초기에는 이를 위한 해결 방법을 고안했다.

### 초기(다 알지 못할 때)
tsc / SWC 를 컨버팅하는 script를 제작, 해당 스크립트를 package.json 에서 동작하도록 설정하였었다. 

```shell
#!/bin/bash
#9 설정 파일 교체 함수
update_config_files(){
    echo "Updating configuration files..."
    if ! cp "$BUILDER_CONFIG_FILE" "$NEST_CLI_FILE"; then
        error_handler "Failed to update $NEST_CLI_FILE"
    fi
    if ! cp "$TSCONFIG_CONFIG_FILE" "$TSCONFIG_FILE"; then
        error_handler "Failed to update $TSCONFIG_FILE"
    fi

    echo "Successfully updated $NEST_CLI_FILE and $TSCONFIG_FILE with $BUILDER_TYPE Compiler."
}

.
.
.


# 11 메인 로직 
main() {
    # 로깅 설정
    setup_logging

    # 로깅 설정 후 원래의 에러 핸들러 설정
    trap 'error_handler "Line ${LINENO}: $BASH_COMMAND" ' ERR
    
    validate_input "$@"
    if [ -t 1 ]; then clear; fi
    check_files
    create_backup
    update_config_files
    if [ -t 1 ]; then clear; fi
    cleanup_backup

    if [ -t 1 ]; then clear; fi
    case "$BUILDER_TYPE" in
        "swc")
            echo "----------------------------------------"
            echo "✨ SWC compiler does not need to clear cache"
            echo "----------------------------------------"
            ;;
        "origin")
            yarn cache clean || echo "Warning: yarn cache clean failed, ignoring."
            if [ -t 1 ]; then clear; fi
            echo "----------------------------------------"
            echo "✨ Clear Yarn Cache"
            echo "----------------------------------------"
            ;;
    esac
    sleep 1
    if [ -t 1 ]; then clear; fi

    if [ -t 1 ]; then clear; fi
    echo "----------------------------------------"
    echo "✨ Compiler is switched $BUILDER_TYPE"
    echo "----------------------------------------"
    if [ -t 1 ]; then clear; fi
}

main "$@"
exit 0
```

전체 코드를 다 올리지 못하고 부분만 올렸지만, 핵심은 빌드를 담당하는 tsconfig.json 과 nest-cli.json을 교체하는 방식이다. 매우 무식하지만(?) 확실하게 변경이 되었고, 원하면 각 상황마다 다른 옵션을 추가할 수 있다는 점에선 아주 괜찮았다. 

### 현재 개선 방향 

현재는 컴파일러를 공부하면서 타입 체크 기능만 구동할 수 있다는 것을 알게 되면서, ~~나의 무지함을 이해했다(...).~~
그러나 막상 확인해보니, 단순히 타입 체킹만을 tsc 에게 넘기는 것 만으로는 완벽하게 기본값의 환경을 만들진 못했다. 

대표적으로 debug 모드, vsc 디버그 모드를 사용하는 입장에선 SWC 상태론 지원이 정상적이지 못하여 대체가 불가능했다. (결국 컴파일러를 이중으로 쓰기 + 짧게 필요할 땐 타입 검사만 의 구조를 차용해야 한다.) 혹시나 이것에 대한 조언을 해줄 수 있는 분이 있다면 좋을것 같다...😂

#### 환경별 정리
1. 개발 환경 + Dev 환경 => 빠른 체킹 & 테스팅을 위해 SWC 기반의 타입체킹 배제
2. debug 환경 => SWC 로 구동하기 어려울 수 있음. 에러 핸들링을 포함해 아직 호환이 안되므로 tsc 를 그대로 사용할 것
3. Prod, Staging 환경 => lint 포함, 타입 체킹 사전 진행 => 미 통과시 배포 중단 및 알림

#### 환경별 스크립트
1. 간단하게 빌드 전 테스팅 방법

    ```shell
    # tsc 타입 검사 성공 시 build 를 수행(SWC)
    yarn tsc --noEmit && yarn build:fast
    ```

2. husky 를 활용하여 

    ```shell
    #!/bin/sh
    # husky / pre-push 문서 

    # run_command 는 로깅을 포함한 함수 실행부로 공통으로 명령어를 대신 수행하는 함수 스크립트

    # 공통 함수 로드
    . "$(dirname "$0")/common.sh"

    # 명령어 실행
    run_command "lint" "yarn lint --max-warnings=0" || exit 1

    # type checking 
    run_command "type-check" "yarn typecheck" || exit 1
    # run_command "build" "yarn build:external" || exit 1
    # 깃 최상위 위치 체크, 이동하여서 항상 dist 폴더가 삭제 되도록 함
    # run_command "clean dist" "git rev-parse --show-toplevel && cd \$(git rev-parse --show-toplevel) && rm -rf dist" || exit 1

    echo "🚀 All checks passed! Pushing..."

    ```

## 마치며 
Rust 는 이런 영역에서 점점 빛을 발하고 있다는게 느껴진다. Rust 기반 백엔드 성능도 상당하다고 들었지만, 컴파일러로의 SWC 는 개발 생산성 향상에서 정말 괜찮은 도구이며, 다소 아쉬움은 있지만, 빌드의 시간이 정말 '월등히' 빨라지기 때문에 확실히 초반부터 도입하고 사용하는 것을 기본으로 깔고 가는 것이 좋다.

단, 부재의 제목처럼, 한계가 작게 있고, 작긴 한데 그 작은 한계가 매우 위험 할 수 있다는 것은 주의가 필요해 보인다. 타입체킹이 안되고, 이에 대해 고려하지 않으면 타입 문제가 발생할 수 있다. 또한 어디까지나 확실한 영역은 아니지만 최신의 언어나 프레임워크까지 가버리면 SWC 의 트랜스파일링의 결과물이 tsc 의 그것과 다를 수 있다는 평가도 있다는 점은, 반드시 이에 대한 안전망을 확보하는 것을 최 우선으로 필요하다고 보며, 개발 환경자체에서 어렵다면 CICD 파이프라인 속에 해당 절차를 넣어두는 것이 좋아 보인다.