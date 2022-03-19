---
emoji: 🖥
title: MinlibX_05_Events(수정중)
date: '2022-03-14 01:30:00'
author: Paul
tags: 42seoul so_long MiniLibX
categories: 42_seoul
---

### Events

1.  Introduction

    이벤트들은 mlx 안에서 대화식 어플리케이션 작성의 토대이다. 그러므로 차후의 그래픽 프로젝트에서도 사용될 것이므로 이 챕터를 완벽하게 이해하는 것은 필수라고 할 수 있다.

    모든 mlx 의 hook 들은 이벤트가 발생할 때마다 호출되어지는 함수 그 이상도 그 이하도 아니다. 모든 이벤트 함수들을 완벽하게 숙지하는 것은 필수는 아니지만, 각 X11 이벤트들에 따라서 빠르게 검토해볼 필요는 있다.

    1. MacOS version 주) Mac OS 에서 Cocoa(Appkit) 그리고 OpenGL 버전은 부분적으로 X11 이벤트를 지원하지만, X11 mask는 지원하지 않는다(mlx의 x_mask 인자는 쓸모가 없다. 항상 0으로 유지 시켜라).
    2. 지원 이벤트들 :

       ```c
       enum {
       	ON_KEYDOWN = 2,
       	ON_KEYUP = 3,
       	ON_MOUSEDOWN = 4,
       	ON_MOUSEUP = 5,
       	ON_MOUSEMOVE = 6,
       	ON_EXPOSE = 12,
       	ON_DESTROY = 17
       };

       // usage:
       mlx_hook(vars.win, ON_DESTROY, 0, close, &vars);
       ```

