---
emoji: 🖥
title: MinilibX_02_Getting Started(완료)
date: 2022-03-14 01:10:00
author: Paul
tags:
  - 42seoul
  - so_long
  - MiniLibX
categories: 42seoul
---

### Getting started

1.  들어가면서

    첫 파트에 앞서 간단한 개념 정리를 통해 MiniLibX가 무엇을 하는지를 알았습니다. 이번 파트는 그에 이어서 기초적인 것을 진행할 것입니다. 이 라이브러리를 사용하여 성능적으로 좋은 코드를 어떻게 작성하는지에 대한 정보들을 제공할 것이며, 이러한 내용은 다양한 프로젝트를 위해(앞으로 자주 쓰게 되는 만큼), 퍼포먼스는 핵심입니다. 이 섹션은 분명하게 정독 하시기를 추천 드립니다.

2.  설치 절차

- 맥에서 컴파일 하기(x86-64, intel Based)

  MiniLibX는 맥 OS의 Cocoa(Appkit) 와 OpenGL(더이상 X11을 사용하지 않는다) 필요로 하기 때문에, 우리는 두 가지 사항을 링킹할 필요가 있습니다. 이는 복잡한 컴파일 과정일 수 있습니다. 기본적인 컴파일 절차는 다음과 같습니다.

  목적파일을 위해, 당신의 프로젝트 루트 단에 `mlx`로 지정된 디렉토리 안에 mlx 소스코드가 있다는 전제 하에 다음 규칙을 당신의 Makefile에 추가하십시오.

  ```makefile
  %.o: %.c
  $(CC) -Wall -Wextra -Werror -Imlx -c $< -o $@
  ```

필요한 내장 맥 OS API를 연결시키기 위해

    ```makefile
    $(NAME): $(OBJ)
      $(CC) $(OBJ) -Lmlx -lmlx -framework OpenGL -framework AppKit -o $(NAME)
    ```

    동적 라이브러리 `libmlx.dylib`가 당신의 빌드 타겟과 동일한 디렉토리에 있어야 함을 명심하십시오.

💡 해당 방법은 x86에 해당 하는 openGL 기준의 설명입니다.

