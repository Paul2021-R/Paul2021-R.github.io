---
emoji: 📄
title: 42서울 exam rank 02 후기
date: '2022-03-18 14:28:00'
author: Paul
tags: 42Seoul study
categories: 42_seoul
---

# RANK_02 Study

스터디 해야하 할 로직들을 빠르게 정리한 것입니다. 구체적으로 어떤 문제인지는 과제를 잘 해결해오신 분들에게는 너무나 쉬운 내용일 것입니다. 해당 내용은 바뀔 수 있으며, 도용을 방지하고자 구체적인 코드는 작성하여 올리지 않을 것입니다.

## **핵심 내용**

1.  서클 과제들을 클리어하고 그 로직과 원리를 이해해둘 것.
2.  vim 을 활용하는 만큼, vim 핵심 기능 몇 가지는 숙지해둘 것

## **준비물**

1.  A4
2.  펜

## **시험 과정**

해당 내용은 개선되었을 여지가 있어 차후 작성 예정입니다.

## **로직 정리**

---

### printf

1. 핵심
   - %c, %s, %x 를 printf 와 같이 출력해 낼 수 있는가?
2. 알아야 하는 주요 개념

   - 허용함수 : write, malloc, free
     - 필요헤더 : <stdlib.h>, <unistd.h>
   - 가변인자 : 인자들을 가변적으로 받을 수 있는 자료형
     - 필요 헤더 : <stdarg.h>
     - 핵심사항 : `va_list` 변수 선언 -> `va_start`({변수명}, s) -> `va_arg`({변수명}, {자료타입}) 으로 해당 변수를 추출 -> 적절하게 사용 -> `va_end`({변수명})
   - 유의 사항
     1. 문자열의 경우 null 이 들어간 경우 (null) 이라고 출력해야 한다..
     2. 구분자 %가 나오고, 뒤에 서식자가 아닌게 나온 경우 해당 문자는 일반 문자 취급하여 나와야 한다.

3. 로직
   1. va_list 타입 변수 선언
   2. va_start(변수, s); 로 시작
   3. 들어온 문자열 반복문으로 돌리기
   4. 구분자'%' 를 인식하면 해당 조건에 맞는 출력
   5. 포인트는 출력 시 굳이 간단하다면 malloc을 쓸 필요가 없다는 점.
   6. 동시에 write 를 사용하여 printf의 리턴값으로 점진적으로 더해 나갈 것

---

### get_next_line

1. 핵심
   - fd값으로 받아 파일을 `read` 하여, 한 줄씩 혹은 그 이상 읽어내되, 개행 문자가 발견되면 `read`를 멈추고, 개행문자까지 리턴 값을 준비 한 뒤, 남은 부분은 static 변수에 저장 + 리턴한다.
   - 개행문자가 나올 때와 아닐 때를 명확히 구분해야 한다.
2. 알아야 하는 주요 개념
   - 허용 함수 : read, malloc, free
   - 허용 해더 : <stdlib.h> <unistd.h>
   - BUFFER_SIZE 지정 => 기본 제공 될 수도 있으나, 제공 안 될 수 있음. 헤더 파일 내에 `# ifndef` 를 활용하여 `# define` 을 해 둘 것.
   - 구현해두어야 할 요소 : ft_strjoin, ft_strchr, ft_strlen
3. 로직
   - 핵심은 총 3파트의 주요 로직이 있다는 것을 기억하자. <br />
     1. `read` 함수를 활용하여 전체 문장을 저장. 이때 개행문자 `'\n'`를 발견시 멈추며, 그전까지는 buffer로 들어온 문자열을 계속 합친다. <br />
        > 1.1 이때, buffer에 해당하는 문자열은 BUFFER_SIZE + 1을 해서 할당해야 사용이 용이하다. <br />
        > 1.2 해당 로직에선 ft_strjoin을 구현하여 합친다. <br />
        > 1.3 합치고 나면 반드시 buffer 문자열은 free하여 누수를 유의한다.
     2. 리턴값을 만드는 파트로, 기억해야 할 것은 `개행문자가 무조건 문장에 들어가진 않는다`는 점이다. <br />
        > 2.1 개행 전까지의 문장을 확인한다. <br />
        > 2.2 개행문자를 고려하여 문장 크기를 할당한다.
        > 2.3 할당한 문장에 해당 부분까지 직접 집어 넣는다. (개행문자 전 까지가 안전하다. 없는 경우 새그폴트 발생한다.)
     3. 개행문자 이후 부분을 발견하고, 문장으로 만든다.
        > 3.1 문장에서 개행문자가 없이 끝난 경우, 문장이 종료된 것이므로, 이를 고려하여 `free`후 `NULL`을 반환한다.
        > 3.2 새로운 문장 길이를 재고 할당한 뒤, 값을 집어 넣고, 마지막에 `'\0'` 을 넣고, 기존의 문장의 할당을 해지한다.

