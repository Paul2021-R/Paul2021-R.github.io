---
emoji: π₯
title: MinilibX_05_Events(μλ£)
date: '2022-03-14 01:30:00'
author: Paul
tags: 42seoul so_long MiniLibX
categories: 42_seoul
---

### Events

1.  Introduction

    μ΄λ²€νΈλ€μ mlx μμμ λνμ μ΄νλ¦¬μΌμ΄μμ κ·Όκ°μ΄λΌκ³  λ³Ό μ μμ΅λλ€. κ·Έλ¬λ―λ‘ μ°¨νμ κ·Έλν½ νλ‘μ νΈμμλ μ¬μ©λ  κ²μ΄λ―λ‘ μ΄ μ±ν°λ₯Ό μλ²½νκ² μ΄ν΄νλ κ²μ νμλΌκ³  ν  μ μμ΅λλ€.

    λͺ¨λ  mlx μ hook λ€μ μ΄λ²€νΈκ° λ°μν  λλ§λ€ νΈμΆλμ΄μ§λ ν¨μ κ·Έ μ΄μλ κ·Έ μ΄νλ μλλλ€. λͺ¨λ  μ΄λ²€νΈ ν¨μλ€μ μλ²½νκ² μμ§νλ κ²μ νμλ μλμ§λ§, κ° X11 μ΄λ²€νΈλ€μ λ°λΌμ λΉ λ₯΄κ² κ²ν ν΄λ³΄κ³  μ ννκ² μ©λλ₯Ό νμν΄λλ κ²μ ν₯νλ₯Ό μν΄ λ§€μ° μ€μν λΆλΆμλλ€.

    1. MacOS version μ£Ό) Mac OS μμ Cocoa(Appkit) κ·Έλ¦¬κ³  OpenGL λ²μ μ λΆλΆμ μΌλ‘ X11 μ΄λ²€νΈλ₯Ό μ§μνμ§λ§, `X11 mask`λ μ§μνμ§ μλλ€(mlxμ x_mask μΈμλ μΈλͺ¨κ° μμΌλ―λ‘ 0μΌλ‘ λμλ©΄ λ©λλ€.).
    2. μ§μ μ΄λ²€νΈλ€ :

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
       // '0' == x11_mask
       ```

2.  X11 interface

    X11 μ mlxμ ν¨κ» μ¬μ©λλ λΌμ΄λΈλ¬λ¦¬ μλλ€.

    1.  X11 events

        λ€μν μ΄λ²€νΈ λ€μ΄ μ‘΄μ¬ν©λλ€.

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

        λ§μ½ λͺλͺ μ΄λ²€νΈλ€μ΄ λ¬΄μμΈμ§ μκΈ° μ΄λ €μΈ μ μμ§λ§, κ±±μ λ§μΈμ. μ€μ λ‘ νμν μ΄λ²€νΈλ λͺ κ°μ§ μκ³ , μ΄λν λ³΄μλ©΄ νμ€ν μμ€ μ μμ κ²μλλ€. κ·ΈλΌμλ μΆκ°μ μΈ μ λ³΄κ° νμνμλ©΄ μ΄ λ¬Έμλ₯Ό μ½μΌμλ©΄ λ©λλ€. [\[λ§ν¬\]](https://tronche.com/gui/x/xlib/events/)

    2.  X11 masks

        κ° X11 μ΄λ²€νΈλ€μ ν΄λΉνλ maskλ μμ΅λλ€. μ΄ λ°©μμ νΉμ ν ν€μ λν΄ λ±λ‘ν  μ μκ±°λ, νΉμ λ§μ€ν¬λ₯Ό κΈ°λ³Έκ°μΌλ‘ λλ κ²½μ° λͺ¨λ  ν€λ₯Ό λ±λ‘νλ κ²μ΄ κ°λ₯ν©λλ€. κ·Έλ¬λ―λ‘ key mask λ λΉμ μ νΉμ ν μ΄λ²€νΈλ₯Ό μν μ΄λ²€νΈλ€μ νμ΄νΈλ¦¬μ€νΈ, λΈλλ¦¬μ€νΈν νλ κ²μ νλ½νκ² λ§λ€μ΄μ€λλ€. μλκ° ν λΉλ λ§μ€ν¬ κ°λ€μλλ€.

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

        μ΄λ²€νΈλ€λ‘λΆν° hooking μ mlxκ° μ κ³΅νλ κ°μ₯ κ°λ ₯ν λκ΅¬ μ€μ νλμλλ€. λ¨μν hookμ λ±λ‘ ν¨μλ₯Ό νΈμΆν¨κ³Ό ν¨κ» μμ μΈκΈν μ΄λ²€νΈλ€μ μ’λ₯λ₯Ό λ±λ‘νλκ±Έ λμ΅λλ€.

        μ΄κ±Έ μν΄, μ°λ¦¬λ `mlx_hook` ν¨μλ₯Ό μ¬μ©ν©λλ€.

        ```c
        void mlx_hook(mlx_win_list_t *win_ptr, int x_event, int x_mask, int (*f)(), void *param)
        ```

        μ£Όμ) λͺλͺ mlx λ²μ μ λ°λΌ `x_mask` λ₯Ό μννμ§ μκ³ , λ¬΄μ¨ κ°μ΄λ μ§κ°μ λ§μ€ν¬κ° μ‘΄μ¬νμ§ μμ μ μμ΅λλ€.

    2.  Prototype of event functions

        mlx_hook λ₯Ό μ¬μ©νμ¬ ν¨μλ₯Ό νΈμΆ μ, κ° μ΄λ²€νΈ μ½λλ€μ λ§μΆ° mlx_hookκ° μ κ³΅ν΄μ£Όλ ν¨λ¬λ―Έν°λ€μ λ€λ₯΄κ² μ€μ λμ΄ μμ΅λλ€. μ¦, νΉμ  ν¨μλ₯Ό μμ±, νΈμΆ μ μ§μ λ prototypeμΌλ‘ μ€μ νλ©΄, ν΄λΉνλ κ°μ λ°μλλλ€. λ³΄μλ λ° μ²λΌ, ON_KEYDOWN μ κ²½μ°, νΈμΆ λ  ν¨μλ₯Ό μμ±νκ³ , ON_KEYDOWNμ ν΄λΉνλ νλ‘ν  νμμ μ λ¬νκ² λλ©΄, μ΄μ λ§λ νλ‘ν  νμ`int(*f)(int keycode, void *param)`μ μ λ¬ν΄μ€λλ€.

        | Hooking event  | code | Prototype                                         |
        | -------------- | ---- | ------------------------------------------------- |
        | ON_KEYDOWN     | 2    | int (\*f)(int keycode, void \*param)              |
        | ON_KEYUP\*     | 3    | int (\*f)(int keycode, void \*param)              |
        | ON_MOUSEDOWN\* | 4    | int (\*f)(int button, int x, int y, void \*param) |
        | ON_MOUSEUP     | 5    | int (\*f)(int button, int x, int y, void \*param) |
        | ON_MOUSEMOVE   | 6    | int (\*f)(int x, int y, void \*param)             |
        | ON_EXPOSE\*    | 12   | int (\*f)(void \*param)                           |
        | ON_DESTROY     | 17   | int (\*f)(void \*param)                           |

        - λ mlx_hookλ₯Ό μ¨λ¦¬μμ€ μ΄λ€.

    3.  Hooking alias

        mlx api λ λͺκ°μ§ μ¨λ¦¬μμ€ hooking ν¨μλ₯Ό κ°κ³  μμ΅λλ€. μ΄λ₯Ό μ¬μ©νλ κ²μ, μ’λ νΉμ ν ννΉμ μν΄ μ¬μ©νλ€κ³  λ³΄μλ©΄ λ©λλ€.

        - `mlx_expose_hook` : λΈμΆ μ΄λ²€νΈ(12) μ λν mlx_hook μ μ¨λ¦¬μμ€ ν¨μμ΄λ€.
        - `mlx_key_hook` : key up μ΄λ²€νΈ(3)μ λν mlx_hookμ μ¨λ¦¬μμ€ ν¨μμ΄λ€.
        - `mlx_mouse_hook` : λ§μ°μ€ λ€μ΄ μ΄λ²€νΈ(4) μ λν mlx_hookμ μ¨λ¦¬μμ€ ν¨μμ΄λ€.

    4.  Usage Example

        `mlx_key_hook` μ νΈμΆ λμ μ μμλ‘ `keypress` κ·Έλ¦¬κ³  `keyRelease` μ΄λ²€νΈλ₯Ό λ±λ‘ν  μ μμ΅λλ€. μ΄μ  ν€λ₯Ό λλ₯΄κ² λλ©΄ μ°½μ λ«νκ² λ  κ²μ΄λ€.

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

    μ΄μ  μ λ§€ν μμ΄λμ΄λ€μ μ΄λ»κ² κ΅¬μ²΄μ μΌλ‘ μλμν€κ² λ§λ€μ§λ₯Ό μκ°ν΄λ΄μλ€.

    - `ESC` λ₯Ό λλ₯΄λ©΄, μ°½μ μ’λ£λκ² λ§λ λ€.
    - μ°½ μ¬μ΄μ¦κ° λ³κ²½μ΄ λλ©΄, μ΄μ λ°λΌ ν°λ―Έλμ λ¬΄μΈκ° μΆλ ₯λκ² λ§λ λ€.
    - (λ§₯ κΈ°μ€)λΆμ x λ²νΌμ΄ ν΄λ¦­λλ©΄, ν΄λΉ μ°½μ μμ ν μ’λ£μν΅λλ€.
      - P.S) Default μνμμ mlx λΌμ΄λΈλ¬λ¦¬λ₯Ό μ¬μ©ν νλ‘κ·Έλ¨μ x λ²νΌμ κ·Έλ₯ λλ₯Ό μ νλ‘μΈμ€ μμ²΄λ μ£½μ§ μμ΅λλ€. μ°½λ§ μ¬λΌμ§κ² λ©λλ€.
    - x μ΄ μ΄μ κΈΈκ² ν€λ₯Ό λλ₯΄λ©΄, ν°λ―Έλμ λ¬΄μΈκ° νμλκ² ν©λλ€.
    - λ§μ°μ€κ° μ°½ μμΌλ‘ λ€μ΄κ°κ² λλ©΄, ν°λ―Έλ μμ `Hello!` λΌκ³  λμ€κ² νκ³ , λ λλ©΄ `Bye!` λΌκ³  μΆλ ₯λκ² λ§λ­λλ€.

## μ£Όμ λ³ λΌμ΄λΈλ¬λ¦¬ μ€λͺ(λ§ν¬ μ°Έμ‘°)

ν΄λΉ λ΄μ©λ€μ λΆλμ΄ λλ¬΄ λ§μ κ΄κ³λ‘ λ§ν¬λ‘ λμ  ν©λλ€.

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
