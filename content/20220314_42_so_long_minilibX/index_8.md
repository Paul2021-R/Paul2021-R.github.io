---
emoji: 🖥
title: MinilibX_08_Sync(완료)
date: '2022-03-14 01:50:00'
author: Paul
tags: 42seoul so_long MiniLibX
categories: 42_seoul
---

### Sync

1.  What is sync?

    이전에 설명한 것처럼, 직접 mlx 를 가지고 프레임을 직접 관리할수 있습니다. 하지만 이는 꽤나 끔직하며 시간 소비적인 일입니다. 게다가 더 많은 메모리를 먹고, 우리가 관리하는 프레임은 지속적으로 완전히 갱신되어야 할 필요가 있죠. 이는 매우 비효율적이고 더 나아가선 모든 코스트를 제외할 필요를 야기할 수 있습니다.

    2020년의 MLX 버전 부터는 프레임을 synchronize 시키는 것이 가능해졌습니다. 이는 임시 방편으로 다수의 이미지를 스크린 버퍼링을 위해 만들 필요가 사라졌다는 것을 의미합니다.

2.  Using sync

    우선 이해해야 하는 걸 먼저 정의하고 시작하겠습니다.

    ```c
    #define MLX_SYNC_IMAGE_WRITABLE		1
    #define MLX_SYNC_WIN_FLUSH_CMD		2
    #define MLX_SYNC_WIN_CMD_COMPLETED	3

    int	mlx_sync(int cmd, void *ptr);
    ```

    `mlx_sync` 함수는 정의된 커맨드 코드들로 호출될 수 있습니다. 첫번째로 `MLX_SYNC_IMAGE_WRITABLE` 은 이미지에 대한 모든 다음 호출을 버퍼해줍니다. (`ptr` 은 MLX image object 의 포인터입니다.) 만약 변화를 증식시키길 원한다면, 당신은 이미지가 표시되는 중인 창을 `MLX_SYNC_WIN_FLUSH_CMD` 를 활용하고, `ptr` 에대해 flush를 원하는 창을 flush 할 필요가 있습니다.

3.  Test your skills!

    이전에 반복문을 활용해 만든 작은 circle-game 에 `mlx_syncd` 을 추가하여 렌더링을 해보세요.

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