---

### inter

1. 핵심

   ```
   Assignment name  : inter
   Expected files   : inter.c
   Allowed functions: write
   --------------------------------------------------------------------------------

   Write a program that takes two strings and displays, without doubles, the
   characters that appear in both strings, in the order they appear in the first
   one.

   The display will be followed by a \n.

   If the number of arguments is not 2, the program displays \n.

   Examples:

   $>./inter "padinton" "paqefwtdjetyiytjneytjoeyjnejeyj" | cat -e
   padinto$
   $>./inter ddf6vewg64f gtwthgdwthdwfteewhrtag6h4ffdhsd | cat -e
   df6ewg4$
   $>./inter "nothing" "This sentence hides nothing" | cat -e
   nothig$
   $>./inter | cat -e
   $
   ```

   두개의 문자열에서 모두 나온 문자만을 출력시킨다.
   write 함수만 사용할 수 있으며, 순서는 입력받은 문자열 순서데로 동일한 순서로 출력된다.

2. 알아야 하는 주요 개념
   - int argc : 메인함수에 전달되는 정보의 개수(프로그램명이 0에 들어가므로 무조건 1부터 시작된다.)
   - char \*\*argv : 메인함수에 전달되는 문자 배열(개수 만큼 2차원 배열 열이 증가 한다.)(argc처럼 실행프로그램 명이 argv[0]에 들어간다.)
3. 로직
   - 첫번째 문자열의 글자부터 돌면서 순차적으로 1번, 2번 문자열을 돌며 있는지 여부를 본다.
   - 이때, 돌고있는 기준 문자의 인덱스가 1번 문장인지, 2번 문장에서 왔는지를 확인하고, 동시에 인덱스까지 확인하여 출력 여부를 결정한다.

---

### union

1. 핵심

   ```
   Assignment name  : union
   Expected files   : union.c
   Allowed functions: write
   --------------------------------------------------------------------------------

   Write a program that takes two strings and displays, without doubles, the
   characters that appear in either one of the strings.

   The display will be in the order characters appear in the command line, and
   will be followed by a \n.

   If the number of arguments is not 2, the program displays \n.

   Example:

   $>./union zpadinton "paqefwtdjetyiytjneytjoeyjnejeyj" | cat -e
       zpadintoqefwjy$

   $>./union ddf6vewg64f gtwthgdwthdwfteewhrtag6h4ffdhsd | cat -e
       df6vewg4thras$

   $>./union "rien" "cette phrase ne cache rien" | cat -e
       rienct phas$

   $>./union | cat -e
       $
   $>

   $>./union "rien" | cat -e
       $
   $>
   ```

   프로그램으로 들어오는 두 문장을 출력하되 중복된 문자인 경우 한번만 나오고, 어느쪽 문자열이든 포함되었던 문자는 출력한다.
   허용하는 함수는 write 뿐이다.
   인자 2개가 아니면 실행되지 않는다.

2. 알아야 하는 주요 개념

   - int argc : 메인함수에 전달되는 정보의 개수(프로그램명이 0에 들어가므로 무조건 1부터 시작된다.)
   - char \*\*argv : 메인함수에 전달되는 문자 배열(개수 만큼 2차원 배열 열이 증가 한다.)(argc처럼 실행프로그램 명이 argv[0]에 들어간다.)

3. 로직
   - 처음 들어오는 argv[1] 부터 시작하여 argv[2] 에 대하여 반복문을 동작 시킨다.
   - av[1][0] 을 시작으로 돌리면서 자신의 인덱스를 데외하고, 자기보다 인덱스가 먼저 나온 문자가 존재한다면, 출력하지 않고 넘긴다.

