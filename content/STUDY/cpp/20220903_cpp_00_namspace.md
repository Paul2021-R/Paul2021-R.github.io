---
emoji: 😁
title: CPP 스터디 00 - usingnamespace
date: '2022-09-03 09:10:00'
author: Paul
tags: CPP 42seoul
categories: study
---

# using namespace

## 개념

```cpp
// using namespace 없는 버전
#include <iostream>

int main(void)
{
	std::cout << "Hello world!" << "Another world?" << std::endl;
	return 0;
}

// using namespace 활용 버전
#include <iostream>
using namespace std;

int main(void)
{
	cout << "Hello world!" << "Another world?" << endl;
	return 0;
}
```

`std` 가 C++ 의 표준 라이브러리의 모든 함수, 객체등이 정의된 이름공간(namespace) 라고 합니다.
`이름공간` 이라는 것이 굳이 추가된 이유는, 말 그대로 어떤 정의된 객체에 대해 어디에 소속인지를 명시적으로 선언해주는 역할을 합니다.

이는 코드 크기가 늘어 남에 따라, 다른 사람의 중복된 이름의 함수들이 많아졌고, 이러한 상황을 구분하기 위해 소속된 이름 공간이 다르면 다른 것으로 취급하기 위한 도구 입니다.

```cpp
std::cout
```

위의 예시에서 보이듯, 표준 라이브러리에 있는 `cout`을 쓰겠다는 말이 됩니다.

## 사용 방법

```cpp
// header1.h 의 내용
namespace header1 {
	int foo();
	void bar();
}
```

```cpp
// header2.h 의 내용
namespace header2 {
	int foo();
	void bar();
}
```

위와 같은 예시가 있다고 할 때, 자기 자신이 포함되어 있는 이름 공간 안에선 굳이 이름 공간 명시 없이 사용이 가능합니다.

```cpp
// 자유롭게 사능 가능한 케이스
#include "header1.h"

namespace header1 {
	int func()
	{
		foo(); // 알아서 header1::foo()가 실행됩니다.
	}
}
```

이때 만약 `header2`의 `foo`를 호출한다면 이런 식으로 호출이 가능합니다.

```cpp
// header2의 foo를 불러오는 방법
#include "header1.h"
#include "header2.h"

namespace header1 {
	int func()
	{
		foo();// header1::foo() 실행
		header2::foo(); // header2의 foo()가 실행된다.

	}
}
```

동시에 어떠한 이름 공간에도 소속되지 않은 경우에는 다음처럼 명시적으로 이름 공간을 지정해서 명시적 구분으로 연결시켜 주어야 합니다.

```cpp
#include "header1.h"
#include "header2.h"

int func() {
	header1::foo();
}
```

위의 방식이 귀찮아서, 명시적으로 안쓰고, 무조건 `header1`에 있는 `foo`만 쓸거다! 라고 선언하는 것이 `using namespace` 기능입니다.

```cpp
#include "header1.h"
#include "header2.h"

using header1::foo;
int main(){
	foo(); // 무조건 header1의 foo 를 호출
}
```

여기서 더 나아가서 무조건 `header1`의 정의 모든 것을 사용하려고 한다면, 다음처럼 선언 및 사용이 가능합니다.

```cpp
#include "header1.h"
#include "header2.h"

using namespace header1;
int main()
{
	foo();
	bar();
	header2::foo(); // header2에 있는 함수를 쓰고 싶다면..
}
```

<span style="display: block; background-color: rgb(253, 243, 242); padding: 5px; margin 20px; border-radius: 10px;"> <span style="display:block; font-size: large; background-color: red; color: white; border-radius: 5px; height: 40px; line-height: 40px; padding-left: 10px;"> ☹️ 주의사항</span>해당 방식을 사용하지 말라고 하는 이유는, 겹치는 함수를 만들거나 하면 오류가 발생할수 있습니다. 더불어 C++의 표준 라이브러리 자체가 가진 방대한 기능 때문에라도 이렇게 하면 언제 어디서 꼬여서 이를 해결해야하는지 쉽게 판단이 불가능합니다.<br>따라서 권장 방식은 정확하게 직접 어떤 라이브러리인지를 명시하는 방식으로 사용 하여 작성한 코드를 이름 충돌에서 보호하는 것이 중요합니다.</span>

## 이름 없는 이름 공간

변수의 사용에 있어서 재밌는점이, 특정 이름 공간에 정의된 것들은 해당 파일에서만 접근이 되므로, 마치 `static` 키워드를 사용한 것과 같은 효과를 냅니다.

```cpp
#include <iostream>

namespace {
// 이 함수는 이 파일 안에서만 사용할 수 있습니다.
// 이는 마치 static int OnlyInThisFile() 과 동일합니다.
int OnlyInThisFile() {}

// 이 변수 역시 static int x 와 동일합니다.
int only_in_this_file = 0;
}  // namespace

int main() {
  OnlyInThisFile();
  only_in_this_file = 3;
}
```

```toc

```
