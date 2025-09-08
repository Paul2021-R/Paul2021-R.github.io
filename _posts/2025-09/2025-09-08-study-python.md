---
layout: post 
title: 코테 학습 - '유연 근무제'
subtitle: 파이썬 학습 내용 정리
categories: 학습
tags: python 이직 학습 코딩테스트
thumb: /assets/images/posts/python/2025-09-02-001.png
custom-excerpt: 파이썬 코딩 테스트 학습 
banner:
  # video: https://vjs.zencdn.net/v/oceans.mp4
  loop: true
  volume: 0.8
  muted: true                 # For mobile device background music play 
  start_at: 8.5
  image: /assets/images/posts/python/2025-09-02-001.png
  opacity: 0.318
  background: "#000"
  height: "100vh"
  min_height: "38vh"
  heading_style: "font-size: 4.25em; font-weight: bold; text-decoration: underline"
  subheading_style: "color: gold"
---

## Introduction

본 글은 원본 문제를 기반으로 풀이한 내용을 담고 있습니다. 

[원본 문제 보러가기](https://school.programmers.co.kr/learn/courses/30/lessons/388351)

## 2025년 9월 8일: 프로그래머스 코딩 테스트 '출근 이벤트' 문제 풀이 (Python)

프로그래머스 코딩 테스트 문제 중 '출근 이벤트'라는 문제를 풀이하였다. 유연근무제를 시행하는 회사에서 직원들의 출근 희망 시각과 실제 출근 기록을 바탕으로 상품을 받을 직원이 몇 명인지 계산하는 문제였다. 초기 풀이 후, 코드 리뷰를 통해 더 효율적이고 '파이썬스러운' 코드로 개선하는 과정을 거쳤다.

### 문제의 핵심 (Core of the Problem)

문제의 핵심은 크게 두 가지였다.

1.  **출근 인정 시각 계산:** 직원들이 설정한 출근 희망 시각에 10분을 더한 시각까지 출근을 인정한다는 점이다. 여기서 단순히 숫자를 더하는 것이 아니라, 분이 60분을 넘어가면 시간(Hour)이 바뀌는 경우를 정확하게 처리해야 했다.
2.  **주말 제외 및 요일 계산:** 토요일과 일요일은 이벤트에 영향을 주지 않으므로, 이 날짜들은 출근 여부 확인에서 제외해야 했다. `startday`를 기준으로 요일을 정확히 계산하여 평일(월~금)에만 조건을 적용하는 것이 중요하였다.

### 초기 풀이 과정 (Initial Solution Process)

처음에는 다음과 같은 단계로 문제를 해결하였다.

1.  **`makeMaxLimit(limit)` 함수 구현:**
    * 주어진 `limit`에 10분을 더하여 출근 인정 시각을 계산하는 핵심 함수였다.
    * **접근 방식:** 시각을 **문자열로 변환**하여 시(hour)와 분(minutes)을 분리하였다.
    * 분에 10을 더한 후, 60 이상이 되면 시를 1 증가시키고 분에서 60을 빼는 로직을 적용하였다.
    * 최종 시와 분을 다시 정수 형태의 시각으로 변환하여 반환하였다.

2.  **헬퍼(Helper) 함수 구현:**
    * **`isPass(dayNumber)`:** `dayNumber`가 평일(1~5)인지 확인하는 함수.
    * **`checkCondition(limit, targetTime)`:** 출근 시각이 인정 시각 내에 있는지 확인하는 함수.

3.  **`solution` 메인 함수:**
    * 초기 `answer`는 전체 직원 수로 설정하고, 지각 시 **1씩 차감**하는 방식을 사용하였다.
    * 요일 계산은 `index` 변수를 1씩 증가시키고, 8이 되면 1로 초기화하는 방식을 사용하였다.
    * **`eventTarget`이라는 플래그 변수**를 두어 직원의 지각 여부를 추적하고, 반복문이 끝난 뒤 이 플래그를 확인하여 `answer`를 차감하였다.

```python
def isPass(dayNumber):
    if dayNumber < 6:
        return True
    else: 
        return False
    
def checkCondition(limit=int, targetTime=int):
    if targetTime <= limit:
        return True
    else: 
        return False

def makeMaxLimit(limit) -> int:
    """핵심중에 핵심으로 시간의 10분 추가 되었을 때 어떻게 처리할지를 판단하는 부분. 최대 유효 시간이 10분이고, 10분 추가시 분과 시간의 변화를 고려해야함"""
    limitStr = str(limit)
    limitStrHour = ''
    limitStrMinutes = ''

    if len(limitStr) == 3:
        limitStrHour = limitStr[0:1]
        limitStrMinutes = limitStr[1:]
    else:
        limitStrHour = limitStr[0:2]
        limitStrMinutes = limitStr[2:]
    
    limitIntHour = int(limitStrHour)
    limitIntMinutes = int(limitStrMinutes) + 10

    if limitIntMinutes >= 60:
        limitIntHour += 1
        limitIntMinutes -= 60

    limit = str(limitIntHour * 100 + limitIntMinutes)

    return int(limit)

def solution(schedules, timelogs, startday):
    # 목표 스케쥴 => 명수, 목표 기준 확인
    # timelogs => 분해, 기준 비교 => startDay 검토하여 스킵할 날짜 체크 => 문제 없으면 상품 제공

    # n 명의 상황 기록 => 기록 배열 분리 
    # start day 기준으로 체킹 => 도중에 이벤트 조건에 맞지 않으면 => 문제
    # 가장 효과적인 데이터 타입은? 
    targetList = []
    for i, value in enumerate(schedules):
        target = (i, {
            "limit": makeMaxLimit(value),
            "timelog": timelogs[i]
        })
        targetList.append(target)

    answer = len(targetList)

    for target in targetList:
        limit = target[1]["limit"]
        history = target[1]["timelog"]
        index = startday
        eventTarget = True
        for log in history:
            if isPass(index) and not checkCondition(limit, log):
                eventTarget = False
            index += 1
            if index == 8:
                index = 1
        if not eventTarget:
            answer -= 1
                
    return answer
```

### 코드 개선과 새로운 교훈 (Code Improvement and New Lessons)

초기 풀이도 정답이었지만, 코드의 효율성, 가독성, 그리고 '파이썬스러움'에 대해 깊이 배우며 다음과 같이 코드를 개선할 수 있었다.

1.  **시간 계산의 효율화: 문자열 변환 vs 산술 연산**
    * 가장 큰 깨달음이었다. 문자열로 변환하고 슬라이싱하는 대신, **몫(`//`)과 나머지(`%`) 연산**을 사용하면 훨씬 간결하고 빠르게 시간 계산이 가능했다. 이는 불필요한 형 변환 비용을 줄여주는 효율적인 방법이다. 수학적으로 생각을 하는게 중요한데... 쉽지 않다 ㅠ
    * `(개선 후) limit_hours = limit // 100`, `limit_minutes = limit % 100 + 10`

2.  **Pythonic 네이밍 컨벤션: `snake_case`**
    * TypeScript 와 NestJS 에 절여진 내 뇌는 여전히 카멜을 쓰게 만들었다... 파이썬에서는 함수와 변수명에 `camelCase`가 아닌 `snake_case`를 사용하는 것이 **PEP 8** 스타일 가이드의 표준이라는 것을 배웠다. (예: `makeMaxLimit` -> `make_max_limit`) 이는 코드의 가독성과 파이썬 커뮤니티 내의 일관성을 위한 중요한 약속이다.

3.  **효율적인 순회와 플래그 변수 제거: `zip`과 `for-else`**
    * 별도의 데이터 구조를 만들 필요 없이 `zip(schedules, timelogs)`를 사용하면 두 리스트를 깔끔하게 병렬로 순회할 수 있었다.
    * 가장 신기했던 것은 **`for-else` 구문**이었다. 이 구문을 사용하면 `eventTarget`과 같은 **플래그 변수 없이도** "반복문이 `break`로 중단되지 않고 무사히 끝났을 때"를 처리할 수 있었다. 이는 코드를 훨씬 직관적이고 우아하게 만들어 주었다. 진짜 희안한게 무지하게 많은 Python...

4.  **직관적인 로직: 차감보다 덧셈, 순환에는 나머지 연산**
    * 전체에서 차감하는 방식보다, **조건을 통과한 대상만 세는 방식(`answer = 0` 시작)**이 로직을 더 이해하기 쉽게 만들었다.
    * 요일을 계산할 때 `if`문으로 8이 되는지 검사하는 대신, **나머지 연산자(`%`)**를 활용(`(startday + index - 1) % 7 + 1`)하여 순환하는 값을 훨씬 간결하게 처리할 수 있었다.

5.  **성능 개선**
    * 기존 코드는 1000개 까지 변수가 들어올 수 있고, 실제 풀이시 4ms 정도로 속도가 오래 걸렸다. 그러나 신규 코드로 개선으로 루프가 1회로 줄어들면서, 1ms 이하로 떨어지게 만들어낼 수 있었다.

### 개선의 결과 (The Result of Improvement)

이러한 배움을 통해 코드는 다음과 같이 발전하였다.

* **가독성:** `snake_case` 적용, `zip`, `for-else` 구문 활용으로 코드의 의도가 훨씬 명확해졌다.
* **간결성:** 불필요한 `if-else`문, 플래그 변수, 복잡한 요일 계산 로직이 제거되어 코드가 짧고 깔끔해졌다.
* **효율성:** 비효율적인 문자열 변환 로직이 빠른 산술 연산으로 대체되었다.
* **Pythonic:** 코드가 파이썬의 철학과 스타일에 더 가까워져, 다른 파이썬 개발자가 이해하기 쉬운 코드가 되었다.

```python
# 개선 버전

def is_pass(dayNumber):
    return dayNumber < 6

def make_max_limit(limit) -> int:
    limit_hours = limit // 100
    limit_minutes = limit % 100 + 10

    if limit_minutes >= 60:
        limit_hours += 1
        limit_minutes -= 60

    return limit_hours * 100 + limit_minutes

def solution(schedules, timelogs, startday):

    answer = 0 

    for limit, logs in zip(schedules, timelogs):
        max_limit = make_max_limit(limit)
        for index, log in enumerate(logs):
            current_day = (startday + index - 1) % 7 + 1
            if is_pass(current_day) and log > max_limit:
                break
        else: # for - else 구문 처음 봄 개신기 
            answer += 1

    return answer
```