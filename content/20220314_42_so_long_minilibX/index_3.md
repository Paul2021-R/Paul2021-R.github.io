---
emoji: π₯
title: MinilibX_03_colors(μλ£)
date: '2022-03-14 01:15:00'
author: Paul
tags: 42seoul so_long MiniLibX
categories: 42_seoul
---

### λ€μ΄κ°κΈ° μμ

ν΄λΉ λ΄μ©μ μ°Έκ³  μ λλ‘ μκ°νλ©΄ μ’μ΅λλ€. ν½μμ μ§μ  κ·Έλ¦¬λ κ³Όμ λ₯Ό μ μΈνκ³€ μ¬μ©μ±μ΄ ν¬κ² μμ§ μμ κ°λμλλ€.

### Colors

μμ μ μ ννλ‘ ννλ©λλ€. κ·Έλ¬λ―λ‘ λͺ κ°μ§ ARGB κ°μ ν¬ν¨ν  μ μλ μ μλ₯Ό νλν  μ μλλ‘ κΈ°λ―Ήμ μΈ κ²λ€μ νμλ‘ ν©λλ€.

1.  The color integer standard

    | λ¬Έμ | λ»              |
    | ---- | --------------- |
    | T    | ν¬λͺλ          |
    | R    | λΆμμ μ»΄ν¬λνΈ |
    | G    | μ΄λ‘μ μ»΄ν¬λνΈ |
    | B    | νλμ μ»΄ν¬λνΈ |

    RGB μμ λ€μμ²λΌ μ΄κΈ°ν λ  μ μλ€.

    | μ    | TRGB νμ  |
    | ----- | ---------- |
    | red   | 0x00FF0000 |
    | green | 0x0000FF00 |
    | blue  | 0x000000FF |