2.  X11 interface

    X11 은 mlx와 함께 사용되는 라이브러리 입니다. 그러므로 mlx의 모든 이벤트를 확인하는데 매우 유용한 헤더임에 틀림 없습니다.

    1.  X11 events

        다양한 이벤트 들이 존재합니다.

        | Key | Event          | Key | Event            | Key | Event            |
        | --- | -------------- | --- | ---------------- | --- | ---------------- |
        | 02  | KeyPess        | 14  | NoExpose         | 26  | CirculateNotify  |
        | 03  | KeyRelease     | 15  | VisibilityNotify | 27  | CirculateRequest |
        | 04  | ButtonPress    | 16  | CreateNotify     | 28  | PropertyNotify   |
        | 05  | ButtonRelease  | 17  | DestroyNotify    | 29  | SelectionClear   |
        | 06  | MotionNotify   | 18  | UnmapNotify      | 30  | SelectionRequest |
        | 07  | EnterNotify    | 19  | MapNotify        | 31  | SelectionNotify  |
        | 08  | LeaveNotify    | 20  | MapRequest       | 32  | ColormapNotify   |
        | 09  | FocusIn        | 21  | ReparentNotify   | 33  | ClientMessage    |
        | 10  | FocusOut       | 22  | ConfigureNotify  | 34  | MappingNotify    |
        | 11  | KeymapNotify   | 23  | ConfigureRequest | 35  | GenericEvent     |
        | 12  | Expose         | 24  | GravityNotify    | 36  | LASTEvent        |
        | 13  | GraphicsExpose | 25  | ResizeRequest    |     |                  |

        만약 몇몇 이벤트들이 무엇인지 알기 어려울 수 있지만, 걱정마세요. 아마 그게 필요하진 않을 겁니다. 만약 그렇다면 이 문서를 읽으시면 됩니다. [\[링크\]](https://tronche.com/gui/x/xlib/events/)

    2.  X11 masks

        각 X11 이벤트 들은 또한 해당하는 mask도 있습니다. 이 방식은 당신이 누른 한키에 대해 등록할 수 있거나, 혹은 마스크를 기본으로 두는 경우 모든 키를 등록하는 것이 가능합니다. 그러므로 key mask 는 당신의 이벤트 구독 상태로부터 이벤트들을 화이트리스트, 블랙리스트화 하는 것을 허락하게 만들어줍니다. 아래가 할당된 마스크 들입니다.

        | Mask     | Description           |     | Mask     | Description              |
        | -------- | --------------------- | --- | -------- | ------------------------ |
        | 0L       | NoEventMask           |     | (1L<<12) | Button5MotionMask        |
        | (1L<<0)  | KeyPressMask          |     | (1L<<13) | ButtonMotionMask         |
        | (1L<<1)  | KeyReleaseMask        |     | (1L<<14) | KeymapStateMask          |
        | (1L<<2)  | ButtonPressMask       |     | (1L<<15) | ExposureMask             |
        | (1L<<3)  | ButtonReleaseMask     |     | (1L<<16) | VisibilityChangeMask     |
        | (1L<<4)  | EnterWindowMask       |     | (1L<<17) | StructureNotifyMask      |
        | (1L<<5)  | LeaveWindowMask       |     | (1L<<18) | ResizeRedirectMask       |
        | (1L<<6)  | PointerMotionMask     |     | (1L<<19) | SubstructureNotifyMask   |
        | (1L<<7)  | PointerMotionHintMask |     | (1L<<20) | SubstructureRedirectMask |
        | (1L<<8)  | Button1MotionMask     |     | (1L<<21) | FocusChangeMask          |
        | (1L<<9)  | Button2MotionMask     |     | (1L<<22) | PropertyChangeMask       |
        | (1L<<10) | Button3MotionMask     |     | (1L<<23) | ColormapChangeMask       |
        | (1L<<11) | Button4MotionMask     |     | (1L<<24) | OwnerGrabButtonMask      |

3.  Hooking into events

    1.  mlx_hook

        이벤트들로부터 hooking 은 mlx 가 제공하는 가장 강력한 도구 중에 하나입니다. 단순한 훜 등록 함수를 호출함과 함께 앞서 언급한 이벤트들의 종류를 등록하는걸 돕습니다ㅏ.

        이걸 위해, 우리는 `mlx_hook` 함수를 호출합니다.

        ```c
        void mlx_hook(mlx_win_list_t *win_ptr, int x_event, int x_mask, int (*f)(), void *param)
        ```

        주의) 몇몇 mlx 버전에 따라 `x_mask` 를 수행하지 않고, 무슨 값이든지간에 마스크가 존재하지 않을 수 잇습니다.

    2.  Prototype of event functions

        | Hooking event  | code | Prototype                                         |
        | -------------- | ---- | ------------------------------------------------- |
        | ON_KEYDOWN     | 2    | int (\*f)(int keycode, void \*param)              |
        | ON_KEYUP\*     | 3    | int (\*f)(int keycode, void \*param)              |
        | ON_MOUSEDOWN\* | 4    | int (\*f)(int button, int x, int y, void \*param) |
        | ON_MOUSEUP     | 5    | int (\*f)(int button, int x, int y, void \*param) |
        | ON_MOUSEMOVE   | 6    | int (\*f)(int x, int y, void \*param)             |
        | ON_EXPOSE\*    | 12   | int (\*f)(void \*param)                           |
        | ON_DESTROY     | 17   | int (\*f)(void \*param)                           |

        - 는 mlx_hook를 앨리아스 이다.

    3.  Hooking alias

        mlx api 는 몇가지 앨리아스 hooking 함수를 갖고 있다.

        - `mlx_expose_hook` : 노출 이벤트(12) 에 대한 mlx_hook 의 앨리아스 함수이다.
        - `mlx_key_hook` : key up 이벤트(3)에 대한 mlx_hook의 앨리아스 함수이다.
        - `mlx_mouse_hook` : 마우스 다운 이벤트(4) 에 대한 mlx_hook의 앨리아스 함수이다.

    4.  Example

        `mlx_key_hook` 의 호출 대신의 예시로 `keypress` 그리고 `keyRelease` 이벤트를 등록할 수 있다. 이제 키를 누르게 되면 창은 닫히게 될 것이다.

        ```c
        #include <mlx.h>

        typedef struct	s_vars {
        	void	*mlx;
        	void	*win;
        }				t_vars;

        int	close(int keycode, t_vars *vars)
        {
        	mlx_destroy_window(vars->mlx, vars->win);
        	return (0);
        }

        int	main(void)
        {
        	t_vars	vars;

        	vars.mlx = mlx_init();
        	vars.win = mlx_new_window(vars.mlx, 1920, 1080, "Hello world!");
        	mlx_hook(vars.win, 2, 1L<<0, close, &vars);
        	mlx_loop(vars.mlx);
        }
        ```

4.  Test your skils!

    이제 뿌연 아이디어를 어떻게 이것을 작동시키게 만들지를 생각해보자. 언제든지 아래의 이벤트 들의 hook handler들을 만들어보자

    - `ESC` 를 누르면, 너의 창은 닫히게 만든다. ✅
    - 창 사이즈가 변경이 되면, 이에 따라 터미널에 무언가 출력되어야 한다.
    - 붉은 십자가가 클릭되면, 창을 닫아야 한다.
    - x 초 이상 길게 키를 누르면, 터미널에 무언가 표시되어야 한다.
    - 마우스가 창 안으로 들어가게 되면, 터미널 상에 `Hello!` 라고 나오게 하고, 떠나면 `Bye!` 라고 출력되게 만든다. ✅

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
