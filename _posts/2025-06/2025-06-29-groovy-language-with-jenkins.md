---
layout: post 
title: Jenkins 를 위한 Groovy 스크립트 언어 정리
subtitle: Jenkins 이자식... 어려운척 하는데 사실 별거 아니긴 함
categories: 개발
tags: Backend DevOps Programming Groovy 학습
thumb: https://www.stickersdevs.com.br/wp-content/uploads/2022/01/jenkins-adesivo-sticker.png
custom-excerpt: Jenkins 를 위한 Groovy 스크립트 언어 정리
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  video: https://cdn.pixabay.com/video/2019/10/04/27539-364430966_large.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: https://www.stickersdevs.com.br/wp-content/uploads/2022/01/jenkins-adesivo-sticker.png
  opacity: 0.618
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---


# Jenkinsfile 작성 튜토리얼 

본 내용은 Jenkins 파이프라인 구축 전에 이해도를 위하여 언어에 대한 간단한 가이드를 정리한 내용이다.

## 들어가기 전에 1: 왜 GUI가 아닌 스크립트 형태로 써야 하는가?

Jenkins 는 강력한 플랫폼이다. 다양한 대체제가 나왔음에도 여전히 인정받는 CI/CD 를 위한 툴이며, 그 플러그인과 커뮤니티, 레퍼런스들의 존재들은 여전히 영향력 있는 툴이라는 점을 보여준다. 

GUI로 설정 대신 스크립트로 작성해야 하는 이유는 다음과 같다. 

1. 버전 관리 용이, 협업 용이성 : GUI 로 설정을 수행하는 것은 스크립트 형태로 내보낼 수 있으나, 그 스크립트 자체는 Git 과 같은 버전 관리 시스템 통합하기 까다롭다. `Jenkinsfile` 은 프로젝트 소스 코드와 함께 저장하여 관리하여, **파이프라인 변경 이력**을 Git 으로 완벽히 추적할 수 있고, 이는 긴급 상황이나, 개선이 필요시 쉽게 작업이 가능하다.
2. 재현성(Reproducibility)과 환경 일관성 : Jenkinsfile 은 파이프라인의 모든 단계를 코드로 정의 내리며, 새로운 Jenkins 인스턴스를 설정하거나 다른 팀에 동일한 파이프라인을 제공시, 스크립트만 복사하면 된다. 이러한 점에서 GUI 보다 효과적이고, **환경의 일관성**을 증대시킬 수 있다. 
3. 복잡하고 동적인 로직 구현 : GUI 방식은 미리 정의된 블록, 제한된 옵션을 활용해야 한다. 그러나 Groovy 언어 기반으로 스크립트를 하게 되면, 매우 유연하고 복잡한 로직을 구현할 수 있다. 이는 다양한 서비스 환경에 맞춤화한 파이프라인 구성이 가능하다는 점에서 매우 중요하다.
4. 개발 친화적 : 개발팀이 직접 CI/CD 파이프라인을 개선, 유지보수를 할 수 있는데, 이는 DevOps 문화의 핵심 요소다.
5. 오류 사전 감지 : Jenkinsfile은 문법 오류나 논리 오류를 Git 에 커밋하기 전에 Linter 등을 통해 미리 확인해보는 것이 가능하다. 

물론, 반대의견으로 GUI 로 만들어 스크립트로 보관을 이야기 하기도 한다. 
Jenkins에는 `Pipeline Syntax` 라는 기능으로 GUI 로 설정한 내용을 기반으로 Groovy 코드로 생성 및 보관이 가능하다. 하지만 다음과 같은 이유로 추천하진 않는다. 

1. GUI 에서 제공하는 기능만 사용 가능 : 복잡한 조건, 반복, 동적인 데이터 처리는 결국 손이 감
2. 복사-붙여넣기 오버헤드 : GUI 에서 설정을 불러와 이를 Jenkinsfile에 넣어야 하는 추가 과정이 발생
3. 버전관리의 완전한 통합 부족 : Jenkinsfile 이라는 파일로 관리 되어야 할텐데, 그렇지 못함. 

## 들어가기 전에 2: Jenkinsfile을 프로젝트 내부에 보관해야 하는 이유는? 
1. 버전관리: Git 저장소에 함께 관리될 수 있으니 애플리케이션 코드와 함께 관리가 가능하여 Git 을 활용한 완벽한 추적이 가능.
2. 재현성 및 환경 일관성: 어떤 환경, 어떤 Jenkins 서버세서든 프로젝트 코드만 Git으로 클론하면 Jenkinsfile 이 함께 따라와서, 동일한 CI/CD 파이프라인을 재현할 수 있다.
3. 개발자 협업: CI/CD 파이프라인 설정이 코드베이스에 포함되어 개발자들도 파이프라인에 대한 변경 사항을 코드리뷰로 기여할 수 있고, 이는 DevOps 문화 개발, 협업을 강화하는데 기여.
4. 프로젝트 종속성: 파이프라인은 해당 프로젝트의 빌드, 테스트, 배포 단계를 정의하는데, 각 프로젝트 요구사항에 맞춰 Jenkinsfile 을 개별적으로 관리하는게 효율적.
5. 새로운 Jenkins 서버 설정의 용이성: 향후 Jenkins 서버를 새로 구축하거나 재설정 시 각 프로젝트에 존재하니, 다시 연결만 해주면 모든 파이프라인의 설정이 자동 복구됨.

