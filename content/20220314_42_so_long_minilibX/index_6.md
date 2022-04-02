---
emoji: 🖥
title: MinilibX_06_Loops(완료)
date: '2022-03-14 01:35:00'
author: Paul
tags: 42seoul so_long MiniLibX
categories: 42_seoul
---

### Loops

1.  Introduction

    이제 우리는 MiniLibX Library의 기초를 이해했습니다. 그러니 창 안에 작은 애니메이션을 그려보는걸 시작합시다. 이걸 위해 우리는 새로운 함수 `mlx_loop` , `mlx_loop_hook` 이라는 새로운 두 함수를 사용해야 합니다.

    반복문은 새로운 프레임들을 렌더링하기 위해 `mlx_loop_hook` 으로 등록된 hook을 호출 이어나가는 MiniLibX의 기능 중 하나입니다.

2.  Hooking into loops

    반복문을 초기화 하기 위해, `mlx_loop` 함수를 `mlx` 인스턴스를 가지고 호출을 합니다.

    ```c
    #include <mlx.h>

    int	main(void)
    {
    	void	*mlx;

    	mlx = mlx_init();
    	mlx_loop(mlx);
    }
    ```

    우리가 따로 등록한 loop hook가 없으로 아무것도 안 일어날 겁니다. 그러므로 현재 상태로는 프레임과 관련된 기능들을 사용하는 것이 쉽지 않습니다.

    따라서 우리는 getting started 챕터에서 묘사했던 변화를 사용하고, 새로운 창을 만들어야 할 것입니다. 당신의 인자들을 잘 전달한다 할 수 있고, 능숙하다는 전재하에 진행함을 참조하여 주세요. 현재 무엇이든 그릴 수 있는 화이트보드는 이런 모습으로 표현 될 수 있습니다.

    ```c
    #include <mlx.h>

    int	render_next_frame(void *YourStruct);

    int	main(void)
    {
    	void	*mlx;

    	mlx = mlx_init();
    	mlx_loop_hook(mlx, render_next_frame, YourStruct);
    	mlx_loop(mlx);
    }
    ```

    이제 각 프레임을 위해 `render_next_frame` 이라 불리는 함수와, `YourStruct` 라는 인자를 호출합니다. 이것걸 활용하면 지속적이게 다수의 함수호출을 일으킬 수 있습니다. 그러므로 이러한 방식은 당신의 게임 작성을 보다 편하게 만들어줄 것입니다.

3.  Test your skills
    - 움직이는 모든 컬러를 가진 무지개를 만들어라.
    - wasd키를 사용하여 당신의 화면 넘어로 움직일 수 있다.

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
