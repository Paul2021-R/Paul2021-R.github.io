---
emoji: 😁
title: CPP 스터디 00 - constructor
date: '2022-09-08 21:20:00'
author: Paul
tags: CPP 42seoul
categories: study
---

#생성자 #constructor #기본생성자 #default_constructor 

# 함수 오버로딩(Overloading)
- C 에서는 라이브러리 상에서 함수 이름 1개다 한 개만 존재합니다(C 도 오버로딩이 있지 않나?)
- 하지만 C++에선 공시적으로 함수 이름이 중복이 되도 되며, 어떻게 구분할까요?
```cpp
/* 함수의 오버로딩 */
#include <iostream>

void print(int x) { std::cout << "int : " << x << std::endl; }
void print(char x) { std::cout << "char : " << x << std::endl; }
void print(double x) { std::cout << "double : " << x << std::endl; }

int main() {
  int a = 1;
  char b = 'c';
  double c = 3.2f;

  print(a);
  print(b);
  print(c);

  return 0;
}
```

```cpp
/* 함수의 오버로딩 #2 */
#include <iostream>

void print(int x) { std::cout << "int : " << x << std::endl; }
void print(double x) { std::cout << "double : " << x << std::endl; }

int main() {
  int a = 1;
  char b = 'c';
  double c = 3.2f;

  print(a);
  print(b);
  print(c);

  return 0;
}
```
- 이런 케이스의 경우 어떤식으로 실행 결과가 나올까요?
```plain
int : 1
int : 99
double : 3.2
```
- C++ 에서는 기본적으로 다른 타입의 자료형이 들어감에 따라 동일한 이름의 함수이어도, 이를 구분합니다. 동시에 위의 예시처럼 자기와 정확히 일치하는 인자를 가지는 함수가 없다면 '가장 근접한' 함수를 찾아 실행하게 됩니다. 
- C++ 컴파일러의 함수 오버로딩 과정 
	1. 자신의 타입이 정확히 일치하는 함수를 찾는다. 
	2. 일치 타입이 없으면 다음으로 형변환이 일어난다. 
		1. `char`, `unsigned char`, `short` 는 `int`
		2. `unsigned short` 는 `int`의 크기에 따라 `int` or `unsigned int`
		3. `float` 은 `double`
		4. `enum` 은 `int`
	3. 위 세부 변환에서도 일치하는 타입이 없다면 좀더 포괄적인 형변환으로 일치하는 자료타입의 함수를 찾는다. 
		- 임의의 숫자 타입은 다른 숫자 타입으로(`float` -> `int`)
		- `enum`도 숫자 타입으로
		- `0`은 포인터 타입이나 숫자 타입으로 변환된 0은 포인터 타입이나, 숫자 타입으로 변환된다. 
		- 포인터는 `void` 포인터로 변환된다. 
	4. 유저 정의된 타입 변환으로 일치하는 것을 찾는다(향후 학습 예정)
	- 이렇게까지 걸쳐 확인했으나 일치 함수를 찾지 못하거나, 두개 이상 일치하는 경우 모호하다(ambiguous)라고 판단하고 오류를 발생시킵니다. 

# Date 클래스
- class 정의에서 메소드를 정의하지 않은 경우 
- 몸통이 외부로 나와 있어도, 해당 class를 `class::`로 지정해주기만 하면, 이를 인식하게 됩니다. 
- 만약 초기 설정을 하지 않으면? 쓰레기 값이 생기게 되는데, 이를 언어차원에서 돕는게 생산자(constructor)입니다. 

# 생성자(Constructor)
```cpp
#include <iostream>

class Date {
  int year_;
  int month_;  // 1 부터 12 까지.
  int day_;    // 1 부터 31 까지.

 public:
  void SetDate(int year, int month, int date);
  void AddDay(int inc);
  void AddMonth(int inc);
  void AddYear(int inc);

  // 해당 월의 총 일 수를 구한다.
  int GetCurrentMonthTotalDays(int year, int month);

  void ShowDate();

  Date(int year, int month, int day) {
    year_ = year;
    month_ = month;
    day_ = day;
  }
};

// 생략

void Date::AddYear(int inc) { year_ += inc; }

void Date::ShowDate() {
  std::cout << "오늘은 " << year_ << " 년 " << month_ << " 월 " << day_
            << " 일 입니다 " << std::endl;
}
int main() {
  Date day(2011, 3, 1);
  day.ShowDate();

  day.AddYear(10);
  day.ShowDate();

  return 0;
}
```

