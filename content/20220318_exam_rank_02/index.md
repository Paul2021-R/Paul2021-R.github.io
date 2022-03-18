---
emoji: 📄
title: exam_rank_02
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
