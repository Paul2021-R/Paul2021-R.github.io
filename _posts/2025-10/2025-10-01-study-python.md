---
layout: post 
title: 코테 학습 - '지폐접기'
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

### 원본 문제
[원본 문제](https://school.programmers.co.kr/learn/courses/30/lessons/340199?language=python3)

### 문제 정리

  * **목표**: 규격인 wallet 에 맞는 가로, 세로 크기로 몇번 접어야 하는지 최소 값을 리턴할 것 
  * **핵심 기능**:
	1. 지폐를 접을 때는 항상 길이가 긴 쪽을 반으로 접는다. 
	2. 접기 전 길이 홀수 -> 접은 후 소수점 이하 버리기 
	3. 접힌 지폐를 그대로 또는 90도 돌리고 넣을 수 있다면 그만 접음

-----

### 코드 개선 과정 분석

#### [1단계] 최초 풀이: 놓친 지점은 조건 1
- 거의 조건을 완벽하게 해결했었음. 그러나 마지막 cond ~ 부분에서 조건을 잘못 생각했다. 핵심 조건은 길이가 긴쪽을 줄이는 것이지, 무조건 가로 또는 세로를 줄이는게 아니고 이점을 놓치면 잘못 계산되는 엣지 케이스가 발생하는 것이었다. 
- 따라서 cond 배열의 어느쪽이든 문제가 있다 -> 가로와 세로 중 긴 쪽을 우선 접어야 한다. 

```python
def solution(wallet, bill):
    answer = 0

    while True:
        width = bill[0]
        height = bill[1]
        cond = [0, 0]

        if width <= wallet[0]:
            if height <= wallet[1]:
                break
            else:
                cond[1] = 1

        else: 
            cond[0] = 1

        if height <= wallet[0]:
            if width <= wallet[1]:
                break
            else:
                cond[0] = 1
        else: 
            cond[1] = 1

        answer += 1
        if cond[0] == 1: # 여기 틀림!
            bill = [width // 2, height] # 그냥 긴 쪽을 접는 게 중요했다. 
        elif cond[1] == 1 and cond[0] != 1:
            bill = [width, height // 2] # 그냥 긴 쪽을 접는 게 중요했다. 

    return answer
```
#### [2단계] 최종 풀이: 조건의 확립 및 불필요한 코드 제거
1. 핵심 조건을 개선하여 엣지 케이스까지 대응이 가능해짐.
2. 그 외에 불필요한 변수들을 제거하기 시작했는데 다음과 같음
	1. 가로, 세로 변수 제거
	2. 조건은 명확하므로, `and`로 묶어 한줄로 처리 가능 
	3. cond 도 실제 무조건 `wallet`에 들어가는 조건이 아니면 무조건 긴 쪽을 접어야 하므로 필요 없음 
	4. 접어야 할 조건에 도착 시 배열값을 직접 수정해도 됨

-----

### 최종 버전 코드 및 설명

```python
def solution(wallet, bill):
    answer = 0
    
    while True:
        if bill[0] <= wallet[0] and bill[1] <= wallet[1]:
            break
        elif bill[1] <= wallet[0] and bill[0] <= wallet[1]:
            break

        if bill[0] > bill[1]:
            bill[0] //= 2
        else:
            bill[1] //= 2
        answer += 1
    return answer
```