- 위 예시를 성공적으로 컴파일 되면, 다음처럼 결과물이 나옵니다. 

```plain
오늘은 2011 년 3 월 1 일 입니다 
오늘은 2021 년 3 월 1 일 입니다
```

이때 자동으로 호출되면서 객체를 초기화 해주는 역할을 담당하는 것이 `생성자` 입니다. 생성자 방식은 암시적, 명시적 두가지 방법으로 사용이 가능합니다. 

```cpp
Date day(2011, 3, 1); // 암시적 방법
Date day = Date(2012, 3, 1); // 명시적 방법
```

보이는 것처럼 마치 함수를 쓰듯이 클래스 명과 필요한 인자를 넣거나, 대입하는 형태로 사용 가능합니다. 

# 기본생성자(Default constructor)
- 그렇다면, `SetDate` 함수를 사용하지 않고, 객체 초기화를 하지 않았다면, 그때 클래스 변수 하나를 선언한다고 할 때, 과연 생성자는 호출 될까요? 
```cpp
Date day;
```
- 결론적으로 컴파일러는 자동으로, 생성자를 호출합니다. 인자가 없어도 자동으로 추가해주며, 그러나 이때 쓰레기 값이 나올 수 있습니다. 그렇기에, 해당 부분을 본인이 직접 설정해주어서 편리하게 쓸 수도 있습니다. 

```cpp
// 디폴트 생성자 정의해보기
#include <iostream>

class Date {
  int year_;
  int month_;  // 1 부터 12 까지.
  int day_;    // 1 부터 31 까지.

 public:
  void ShowDate();

  Date() {
    year_ = 2012;
    month_ = 7;
    day_ = 12;
  }
};

void Date::ShowDate() {
  std::cout << "오늘은 " << year_ << " 년 " << month_ << " 월 " << day_
            << " 일 입니다 " << std::endl;
}

int main() {
  Date day = Date();
  Date day2;

  day.ShowDate();
  day2.ShowDate();

  return 0;
}
```

```cpp
Date() {
    year_ = 2012;
    month_ = 7;
    day_ = 12;
  }
```
이 부분이 기본 생성자를 정의했고, 이를 통해서 
```cpp
Date day = Date();
Date day2;
```
이런 식으로 사용하게 되면 기본 생성자로 `day`, `day2`를 추가한 것이 됩니다. 단 주의 사항으로 
```cpp
Date day3()
```
<span style="background-color: red; color: white;">이거처럼 할 경우 리턴값이 Date인 함수 day3을 정의한 것으로 인식합니다. </span>
### 명시적으로 디폴트 생성자 사용하기
C++ 11 에서 추가된 방법
```cpp
class Test {
 public:
  Test() = default;  // 디폴트 생성자를 정의해라
};
```

# 생성자 오버로딩 
생성자 역시 함수이므로 함수 오버로딩을 적용하는게 가능합니다.
```cpp
#include <iostream>

class Date {
  int year_;
  int month_;  // 1 부터 12 까지.
  int day_;    // 1 부터 31 까지.

 public:
  void ShowDate();

  Date() {
    std::cout << "기본 생성자 호출!" << std::endl;
    year_ = 2012;
    month_ = 7;
    day_ = 12;
  }

  Date(int year, int month, int day) {
    std::cout << "인자 3 개인 생성자 호출!" << std::endl;
    year_ = year;
    month_ = month;
    day_ = day;
  }
};

void Date::ShowDate() {
  std::cout << "오늘은 " << year_ << " 년 " << month_ << " 월 " << day_
            << " 일 입니다 " << std::endl;
}
int main() {
  Date day = Date();
  Date day2(2012, 10, 31);

  day.ShowDate();
  day2.ShowDate();

  return 0;
}
```

```toc

```