- 맥에서 컴파일 하기 2(ARM, M1 Based)<p/>
  현재 ARM 기반의 M1 맥북을 많이 사용하고 있습니다. 그런데 M1의 경우 다소 문제가 있습니다.

  1. M1부터 애플은 OpenGL을 deprecated 로 해버렸고, Graphic API 를 Metal 로 변경하였기에 OpenGL을 사용할 수 없다.
  2. 심지어 OpenGL 몇 버전을 수동으로 설치할 수 있단 이야기 조차 언급이 안되어 있다.
  3. 그나마 있는 것도 x86으로 돌리기 쉽지 않다.<p/>

  이러한 사실은 MiniLibX를 M1에서 사용하기 어렵게 만드는, 아주 큰 문제를 만들어 냈습니다. 다행인 점은 이런 상황에 맞춰 애플의 그래픽 API Metal 호환성 버전의 라이브러리(통칭 mms 버전 MiniLibX)가 만들어졌습니다. 해당 활용 시 우선 M1 맥에서의 컴파일 및 라이브러리가 사용 가능해집니다.

  하지만 상당히 큰 문제가 여전히 남아 있었는데, ARM 버전의 터미널 사용 및 컴파일 시 `ARM 기반`으로 컴파일러가 작동하게 되고, 아이맥과 같이 `42 서울 내에서 사용이 불가능`하고, mlx 라이브러리를 다시 x86으로 컴파일 하여서 과제에서 활용하는 라이브러리로 써야 합니다.(이 말은 당연히 동료 평가 전에 Makefile 도 새로이 짜있어야 할 수 있습니다.)

  이러한 호환성을 해결하는 방법은 바로 `로제타` 번역기를 활용하는 것입니다. 로제타2(Rosetta2)란 x86 용으로 만들어진 프로그램을 구동하도록 되어 있는 애플의 번역기 입니다. 아주 예전에 PowerPC 때 x86으로 넘어가기 위해 로제타 1이 있었고, 현재 ARM 코어를 위한 로제타 2가 나와 있고ㅡ 모든 M1 기반 PC에는 해당 기능이 내장되어 있습니다.

  이제 해당 기능을 활용하여 터미널 자체를 x86 버전으로 돌아가게 하면, 컴파일 및 내부 구동이 x86으로 변하게 되며 42클러스터 내의 아이맥에서 동일하게 구동이 가능해 집니다. 자세한 내용은 [이 링크([Apple M1] Rosetta Terminal 실행과 Conda 설치)](https://magoker.tistory.com/115)를 확인하시면 보다 자세히 배울 수 있습니다.

- 리눅스에서 컴파일 하기

  리눅스의 경우, 리눅스 호환의 MLX 버전, [이 링크](https://github.com/42Paris/minilibx-linux)를 사용할 수 있습니다. 해당 함수들은 정확히 동일한 역할을 합니다. 기억해야 할 것은, 객체 구현이 아키텍처에 따라 다르기 때문에 이미지 상에서 memory magic 을 사용하는 것은 다를 수 있다는 점입니다. 적용은 새로운 프로젝트 폴더에 리눅스용 MLX 를 압축 해제합니다. 이때 프로젝트 디렉토리 상에서 `mlx_linux` 라고 지정하면 됩니다. 더불어 리눅스 호환 MLX는 OpenGL API 기반 버전임을 기억해 주십시오.

  단, 의존성으로 MiniLibX for Linux 는 `xorg`, `x11`, `zlib` 가 필요 합니다. 그러므로 해당 의존성 패키지를 설치하고 진행하십시오.

  `xorg` `libext-dev` `zlib1g-dev` 해당 의존성 패키지를 다음을 통해 설치 가능합니다.

  ```shell
  sudo apt-get update && sudo apt-get install xorg libxext-dev zlib1g-dev libbsd-dev
  ```

  이제 남은 것은 MLX 의 설정입니다. `configure`스크립트를 제공된 레포지터리 루트에서 실행하면 됩니다.

  목적 파일을 위해, 당신의 프로젝트 루트에 `mlx_linux` 라고 명명한 디렉토리에 mlx 소스코드를 갖고 있다는 전제 하에 당신의 Makefile 에 다음 룰을 추가하면 됩니다.

  ```makefile
  $(NAME): $(OBJ)
  	$(CC) $(OBJ) -Lmlx_linux -lmlx_Linux -L/usr/lib -Imlx_linux -lXext -lX11 -lm -lz -o $(NAME)
  ```

- 윈도우에서 컴파일 하기(10, 11)
  원문에선 기재 되어 있으나, 필자의 환경 상 적용 및 테스트가 여의치 않아 기재하지 않았습니다. 참고 바랍니다.

3.  Initialization

MiniLibX 라이브러리를 사용해 뭔가를 해보기 전에, 모든 함수에 접근하기 위해 우리는 반드시 `<mlx.h>` 를 사용해야 하며, 우선 `mlx_init` 함수를 실행해야 합니다. 이 함수는 적절한 그래픽 시스템과의 연결을 성립하게 만들며, MLX 인스턴스의 지점을 쥔 `void *` 를 반환합니다.

```c
#include <mlx.h>

int	main(void)
{
	void	*mlx;

	mlx = mlx_init();
}
```

해당 코드를 실행하게 되면, 아무것도 팝업되지 않으며, 어떤 것도 렌더링 되지 않습니다. 이 초기화는 윈도우를 만들어내지 않았기 때문입니다. 그래서 작은 창 하나를 초기화하여 상주시켜보겠습니다. 해당 프로그램이 완성되면 검은 창이 뜨게 될 것입니다. 터미널 상에서 `CTRL+C` 로 프로세스를 종료할 수 있습니다. 이를 위해 우리는 `mlx_new_windw` 함수를 간단하게 불러오면 됩니다. 해당 함수는 생성했던 창의 포인터를 반환 할 것입니다. 여기엔 창의 가로, 높이, 그리고 타이틀을 입력하는 것이 가능합니다. 그 뒤엔 `mlx_loop` 를 통해 창의 렌더링을 실행시킬 수 있습니다.

가로 1920, 세로 1080에 이름이 “Hello world!” 인 창을 생성해봅시다.

```c
#include <mlx.h>

int	main(void)
{
	void	*mlx;
	void	*mlx_win;

	mlx = mlx_init();
	mlx_win = mlx_new_window(mlx, 1920, 1080, "Hello world!");
	mlx_loop(mlx);
}
```

4.  Writing pixels to a image

이제 기초 창 관리를 할 수 있으니, 창에 pixel들을 넣어 봅시다. 어떻게 이런 픽셀들을 취할지는 당신에게 달려있지만, 우선, `mlx_pixel_put` 함수가 매우, 매우 느리다는 점을 알고 계셔야 합니다. 이것은 이 함수가 창에 즉시 픽셀을 push 하려고 시도하기 때문입니다.(전체 렌더 되는 프레임을 위해 기다리는 행위(버퍼) 없이 진행되기 때문입니다.) 이 한 가지 문제 때문에 우리의 픽셀 전체를 이미지로 버퍼링을 해야 하고, 그 뒤에 이렇게 버퍼로 만든 데이터를 창 안에 push 해야 합니다. 상당히 복잡하게 들리지만, 이는 그렇게 어렵지 않습니다.

우선, mlx가 요구하는 이미지의 형태가 무엇인지를 이해하는걸로 시작해야 합니다. 만약 이미지를 개시하면, 중요한 변수 몇 개로 쓸 포인터들을 전달해야 합니다. 첫 번째는 `bpp` 인데, 이는 다른 말로 bits per pixel 입니다. 픽셀들은 기본적으로 정수들이며, 이들은 대게 4바이트입니다. 하지만 small endian으로 처리해준다면 달라질 수 있습니다.(이는 원격 디스플레이나 8비트 색상만 가지는 경우를 의미합니다.)

이제 image 를 1920x 1080 의 해상도로 이미지를 실행해볼 수 있습니다.

    ```c
    #include <mlx.h>

    int	main(void)
    {
    	void	*img;
    	void	*mlx;

    	mlx = mlx_init();
    	img = mlx_new_image(mlx, 1920, 1080);
    }
    ```

어렵지 않죠? 이제 이미지를 취했습니다. 하지만 어떻게 정확하게 이것에 pixel들을 쓸까요? 이를 위해선 우리는 그에따라 바이트를 변경할 메모리 주소를 취할 필요가 있습니다. 이 주소를 우리는 다음과 같이 되찾아 올 수 있습니다.

    ```c
    #include <mlx.h>

    typedef struct	s_data {
    	void	*img;
    	char	*addr;
    	int		bits_per_pixel;
    	int		line_length;
    	int		endian;
    }				t_data;

    int	main(void)
    {
    	void	*mlx;
    	t_data	img;

    	mlx = mlx_init();
    	img.img = mlx_new_image(mlx, 1920, 1080);

    	/*
    	** 이미지를 작성한 후, 우리는 `mlx_get_data_addr` 을 호출 할 수 있습니다.
    	** `bits_per_pixel`, `line_length`, `endian` 을 레퍼런스로 전달합니다.
    	** 최신 데이터 주소로 세팅 될 것입니다.
    	*/
    	img.addr = mlx_get_data_addr(img.img, &img.bits_per_pixel, &img.line_length,
    								&img.endian);
    }
    ```

위의 함수를 확인하면 `bits_per_pixel`, `line_length`, `endian` 변수를 레퍼런스로 어떻게 보내는지 알 수 있습니다.

이제 우리는 이미지의 주소를 알게 되었습니다. 하지만 여전히 픽셀들이 들어있진 않죠. 시작 전에, 우리는 바이트들이 정렬이 되어 있지 않음을 이해해야 합니다. 이것은 `line_length` 가 실제 창 너비와 다름을 의미합니다. 그러므로 우리는 **항상** `mlx_get_data_addr` 함수에 의해 설정된 line length를 사용하는 메모리의 offset을 계산해야 합니다.

이를 다음 공식을 이용하면 매우 쉽게 계산이 가능합니다.

    ```c
    int offset = (y * line_length + x * (bits_per_pixel / 8));
    ```

이제 우리는 작성하는 곳을 알기에, `mlx_pixel_put` 함수의 동작을 모사하는 함수를 매우 쉽게 작성할 수 있게 되었습니다. 물론 몇배는 더 빠르게 말이죠.

    ```c
    typedef struct	s_data {
    	void	*img;
    	char	*addr;
    	int		bits_per_pixel;
    	int		line_length;
    	int		endian;
    }				t_data;

    void	my_mlx_pixel_put(t_data *data, int x, int y, int color)
    {
    	char	*dst;

    	dst = data->addr + (y * data->line_length + x * (data->bits_per_pixel / 8));
    	*(unsigned int*)dst = color;
    }
    ```

이제 이슈를 야기 시킬겁니다. 창 안에서 실시간으로 이미지가 표지되기 때문에, 이것을 쓰기 도중에는 수 많은 화면 티어링을 같은 이미지를 바꾸는 것이 야기시키기 때문입니다. 그러므로 순간적인 프레임을 유지하기 위해 2개 혹은 그 이상의 이미지를 작성할 필요가 있습니다. 그 다음에 임시의 이미지를 작성할 수 있고, 그 결과 최근에 표시한 이미지에 쓸 필요가 없어집니다.

5.  Pushing image to a window

이제 이미지를 만들어낼 수 있고, 창에 이것들을 push 해야 합니다. 이것은 상당히 직관적입니다. 빨간 필셀을 (5, 5) 지점에 어떻게 넣어지는지를 관찰해봅시다.

```c
#include <mlx.h>

typedef struct	s_data {
	void	*img;
	char	*addr;
	int		bits_per_pixel;
	int		line_length;
	int		endian;
}				t_data;

int	main(void)
{
	void	*mlx;
	void	*mlx_win;
	t_data	img;

	mlx = mlx_init();
	mlx_win = mlx_new_window(mlx, 1920, 1080, "Hello world!");
	img.img = mlx_new_image(mlx, 1920, 1080);
	img.addr = mlx_get_data_addr(img.img, &img.bits_per_pixel, &img.line_length,
								&img.endian);
	my_mlx_pixel_put(&img, 5, 5, 0x00FF0000);
	mlx_put_image_to_window(mlx, mlx_win, img.img, 0, 0);
	mlx_loop(mlx);
}
/*
0x00FF0000 는 16진법 ARGB(0,255,0,0)를 표현한 것입니다.
*/
```

6.  Test Your Skills!

기초를 이해했다면 이 라이브러리와 함께 친숙해지고 약간 신이 날 것입니다. 아래의 내용을 테스트 한번 해보세요. 사용의 원리와 방식을 이해할 수 있을 겁니다.

- 사각형, 원, 삼각형, 육각형을 스크린 상에 pixel들로 그려봅시다.
- 그라디에션을 추가하길 시도해보고, 무지개를 그려보고, rgb 색깔 사용에 친숙해 져보십시오.
- 반복문을 활용해서 이미지를 생성하는 것으로 텍스쳐를 만들어봅시다.


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