## 추가 학습 내용 정리

### 'header.h'의 구조 정리

```c
#ifndef HEADER_H
# define HEADER_H
// 시작시 선언

# include <stdio.h>
//라이브러리

# ifndef BUFFER_SIZE
#  define BUFFER_SIZE 42
# endif
//정의, define만 해도 되지만, 정의 될 경우 건드릴 수 없기 때문에 ifndef를 활용함.

# define BUFFER 0

#endif//헤더 마무리 선언
```

### Vim 명령어 꿀 몇 가지...

`:syn enable` ↔️ `:syn off` : 문법 하이라이팅

`:set nu`: 라인 번호

`:set hls` : 검색어 강조

`:sp` : 가로 분할

`:vsp` : 세로 분할

`ctrl + w` : 창이동 준비 상태(방향키로 이동 가능)

`v` : 비주얼 모드

`y` : 비주얼 모드 상태에서 복사'

`p` : 복사한 내용 붙여넣기

---

## 시험 후기

으아..... 1차 FAIL....

시험은 딱히 어려울게 없었습니다. 문제는 랜덤이었고 inter 와 printf의 구현. 진행하면서 느꼈지만, 전에는 그렇게 어렵던 것이 이제는 그래도 쉽게 느껴진다는 것은 나름의 가능성(?)을 느낄 수 있었습니다.

뒤에 열거한 inter, union의 경우 기본적인 반복문을 활용 및 조건만 충족하도록 로직을 짜면 되니 큰 문제가 되지않았습니다. 실제로도 만들고 검증 및 제대로 작동여부까지 대략 30분 안 걸렸습니다.

문제는 printf인데... 사실, 해당 구현도 딱히 어렵지 않았습니다. 구현해야할 것은 총 3가지 `%s` , `%d`, `%x` 로 가장 핵심적인 기능 뿐이었고, 이 역시 말록 없이 가능한 수준의 것이었기에 진행 자체는 순조롭게 되어 사실 상 1시간 이상의 시간을 남겨놓고 마무리가 되었었습니다. 대략 1시간 20 ~ 10분 정도 컷 되었다고 볼 수 있겠네요.

하지만 문제는 해당 출력 결과에 대한 내용에서 문제가 발생했습니다.

> ft_printf("hello %s\n", "toto");
>
> out : hello toto$

> ft_printf("Magic Number is %d", 42);
>
> out : Magic Number is 42%

이상함을 아시겠나요? 바로 뒤에 오는 `$`, `%` 표시입니다.... 처음에는 이게 뭔가 하고 머리가 띵했는데, 정신차리고 혹시나 구현해야 하나? 개행은 `$` 고 개행이 없으면 `%`으로 만들어야 하나? 그럼 리턴값은? 정말 문과 창피하게 어쩌란 말인가...

<div style="width:80%;height:0;padding-bottom:56%;position:relative;"><iframe src="https://giphy.com/embed/11tTNkNy1SdXGg" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/disneypixar-disney-pixar-11tTNkNy1SdXGg">via GIPHY</a></p>

이젠 제 자신의 수준을 인정 안할 수 없었습니다(...) 해당 내용은 다름 아니라, `cat -e` 옵션을 사용 시, 개행 여부에 따라 달라지는 '확인자' 였습니다. 예를 들면 이렇게 말입니다.

<img src="/i_hate_42.png"  title="sometimes I hate 42..." alt="i_hate_42.png"></img><br/>

이걸 알았다면 원턴으로 성공했을 텐데... 라는 아쉬움이 남지만 어쩌겠습니까. 어차피 결국 역량과 내공이라는 것, 수준이라는 것의 차이가 이런 사소함에서 나오리라 생각됩니다. 다행스러운 것은 확실히 그 전에 쩔쩔매던 내용이었음에도 각잡고 하니 프엪도 별거 아니라는 점(...) 물론, 개편되면서 플래그 등의 옵션을 구현 하지 않아도 된다는 점이 있는 이상... 다른 기수에 비해 부족한 실력 티내는 것 같지만...

어쨌든 다음 번엔 꼭 통과되길 기대해봅니다(....)

# 😂