2.  Encoding and decoding colors

    μμ encode, decode νλ λ°©λ²μΌλ‘ λκ°μ§λ₯Ό μ¬μ©ν  μ μμ΅λλ€. λΉνΈ μ°μ°μ νμ©νλ λ°©λ²κ³Ό, int, char κ°μΌλ‘ λ³ννλ λ°©λ²μλλ€.

    - char/int conversion

      1 λ°μ΄νΈ λΉ RGB κ°μ΄ μ§μ λκ³ , λΉμ°ν 16μ§μμ μ μκ°μΌλ‘ μ§μ ν κ²μ λ°λλ‘ μ€μ νλ κ²λ κ°λ₯ ν©λλ€. μ΄λ₯Ό μν μ»¨λ²νμ μλμ κ°μ λ°©μμΌλ‘ ν  μλ μμ΅λλ€. μλλ

      ```c
      int	create_trgb(unsigned char t, unsigned char r, unsigned char g, unsigned char b)
      {
      	return (*(int *)(unsigned char [4]){b, g, r, t}); //λ€μ΄μ€λ λ¬Έμμ΄λ‘ λ μ μκ° 1λ°μ΄νΈ(λΉλΆνΈν) μ λ¬Άμ΄μ λ°°μ΄λ‘ λ§λ€κ³  λ€μ μ μλ‘ νλ³νμ νμ¬ μ μκ°μΌλ‘ νμ°ν νν
      }

      unsigned char	get_t(int trgb)
      {
      	return (((unsigned char *)&trgb)[3]); //λ°μ μ μλ₯Ό λ€μ λΉλΆνΈν char νμμΌλ‘ νλ³ν νλ€ λ°°μ΄μ²λΌ νμ¬ ν΄λΉ μμΉμ λ§λ μ μκ°μ μΆλ ₯νλ νμ
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

      λ³νμ μ΄ν΄νκΈ° μν΄μ  μλμ νλ₯Ό μ°Έκ³ νμλ©΄ λ©λλ€. `0x0FAE1` λ `int trgb` μ λ³μ μ£Όμμλλ€.

      | Address | char            | int          |
      | ------- | --------------- | ------------ |
      | 0x0FAE1 | unsigned char b | int trgb     |
      | 0x0FAE2 | unsigned char g | \[allocated] |
      | 0x0FAE3 | unsigned char r | \[allocated] |
      | 0x0FAE4 | unsigned char t | \[allocated] |

    - BitShifting

      1 λ°μ΄νΈλ `2^8 = 256` μ κ°(1 byte = 8 bits)μ μ§λλλ€. λ°λΌμ intνμΈ μκΉμ κ° λ°μ΄νΈλΉ μλ―Έλ₯Ό κ°κ² λκ³ , νλμ μμμ κ°μ λ²μλ 0 ~ 255 κ°μ§μλ₯Ό κ°μ§ μ μμ΅λλ€. λ°λΌμ TRGBμ κ°μ μ μ κ° μμ μλ²½νκ² λ΄μ μ μμ΅λλ€. λλΆμ΄ μ μ κ°μ μ¬μ©νλ λ§νΌ νλ‘κ·Έλ¨μ μΌλ‘ κ°λ€μ λ΄κΈ° μνμ¬, `bitshifting` μ μ¬μ©μ΄ κ°λ₯ν©λλ€.

      ```c
      int creat_trgb(int t, int r, int g, int b)
      {
      	return (t << 24 | r << 16 | g << 8 | b);
      }
      ```

      μ μλ μ€λ₯Έμͺ½λΆν° μΌμͺ½μΌλ‘ μ λ ¬λλ―λ‘, λΉνΈλ€μ κ±°κΎΈλ‘μ κ°μ λ°λΌ κ° κ°μ bitshift ν  νμκ° μμ΅λλ€. λ¦¬ν΄μμ λΉνΈ OR μ°μ°μΌλ‘ μλ²½ν TRGB κ°μ λ§λ€ μ μκ² λλ κ²μ΄μ§μ. λλΆμ΄ λ‘μ§μ μ  λ°λλ‘ νλ κ²μ ν΅ν΄ μΈμ½λ©λ TRGBλ‘λΆν° κ°λ³ μ μ κ°μ λ³΅κ΅¬λ κ°λ₯ν©λλ€.

      ```c
      int	get_t(int trgb)
      {
      	return ((trgb >> 24) & 0xFF); // 1λ°μ΄νΈλ₯Ό λͺ¨λ 1λ‘ μ±μ΄ κ°κ³Ό & μ°μ°μΌλ‘ 1μΈ κ²½μ°λ§ λ¨κ²¨λ²λ¦¬κ² λλ€.
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

    μ΄μ  μμ μ΄λ€ μμΌλ‘ μ΄κΈ°ν ν  μ μλμ§μ κΈ°μ΄λ₯Ό μ΄ν΄νλ€λ©΄, μ΅μν΄μ§κ³ , λ€μ μ»¬λ¬ μ‘°μ ν¨μλ€μ λ§λ€μ΄λ³΄λ κ²μ μλνλ©΄ λ©λλ€.

    - `add_shade` λ double(κ±°λ¦¬)μ int(μ) μ μΈμλλ‘ μμ©ν΄μ£Όλ ν¨μμλλ€. 0μ μμμ μμ΄λ©μ μΆκ° νμ§ μμΌλ©°, λ°λ©΄μ 1μ μλ²½νκ² μ΄λ‘κ² λ§λ€μ΄ μ€λλ€. 0.5 λ μ λ°μ λ μ΄λ‘κ² λ§λ€κ³ , .25λ 1/4 μ λ κ·Έλ κ² λ§λ­λλ€. ν΄λΉ ν¬μΈνΈλ₯Ό μ»μ΄ λ³΄μΈμ.
    - `get_opposite` ν¨μλ int(μ) μΈμλ₯Ό μμ©νκ³ , μμμ λ°μ  μμΌ μ€λλ€. β λ³΄μ μ μ»μ΄λλλ€.

<p>

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
