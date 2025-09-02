---
layout: post 
title: 코테 학습 - '택배 상자 꺼내기'
subtitle: 파이썬 학습 내용 정리
categories: 학습
tags: python 이직 학습
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

[원본 문제 보러가기](https://school.programmers.co.kr/learn/courses/30/lessons/389478)

## 2025년 9월 2일: 문제 해결의 두 가지 접근법에 대한 고찰

오늘 프로그래머스 코딩 테스트 문제 하나를 붙잡고 꽤 오랜 시간 고민했다. '택배 상자 쌓기' 문제였는데, 단순히 해결하는 것을 넘어 '어떻게 더 잘 해결할 수 있을까?'에 대한 깊은 생각에 잠기게 한 문제였다.

### 첫 번째 접근: 눈에 보이는 대로, 직관적인 시뮬레이션

문제의 요구사항은 명확했다. 지그재그 방식으로 쌓이는 택배 상자들 중에서 특정 번호의 상자를 꺼내기 위해 위에 놓인 상자가 몇 개인지 세는 것이었다. 가장 먼저 떠오른 방법은 역시 '시뮬레이션'이었다.

1.  **전체 구조 파악:** 상자가 쌓일 공간을 2차원 배열로 구상했다.
2.  **규칙 적용:** 문제에 명시된 규칙 그대로, 층(row)마다 방향을 바꿔가며 상자 번호를 채워 넣었다.
3.  **좌표 탐색 및 계산:** 목표 상자의 좌표(x, y)를 찾고, 그 위층(y+1, y+2, ...)의 같은 x 좌표에 상자가 있는지 확인하며 개수를 셌다.

이 방식은 직관적이고 명쾌하다. 머릿속으로 그리는 과정을 코드로 그대로 옮기면 되니, 논리적 오류가 발생할 확률도 적었다. 문제의 제약 조건(n ≤ 100)이 크지 않았기에, 이 방법으로도 충분히 '정답'을 맞힐 수 있었다.

하지만 만약 상자가 100개가 아니라 100만 개, 1억 개가 된다면? 이 거대한 2차원 배열을 메모리에 올리는 것부터가 부담이 될 터였다. (물론 이 문제의 제약은 아니었지만, 언제나 최적화를 염두에 두는 습관을 들이고 싶었고, gemini 왈, 수학적 계산 식으로 수행이 가능하다는 말에 어떻게 하면 좋을지 고민했다.)

```python
def solution(n, w, num):
    # 최초 설정
    total_height = int(n / w)

    if total_height * w < n:
        total_height = total_height + 1

    # 시뮬레이션을 위한 박스 설정
    box_pos = [[0 for _ in range(w)] for _ in range(total_height)]

    # 층고에 따른 박스 번호 
    delimiter_value = 1
    # 타겟이 되는 박스 위치 측정을 위한 height, width 
    target_height = 1
    target_width = 0

    # 주요 시뮬레이션(박스 적재 및 조건에 맞는 위치 발견 및 세부 설정
    for index in range(total_height):    
        for x in range(w):
            box_pos[index][x] = delimiter_value + x
            # 찾을 박스 위치 일 때 할 일
            if box_pos[index][x] == num:
                target_height = index
                if (index - 1) % 2 == 0:
                    target_width = w - 1 - x
                else: 
                    target_width = x 
            # 마지막 박스까지 마무리 시 루프 강제 종료
            if box_pos[index][x] == n:
                break
        delimiter_value += w

        # 배열을 뒤집어야 하는 경우 탐색
        if (index - 1) % 2 == 0:
            box_pos[index].reverse()


    answer = 0
    for next_height in range(target_height + 1, total_height):
        # 박스가 좌표상 존재하면 
        if box_pos[next_height][target_width] != 0:
            answer += 1
        else :
            break
    
    return answer + 1
```

### 두 번째 접근: 패턴을 꿰뚫는 수학적 계산

고민의 지점에서, 나는 다른 접근법을 모색했다. 바로 '배열 없는 계산'이다.

핵심은 **"어떤 상자 번호(k)가 주어지면, 그 상자의 좌표(x, y)를 즉시 계산해낼 수 있는가?"** 였다. 상자가 쌓이는 규칙은 명확한 패턴을 가지고 있었고, 여기서 '단순화 시켜서' 각 줄을 고려할 수 있고, 같은 위치 x 좌표를 가지는 상자를 계속 찾으면, 결국 원하는 상자를 꺼내기 위해 몇번 움직여야 하는지 알 수 있는 것이었다.

-   **y좌표 (층):** `(k-1) // w` 로 간단히 계산할 수 있다.
-   **x좌표 (칸):** 층(y)이 짝수냐 홀수냐에 따라 계산 방식이 달라진다.
    -   짝수 층: 왼쪽에서 오른쪽으로 가므로 `(k-1) % w`
    -   홀수 층: 오른쪽에서 왼쪽으로 가므로 `w - 1 - ((k-1) % w)`

이 좌표 계산 함수 `get_coords(k)`를 정의하고 나니, 문제는 훨씬 단순해졌다.

1.  목표 상자(`num`)의 좌표 `(target_x, target_y)`를 구한다.
2.  `num + 1`번 상자부터 `n`번 상자까지 루프를 돈다.
3.  각 상자의 x좌표를 계산해서 `target_x`와 같은지 확인하고, 같다면 카운트를 1 늘린다.

이 방식은 불필요한 배열 생성을 완전히 제거하여 메모리 사용량을 극도로 줄였고, 전체 시뮬레이션 과정 없이 필요한 계산만 수행하므로 속도도 훨씬 빠르게 측정되었다(100 개 기준 두배정도 차이 났다)

```python
import math

def solution2(n, w, num):
    # gemini 추천 코드
    
    # 어떤 상자 번호(k)가 주어졌을 때, 그 상자의 (x, y) 좌표를 반환하는 함수
    # 이 함수가 배열을 생성하는 모든 로직을 대체합니다.
    def get_coords(k, width):
        # 0부터 시작하는 인덱스로 변환
        zero_based_k = k - 1
        
        # y 좌표 (행, 층) 계산
        # 0층, 1층, 2층...
        y = zero_based_k // width
        
        # x 좌표 (열, 칸) 계산
        # 짝수 층(0, 2, ...)은 왼쪽에서 오른쪽으로 진행
        if y % 2 == 0:
            x = zero_based_k % width
        # 홀수 층(1, 3, ...)은 오른쪽에서 왼쪽으로 진행
        else:
            x = width - 1 - (zero_based_k % width)
            
        return x, y

    # 1. 목표 상자(num)의 좌표를 계산합니다.
    target_x, target_y = get_coords(num, w)
    
    # 2. 위에 쌓인 상자의 개수를 셀 변수를 초기화합니다.
    answer = 0
    
    # 3. num 바로 다음 번호부터 마지막 번호(n)까지의 상자들을 확인합니다.
    for k in range(num + 1, n + 1):
        # 각 상자(k)의 좌표를 계산합니다.
        k_x, k_y = get_coords(k, w)
        
        # 만약 k 상자의 x좌표가 목표 상자의 x좌표와 같다면,
        # (즉, 같은 열에 있다면)
        # 그것은 제거해야 할 상자입니다.
        if k_x == target_x:
            answer += 1
            
    return answer + 1
```

### 정리 

사실 처음 시작할 때부터 수학적 접근을 고려하지 않은 건 아니었다...만, 역시 문제는 어떻게 거기에 접근하면 되는가? 에 대한 이해도다. 

두번째 개선 방안에서 핵심은 단순화였다. 

좌표를 짤 거지만, 그때 몇번째 줄에 몇번째냐. 그리고 거기서 방향도 고려해야 한다. 이런 조건들에 사실 머리가 좀 하얘지긴 했었다.

그런데 개선 방향을 보니, 결국 위 아래가 중요한게 아니라, 그냥 현재 타겟이 되는 박스의 위치와 같은 x 좌표 위치만 있으면 되고, 최대 값까지 중에서도 그냥 한번만 루프를 돌면 된다는 점. 