## Groovy 언어

Groovy 언어는 Java와 매우 유사하면서도 더 간결하고 유연한 문법을 제공하는 스크립트 언어다. Jenkinsfile에서는 주로 데이터 처리, 조건문, 반복문, 함수 호출 등에 사용된다.

### Groovy 언어 기본 튜토리얼 (Jenkinsfile을 위한 핵심)

여기서는 Jenkinsfile을 작성하는 데 필요한 Groovy의 **핵심적인 문법과 개념**을 위주로 설명한다.

#### 1\. 변수 선언과 데이터 타입

Groovy는 변수 선언 시 `def` 키워드를 사용하거나, 명시적인 데이터 타입을 지정할 수 있다. 대부분의 경우 `def`를 사용하면 Groovy가 타입을 자동으로 추론한다.

```groovy
def name = "Jenkins" // 문자열 (String)
def version = 2.452   // 숫자 (정수 또는 실수)
def isRunning = true  // 불리언 (Boolean)
def list = ["apple", "banana", "cherry"] // 리스트 (List)
def map = ["key1": "value1", "key2": 123] // 맵 (Map)
```

#### 2\. 문자열 (Strings)

Groovy는 문자열 처리는 자바보다 유연하게 설계 되어 있다.

  * **따옴표:** 작은따옴표 (`'...'`)는 일반 문자열, 큰따옴표 (`"..."`)는 문자열 내 변수 삽입(GString)이 가능한 문자열을 나타낸다.
  * **GString (변수 삽입):** 큰따옴표 안에 `${변수명}` 또는 `$변수명` 형태로 변수를 직접 삽입할 수 있다. 

<!-- end list -->

```groovy
def buildNumber = 10
def jobName = "MyProject"

println "Build number is ${buildNumber}" // 결과: Build number is 10
println "Job name is $jobName"         // 결과: Job name is MyProject
println 'This is a simple string.'    // 변수 삽입 안 됨

// 여러 줄 문자열: """ 또는 '''를 사용
def multiLineString = """
Hello,
This is a multi-line string.
Build: ${buildNumber}
"""
println multiLineString
```

#### 3\. 리스트 (Lists)

iterable 한 데이터 컬렉션 기능. `[]` 대괄호를 사용한다.

```groovy
def fruits = ["apple", "banana", "orange"]

println fruits[0]      // 결과: apple (인덱스는 0부터 시작)
println fruits.size()  // 결과: 3 (리스트 크기)
fruits.add("grape")    // 요소 추가
println fruits         // 결과: [apple, banana, orange, grape]
```

#### 4\. 맵 (Maps)

키(key)와 값(value)의 쌍으로 이루어진 데이터 컬렉션이에요. `:` 또는 `=`를 사용하여 정의한다.

```groovy
def userInfo = ["name": "Alice", "age": 30, "city": "Seoul"]

println userInfo["name"]  // 결과: Alice
println userInfo.age      // 결과: 30 (점(.) 표기법도 가능)
userInfo.country = "South Korea" // 새 키-값 쌍 추가
println userInfo          // 결과: [name:Alice, age:30, city:Seoul, country:South Korea]
```

#### 5\. 조건문 (If/Else)

Java와 동일하게 `if`, `else if`, `else`를 사용한다.

```groovy
def status = "SUCCESS"

if (status == "SUCCESS") {
    println "배포 성공!"
} else if (status == "FAILURE") {
    println "배포 실패!"
} else {
    println "배포 상태 알 수 없음."
}
```

#### 6\. 반복문 (Loops)

`for` 루프와 `each` 클로저(함수)를 주로 사용한다.

```groovy
def items = ["item1", "item2", "item3"]

// for 루프
for (item in items) {
    println "Processing: $item"
}

// each 클로저 (더 Groovy스러운 방식)
items.each { item ->
    println "Processing with each: $item"
}

// 인덱스와 함께 반복 (eachWithIndex)
items.eachWithIndex { item, index ->
    println "Item ${index}: $item"
}
```

#### 7\. 함수 (Methods/Closures)

Jenkinsfile에서는 주로 `script` 블록 내에서 Groovy 함수를 정의하거나, 클로저를 활용한다.

