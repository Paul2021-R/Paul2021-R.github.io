---
layout: post 
title: 코테 학습 - '동영상 재생기'
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

[원본 문제 보러가기](https://school.programmers.co.kr/learn/courses/30/lessons/340213?language=python3)

## 2025년 9월 19일: 프로그래머스 코딩 테스트 '동영상 재생기' 문제 풀이 (Python)

### 문제 정리

  * **목표**: 주어진 명령어(`prev`, `next`)를 모두 수행한 후 동영상의 최종 재생 위치를 "mm:ss" 형식으로 반환하는 문제이다.
  * **핵심 기능**:
    1.  **10초 전/후 이동**: `prev`와 `next` 명령을 수행하며, 영상의 시작(00:00)과 끝(video\_len)을 벗어나지 않도록 처리한다.
    2.  **오프닝 자동 건너뛰기**: 현재 재생 위치가 오프닝 구간(`op_start` \~ `op_end`)에 포함될 경우, 즉시 오프닝이 끝나는 위치(`op_end`)로 자동 이동한다. 이 기능은 사용자의 명령어와 관계없이 위치가 변경될 때마다 적용되어야 하는 핵심 규칙이다.

-----

### 코드 개선 과정 분석

#### [1단계] 최초 풀이: 분(minute)과 초(second)를 분리하여 처리

```python
from typing import Tuple

def prev_pos(current_pos: Tuple[int, int])-> Tuple[int, int]:
    if current_pos[1] >= 10:
        current_pos[1] -= 10
    elif current_pos[1] < 10:
        current_pos[0] -= 1
        current_pos[1] = current_pos[1] + 60 - 10
        
    if current_pos[0] < 0 or (current_pos[0] == 0 and current_pos[1] < 0):
        current_pos[0] = 0
        current_pos[1] = 0
    return current_pos

def next_pos(current_pos: Tuple[int, int], op_end: str)-> Tuple[int, int]:
    current_pos[1] += 10
    
    if current_pos[1] > 59:
        current_pos[0] += 1
        current_pos[1] = 0
        
    end_hour, end_minutes = get_int_time(op_end)
    
    if current_pos[0] > end_hour or (current_pos[0] == end_hour and current_pos[1] > end_minutes):
        current_pos[0] = end_hour
        current_pos[1] = end_minutes
    
    return current_pos

def skip_opening(current_pos: Tuple[int, int], op_start: str, op_end: str)-> Tuple[int, int]:
    start_time = get_int_time(op_start)
    end_time = get_int_time(op_end)
    
    start_total_time = start_time[0] * 60 + start_time[1]
    end_total_time = end_time[0] * 60 + end_time[1]
    current_total_time = current_pos[0] * 60 + current_pos[1]
    
    if start_total_time <= current_total_time and current_total_time <= end_total_time:
        current_pos = [end_time[0], end_time[1]]
    return current_pos
def get_str_time(current_pos: Tuple[int, int] )-> str:

    
    hour = str(current_pos[0])
    minute = str(current_pos[1])
    if len(hour) == 1:
        hour = f'0{hour}'
    if len(minute) == 1:
        minute = f'0{minute}'
    return f'{hour}:{minute}'

def get_int_time(time: str)-> Tuple[int, int]:
    return [int(time[:2]), int(time[3:5])]

def solution(video_len, pos, op_start, op_end, commands):
    answer = ''
    
    current_pos = get_int_time(pos)

    for command in commands:
        current_pos = skip_opening(current_pos, op_start, op_end)
        
        if command == 'next':
            current_pos = next_pos(current_pos, video_len)
        elif command == 'prev':
            current_pos = prev_pos(current_pos)
    
    current_pos = skip_opening(current_pos, op_start, op_end)
    answer = get_str_time(current_pos)
    
    return answer
```

첫 번째 코드는 시간 데이터를 `[분, 초]` 형태의 리스트(혹은 튜플)로 다루는 방식이다.

```python
# 1단계 코드 (주요 부분)
from typing import Tuple

def prev_pos(current_pos: Tuple[int, int])-> Tuple[int, int]:
    if current_pos[1] >= 10:
        current_pos[1] -= 10
    elif current_pos[1] < 10:
        current_pos[0] -= 1
        current_pos[1] = current_pos[1] + 60 - 10
    # ...경계 값 처리...
    return current_pos

def solution(video_len, pos, op_start, op_end, commands):
    current_pos = get_int_time(pos) # [분, 초] 리스트 반환
    # ... (생략) ...
```

  * **접근 방식**:
      * 시간을 '분'과 '초' 두 개의 단위로 유지하며 모든 연산을 수행했다.
  * **분석 및 문제점**:
      * **로직의 복잡성**: 10초를 더하고 뺄 때, 60초를 기준으로 받아올림/내림 처리를 해야 하므로 `if-elif` 조건문이 복잡해진다. 예를 들어 `prev_pos`에서 `03:05`에서 10초를 빼는 경우 `02:55`로 만들기 위한 연산이 직관적이지 않다.
      * **비교 연산의 번거로움**: `skip_opening`과 같이 시간의 선후 관계를 비교할 때, 분과 초를 각각 비교해야 하므로 코드가 길어지고 실수할 가능성이 커진다.
      * **데이터 타입의 불일치**: 타입 힌트는 불변(immutable) 객체인 `Tuple`로 지정했지만, 실제로는 `current_pos[1] -= 10`처럼 내부 값을 변경하고 있어 가변(mutable) 객체인 `List`처럼 사용했다. 이는 잠재적인 오류를 유발할 수 있는 좋지 않은 패턴이다.

#### [2단계] 개선: 단위를 '초(second)'로 통일

```python

def prev_pos(current_pos: int)-> int:
    current_pos -= 10
    if current_pos < 0:
        current_pos = 0
    return current_pos

def next_pos(current_pos: int, video_length: str)-> int:
    current_pos += 10
    video_end = get_int_time(video_length)
    
    if current_pos > video_end:
        current_pos = video_end
    
    return current_pos

def skip_opening(current_pos: int, op_start: str, op_end: str)-> Tuple[int, int]:
    start_time = get_int_time(op_start)
    end_time = get_int_time(op_end)
    
    if start_time <= current_pos and current_pos <= end_time:
        current_pos = end_time
    return current_pos

def get_str_time(current_pos: int)-> str:
    hour = str(current_pos // 60)
    minute = str(current_pos % 60)
    if len(hour) == 1:
        hour = f'0{hour}'
    if len(minute) == 1:
        minute = f'0{minute}'
    return f'{hour}:{minute}'

def get_int_time(time: str)-> int:
    return int(time[:2]) * 60 +  int(time[3:5])

def solution(video_len, pos, op_start, op_end, commands):
    answer = ''
    
    current_pos = get_int_time(pos)

    for command in commands:
        current_pos = skip_opening(current_pos, op_start, op_end)
        
        if command == 'next':
            current_pos = next_pos(current_pos, video_len)
        elif command == 'prev':
            current_pos = prev_pos(current_pos)
    
    current_pos = skip_opening(current_pos, op_start, op_end)
    answer = get_str_time(current_pos)
    
    return answer
```

첫 풀이의 복잡성을 해결하기 위해 모든 시간 단위를 '초'로 통일했다. 이는 문제 해결의 **가장 결정적인 개선점**이다.

```python
# 2단계 코드 (주요 부분)
def prev_pos(current_pos: int)-> int:
    current_pos -= 10
    if current_pos < 0:
        current_pos = 0
    return current_pos

def get_int_time(time: str)-> int:
    return int(time[:2]) * 60 +  int(time[3:5])

def solution(video_len, pos, op_start, op_end, commands):
    current_pos = get_int_time(pos) # '초' 단위 정수 반환
    # ... (생략) ...
```

  * **접근 방식**:
      * 모든 "mm:ss" 형식의 시간을 `get_int_time` 함수를 통해 '초' 단위의 정수(integer)로 변환하여 계산했다.
  * **분석 및 개선 효과**:
      * **연산의 단순화**: 시간 계산이 `+10`, `-10`과 같은 단순한 정수 연산으로 바뀌어 코드가 매우 간결해지고 명확해졌다.
      * **비교의 용이성**: 시간 비교 역시 정수의 크기 비교(`<=`, `>=`)로 단순화되어 `skip_opening` 로직이 직관적으로 변했다.
      * **오류 가능성 감소**: 복잡한 받아올림/내림 로직이 사라져 버그가 발생할 여지가 크게 줄었다.
  * **남은 개선점**:
      * `next_pos`, `skip_opening` 함수가 루프 안에서 호출될 때마다 `get_int_time` 함수를 통해 문자열을 정수로 변환하는 **불필요한 반복 연산**이 여전히 존재한다.
      * 오프닝 스킵 로직의 적용 시점이 루프 전/후로 나뉘어 있어 더 깔끔하게 정리할 여지가 있다.

#### [3단계] 최종 풀이: Pythonic 코드 적용 및 로직 최적화

2단계에서 이룬 구조적 개선 위에, 코드의 효율성과 가독성을 극대화하는 Pythonic한 기법들과 로직 최적화를 적용한 최종 버전이다.

  * **접근 방식**:
      * 반복 연산을 제거하고, 파이썬 내장 기능과 더 효율적인 로직 흐름을 적용하여 코드를 완성했다.
  * **핵심 개선점**:
    1.  **사전 연산 (Pre-computation)**: `solution` 함수 시작 시점에서 필요한 모든 시간 문자열(`video_len`, `op_start` 등)을 '초' 단위 정수로 **미리 한 번만 변환**하여 변수에 저장한다. 이를 통해 루프 내에서 반복적인 변환 작업을 완전히 제거하여 효율성을 높였다.
    2.  **Pythonic 경계 값 처리**: `prev`와 `next` 기능에서 `if`문을 사용하여 0과 영상 최대 길이를 확인하는 대신, `max(0, ...)`와 `min(video_len_sec, ...)`를 사용하여 코드를 한 줄로 줄이고 의도를 더 명확하게 표현했다.
    3.  **Pythonic 시간 포맷팅**: `get_str_time` 함수에서 `divmod()`를 사용해 몫(분)과 나머지(초)를 한 번에 계산하고, f-string의 `:02d` 서식 지정자를 이용해 두 자리 수에 맞춰 0을 채우는 가장 표준적이고 깔끔한 방식을 사용했다.
    4.  **로직 흐름 최적화**: 오프닝 스킵 로직을 **'상태가 변경될 때마다 유효성을 검사하는'** 개념으로 접근했다.
          * **초기 상태 보정**: 루프 시작 전, 최초 위치에 대해 스킵 검사를 먼저 수행한다.
          * **변경 후 보정**: 명령어 실행으로 위치가 변경된 직후에만 스킵 검사를 수행한다.
          * 이 두 번의 검사로 모든 경우를 처리하여, 루프 전과 후로 로직이 나뉘어 있던 2단계 코드보다 훨씬 더 명료한 흐름을 완성했다.

-----

### 최종 버전 코드 및 설명

```python
# 시간 변환 함수: 초 단위 정수와 "mm:ss" 문자열을 상호 변환한다.
def get_int_time(time: str) -> int:
    return int(time[:2]) * 60 + int(time[3:5])

def get_str_time(current_pos: int) -> str:
    # divmod로 몫(분)과 나머지(초)를 한 번에 계산한다.
    minutes, seconds = divmod(current_pos, 60)
    # f-string 포맷팅으로 두 자리가 아닐 경우 앞에 0을 붙여준다.
    return f'{minutes:02d}:{seconds:02d}'

def solution(video_len, pos, op_start, op_end, commands):
    # [최적화 1] 모든 시간 값을 미리 한 번만 정수로 변환한다.
    video_len_sec = get_int_time(video_len)
    op_start_sec = get_int_time(op_start)
    op_end_sec = get_int_time(op_end)
    current_pos_sec = get_int_time(pos)
    
    # 오프닝 스킵을 위한 지역 헬퍼 함수. solution 내부 변수에 접근하기 용이하다.
    def check_and_skip_opening(pos_sec: int) -> int:
        if op_start_sec <= pos_sec <= op_end_sec:
            return op_end_sec
        return pos_sec
    
    # [로직 최적화] 1. 초기 위치에 대한 오프닝 스킵을 먼저 적용한다.
    current_pos_sec = check_and_skip_opening(current_pos_sec)
    
    for command in commands:
        if command == 'next':
            # [최적화 2] min()을 사용해 영상 길이를 넘지 않도록 처리한다.
            current_pos_sec = min(video_len_sec, current_pos_sec + 10)
        elif command == 'prev':
            # [최적화 2] max()를 사용해 0 미만으로 내려가지 않도록 처리한다.
            current_pos_sec = max(0, current_pos_sec - 10)
    
        # [로직 최적화] 2. 명령어로 위치가 바뀐 직후, 다시 오프닝 스킵을 적용한다.
        current_pos_sec = check_and_skip_opening(current_pos_sec)
    
    return get_str_time(current_pos_sec)

```