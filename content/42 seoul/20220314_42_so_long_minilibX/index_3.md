---
emoji: 🖥
title: MinilibX_03_colors(완료)
date: 2022-03-14 01:15:00
author: Paul
tags:
  - 42seoul
  - so_long
  - MiniLibX
categories: 42seoul
---

### 들어가기 앞서

해당 내용은 참고 정도로 생각하면 좋습니다. 픽셀을 직접 그리는 과제를 제외하곤 사용성이 크게 있진 않은 개념입니다.

### Colors

색은 정수 형태로 표현됩니다. 그러므로 몇 가지 ARGB 값을 포함할 수 있는 정수를 획득할 수 있도록 기믹적인 것들을 필요로 합니다.

1.  The color integer standard

    | 문자 | 뜻              |
    | ---- | --------------- |
    | T    | 투명도          |
    | R    | 붉은색 컴포넌트 |
    | G    | 초록색 컴포넌트 |
    | B    | 파란색 컴포넌트 |

    RGB 색은 다음처럼 초기화 될 수 있다.

    | 색    | TRGB 표시  |
    | ----- | ---------- |
    | red   | 0x00FF0000 |
    | green | 0x0000FF00 |
    | blue  | 0x000000FF |

2.  Encoding and decoding colors

    색을 encode, decode 하는 방법으로 두가지를 사용할 수 있습니다. 비트 연산을 활용하는 방법과, int, char 값으로 변환하는 방법입니다.

    - char/int conversion

      1 바이트 당 RGB 값이 지정되고, 당연히 16진수의 정수값으로 지정한 것을 반대로 설정하는 것도 가능 합니다. 이를 위한 컨버팅은 아래와 같은 방식으로 할 수도 있습니다. 아래는

      ```c
      int	create_trgb(unsigned char t, unsigned char r, unsigned char g, unsigned char b)
      {
      	return (*(int *)(unsigned char [4]){b, g, r, t}); //들어오는 문자열로 된 정수값 1바이트(비부호형) 을 묶어서 배열로 만들고 다시 정수로 형변환을 하여 정수값으로 환산한 형태
      }

      unsigned char	get_t(int trgb)
      {
      	return (((unsigned char *)&trgb)[3]); //받은 정수를 다시 비부호형 char 타입으로 형변환 한뒤 배열처럼 하여 해당 위치에 맞는 정수값을 출력하는 형식
      }

      unsigned char	get_r(int trgb)
      {
      	return (((unsigned char *)&trgb)[2]);
      }

      unsigned char	get_g(int trgb)
      {
      	return (((unsigned char *)&trgb)[1]);
      }

      unsigned char	get_b(int trgb)
      {
      	return (((unsigned char *)&trgb)[0]);
      }
      ```

      변환을 이해하기 위해선 아래의 표를 참고하시면 됩니다. `0x0FAE1` 는 `int trgb` 의 변수 주소입니다.

      | Address | char            | int          |
      | ------- | --------------- | ------------ |
      | 0x0FAE1 | unsigned char b | int trgb     |
      | 0x0FAE2 | unsigned char g | \[allocated] |
      | 0x0FAE3 | unsigned char r | \[allocated] |
      | 0x0FAE4 | unsigned char t | \[allocated] |

    - BitShifting

      1 바이트는 `2^8 = 256` 의 값(1 byte = 8 bits)을 지닙니다. 따라서 int형인 색깔은 각 바이트당 의미를 갖게 되고, 하나의 요소의 값의 범위는 0 ~ 255 가지수를 가질 수 있습니다. 따라서 TRGB의 값은 정수 값 안에 완벽하게 담을 수 있습니다. 더불어 정수 값을 사용하는 만큼 프로그램적으로 값들을 담기 위하여, `bitshifting` 을 사용이 가능합니다.

      ```c
      int creat_trgb(int t, int r, int g, int b)
      {
      	return (t << 24 | r << 16 | g << 8 | b);
      }
      ```

      정수는 오른쪽부터 왼쪽으로 정렬되므로, 비트들을 거꾸로의 값에 따라 각 값을 bitshift 할 필요가 있습니다. 리턴에서 비트 OR 연산으로 완벽한 TRGB 값을 만들 수 있게 되는 것이지요. 더불어 로직을 정 반대로 하는 것을 통해 인코딩된 TRGB로부터 개별 정수 값을 복구도 가능합니다.

      ```c
      int	get_t(int trgb)
      {
      	return ((trgb >> 24) & 0xFF); // 1바이트를 모두 1로 채운 값과 & 연산으로 1인 경우만 남겨버리게 된다.
      }

      int	get_r(int trgb)
      {
      	return ((trgb >> 16) & 0xFF);
      }

      int	get_g(int trgb)
      {
      	return ((trgb >> 8) & 0xFF);
      }

      int	get_b(int trgb)
      {
      	return (trgb & 0xFF);
      }
      ```

3.  Test your skills

    이제 색을 어떤 식으로 초기화 할 수 있는지의 기초를 이해했다면, 익숙해지고, 다음 컬러 조작 함수들을 만들어보는 것을 시도하면 됩니다.

    - `add_shade` 는 double(거리)와 int(색) 을 인자대로 수용해주는 함수입니다. 0은 색상에 쉐이딩을 추가 하지 않으며, 반면에 1은 완벽하게 어둡게 만들어 줍니다. 0.5 는 절반정도 어둡게 만들고, .25는 1/4 정도 그렇게 만듭니다. 해당 포인트를 얻어 보세요.
    - `get_opposite` 함수는 int(색) 인자를 수용하고, 생상을 반전 시켜 줍니다. ⇒ 보색 을 얻어냅니다.

<p>

## 주제별 라이브러리 설명(링크 참조)

해당 내용들은 분량이 너무 많은 관계로 링크로 대신 합니다.

> ### **[1. Introduction](https://paul2021-r.github.io/20220314_42_so_long_minilibX/index_0/)**
>
> ### **[2. Getting Started](https://paul2021-r.github.io/20220314_42_so_long_minilibX/index_2/)**
>
> ### **[3. Colors](https://paul2021-r.github.io/20220314_42_so_long_minilibX/index_3/)**
>
> ### **[4. Hooks](https://paul2021-r.github.io/20220314_42_so_long_minilibX/index_4/)**
>
> ### **[5. Events](https://paul2021-r.github.io/20220314_42_so_long_minilibX/index_5/)**
>
> ### **[6. Loops](https://paul2021-r.github.io/20220314_42_so_long_minilibX/index_6/)**
>
> ### **[7. Images](https://paul2021-r.github.io/20220314_42_so_long_minilibX/index_7/)**
>
> ### **[8. Sync](https://paul2021-r.github.io/20220314_42_so_long_minilibX/index_8/)**

```toc

```
