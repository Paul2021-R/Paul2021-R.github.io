---
emoji: 🖥
title: MinilibX_라이브러리 가이드 문서 번역(완료)
date: 2022-03-14 01:05:00
author: Paul
tags:
  - 42seoul
  - so_long
  - MiniLibX
categories: 42seoul
---

# Prologue

해당 문서는 42 so_long 등에 사용하는 그래픽 라이브러리에 대한 내용을 정리한 [해당 본문](https://harm-smits.github.io/42docs/libs/minilibx/introduction.html) 을 통번역 한 문서입니다. 최대한 정확하게 정리하고자 하였으나, 다소 차이가 있을 수 있으므로 참고 바랍니다. 더불어 내용에서 다소 부정확해 보이는 표현은 의역 및 수정한 부분이 있으므로 유의하십시오.

# MiniLibX

## Introduction

1.  들어가면서

    MiniLibx는 간단한 그래픽 라이브러리로 X-window 그리고 Cocoa에 대한 지식 없이도 스크린 상에 무언가를 렌더링 하는 가장 기초적인 일을 할 수 있는 라이브러리입니다. 지원하는 기능들에는 simple window creation, questionable drawing tool(의심스러운 그리기 도구란 의미다... 왜 이렇게 적었는지는.... 그만 알아보자), half-ass image functions and a weird event를 갖고 있다(a에서 ss로 끝나는 단어가 있는 걸 봐선 욕먹는다고 보면 됩니다.)

2.  X-Window 란

    `X-Window 란 Unix 를 위한 네트워크 지향형 그래픽 시스템입니다.` 예를 들어 원격 데스크톱을 연결을 할 때 사용됩니다. 이러한 실행의 대표적 예로는 TeamViewr가 있으며, 이러한 기능은 유닉스 기반의 GUI를 다루는 시스템이라고 이해하면 됩니다. <p>
    엑스서버와 엑스 클라이언트로 이루어져 있으며 엑스서버는 사용자가 클라이언트 프로그램을 사용하기 위해서 필요한 키보드의 입력 등의 정보를 엑스 클라이언트에게 전송해주는 역할을 하고 엑스 클라이언트는 사용자가 작업을 하기 위해 실행시킨 엑스윈도우용 프로그램을 말합니다. 보다 자세한 사항은 [링크](http://wiki.hash.kr/index.php/%EC%97%91%EC%8A%A4%EC%9C%88%EB%8F%84%EC%9A%B0)를 참조하십시오.

3.  맥 OS에 관하여

    macOS는 X 윈도우를 기반으로 전달된 내용들을 화면에 그래픽 출력을 진행합니다. 하지만 이에 접속하기 위해서 우리는 반드시 우리의 어플리케이션의 스크린을 조작하거나, 창 시스템, 키보드와 마우스를 다루는 하부 맥OS의 그래픽 프레임워크에 등록되어야 합니다

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
