---
emoji: 🖥
title: MinilibX_07_Images(수정중)
date: '2022-03-14 01:40:00'
author: Paul
tags: 42seoul so_long MiniLibX
categories: 42_seoul
---

### Images

1.  Introduction

    mlx 상에서 완벽한 잠재력 끌어 내기 위해 중요한 도구중에 하나이다. 이 함수들은 당신이 이미지 객체로부터 파일을 직접 읽는 것을 허락해줍니다. 이는 텍스쳐나 스프라이트 등에 매우 유용합니다.

2.  Reading images

    파일부터 이미지 객체까지 읽어 들이기 위하여, 우리는 XMP 혹은 PNG 포맷을 필요로 합니다. 읽기 위해, 우리는 `mlx_xpm_file_to_image` 와 `mlx_png_file_to_image` 라는 함수 호출이 필요합니다. 이때 `mlx_png_file_to_image`는 현재 메모리 누수가 존재한다. 두 함수들은 모두 동일한 인자들과 동일한 사용성을 제공한다.

    ```c
    #include <mlx.h>

    int	main(void)
    {
    	void	*mlx;
    	void	*img;
    	char	*relative_path = "./test.xpm";
    	int		img_width;
    	int		img_height;

    	mlx = mlx_init();
    	img = mlx_xpm_file_to_image(mlx, relative_path, &img_width, &img_height);
    }
    ```

    만약 `img` 변수가 널값이라면, 이는 이미지를 읽는 것에 실패했다는 의미다. 또한 `img_width` 와 `img_height` 은 스프라이트를 읽을 때도 동일한 존재다.

3.  Test your skills!
    1.  기호에 맞게 커서를 Import 해보고, 창 안을 자연스럽게 돌아다녀 봅시다.
    2.  텍스쳐를 import 하고 복사해서 창 전체에 복사해봅시다.

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