```groovy
// 일반적인 함수 정의
def greet(name) {
    return "Hello, ${name}!"
}

println greet("World") // 결과: Hello, World!

// 클로저 (변수에 할당된 코드 블록)
def sayHi = { name ->
    println "Hi, $name"
}

sayHi("Bob") // 결과: Hi, Bob
```

#### 8\. try-catch (예외 처리)

스크립트 실행 중 발생하는 오류를 처리하여 파이프라인이 갑자기 중단되지 않도록 할 수 있음.

```groovy
try {
    def result = 10 / 0 // 0으로 나누기 오류 발생
    println result
} catch (Exception e) {
    println "오류 발생: ${e.message}"
} finally {
    println "오류 발생 여부와 상관없이 항상 실행되는 부분."
}
```

#### 9\. 외부 명령어 실행 (Shell Command)

Jenkinsfile에서 가장 많이 사용하는 기능 중 하나로, `sh` (Shell) 명령어를 통해 리눅스/유닉스 쉘 명령어를 실행하는 것이 가능하다.

```groovy
sh 'ls -al' // 파일 목록을 출력
sh 'echo "Hello from shell"' // 쉘에서 메시지 출력

// 여러 줄 명령
sh """
    echo "First line"
    echo "Second line"
"""

// 명령의 결과 받기
def output = sh(script: 'pwd', returnStdout: true).trim() // 현재 작업 디렉토리 경로를 pwd 로 실행하고 받아서, trim 처리하여 작업 디렉토리를 저장한다.
println "Current directory: $output"

// 명령의 성공/실패 여부만 확인
def success = sh(script: 'exit 0', returnStatus: true) // 성공하면 0 반환
def failure = sh(script: 'exit 1', returnStatus: true) // 실패하면 1 반환
println "Success: $success, Failure: $failure"
```

#### 10\. JSON/YAML 파싱

AWS CLI 명령의 결과가 JSON 형태인 경우가 많다. 이를 Groovy에서 파싱하여 데이터에 접근하는 방법을 알아두면 유용하다. `readJSON`이나 `readYaml` 같은 Jenkins Pipeline Step이 이를 도와서 처리해준다.

```groovy
def jsonString = '{"name": "test", "status": "success"}' // Json 을 읽어
def jsonData = readJSON(text: jsonString) //파싱 처리 => 객체화

println jsonData.name   // 결과: test
println jsonData.status // 결과: success
```

-----

## Groovy 학습 팁 & 알아두면 좋은 내용:

  * **Jenkins Pipeline Syntax Snippet Generator:** Jenkins 대시보드의 파이프라인 잡 설정 페이지에서 "Pipeline Syntax" 링크를 클릭하면 Snippet Generator를 사용할 수 있다. 여기서 원하는 Jenkins 스텝을 선택하고 설정을 채우면 해당 Groovy 코드를 자동으로 생성해 준다. 이것이 Groovy 문법을 익히는 데 가장 강력한 도구 중 하나다.
  * **Java 지식 활용:** Groovy는 Java와 매우 유사하므로, Java 경험이 있다면 빠르게 적응할 수 있다. 
  * **간결함 선호:** Groovy는 Java보다 더 적은 코드로 동일한 작업을 수행할 수 있는 "Syntactic Sugar"가 많다. 간결한 표현을 선호하는 경향이 있다.
  * Jenkins 를 위한 jenkins 파일의 구조를 이해하는 것이 실수를 줄이는데 중요하다. 
  * 글로벌 변수의 경우 최초 설정을 하긴 하지만, 기본적으로 Secret 등에 대해 우선 가져오는 구조로 설정은 불가능하다. 각 단계별로만 되고, 이러한 경우 에러 핸들링은 Jenkins 가 알아서 해준다는 점 알아둘것. 


-----

## 마치면서 

젠킨스랑 같이 산지도 어언 7개월 차. Unity 클라이언트 프로젝트를 쓰는 바람에 익숙한 Github 방식을 버리게 되어 다소 아쉽지만, 뭐 어떤가, 대세 기술 하나 제대로 파는건 당연히 필요하고, 특히나 jenkins 는 최소 3년 ~ 5년차에게 요구되는 기술이라는데 제대로 배워둘 필요가 있다고 느꼈다(일단 재미도 있다)

엄두도 안 났었던 내용인데, Docker 를 비롯해 한 두달 바짝 DevOps를 위한 여러 기술들을 고심하고, API 서버에 도입을 하나씩 해 나가니 생각보다 별거 아니란 생각에, 역시 양파 까듯 생각했어야 하는 구나 란 생각을 다시 한 번 해보았다.(처음엔 뭐 그리 부담스럽게 생각했던 것인지...)

이제 한 발자국 남았다. Jenkins 배포를 위한 file 작업 중이니 조만간 마무리 지어야지....🤔