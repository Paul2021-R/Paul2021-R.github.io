---
emoji: 😁
title: CPP 스터디 00 - obejective language
date: '2022-09-08 21:10:00'
author: Paul
tags: CPP 42seoul
categories: study
---

#object_oriented #object #class #access_identifier
[모두의 코드](https://modoocode.com/172)

# 객체란? #객체 #추상화 #캡슐화
절차 지향 언어로 몇십년을 버텨온(?) 컴퓨터 공학은 객체 지향언어(Objected oriented language)를 발전시키게 되며, C++, Java Python, C# 등등 90년대 이후 등장한 대부분의 언어들이 객체지향언어 입니다. 

그렇다면 무엇이 부족해서 절차 지향이 객체 지향의 스타일로 바뀔 필요가 있을까요? 
```cpp
typedef struct Animal {
  char name[30];  // 이름
  int age;        // 나이

  int health;  // 체력
  int food;    // 배부른 정도
  int clean;   // 깨끗한 정도
} Animal;
```
`Animal` 구조체를 정의한 후, 변수를 만들어 이를 필요로 하는 함수들에게 
```cpp
play(list[play_with]);
```
이와 같이 전달해주었다고 가정해봅시다. 그런데 보이는 바처럼 `play`함수에게 `animal` 인자가 전달될 필요가 없었고, 개념적으로 마치 "`play`가 `Animal`하는 것으로 보여집니다."
따라서 이를 이렇게 바꾼다면 보다 명확하게 이해할 수 있을 것입니다. 
```cpp
Animal animal;

// 여러가지 초기화(생략)

animal.play();
animal.sleep();
```
이러한 구조가되면, animal을 인자로 play에 주지 않아도 됩니다. 논리적으로나 어떤 면으로나 animal은 자신의 상태를 알려주는 변수(variable)와 자신이 하는 행동들을 수행하는 함수(method)들로 이루어져 있다고 볼 수 있게 되는 것입니다. 이것이 객체에 대한 정의로 이어집니다. 

> 객체란, 변수들과 참고자료들로 이루어진 소프트웨어 덩어리이다.

객체는 현실세계 존재하는 것들을 나타내기 위한 **추상화(abstraction)** 라는 과정을 거치게 됩니다. 이는 컴퓨터가 현실세계를 100%로 나타낼 수 없기 때문에, 적절한 처리 방향으로 바꾸는 것을 의미합니다. 

![](./src/Pasted%20image%2020220905083723.png)

이러한 형태다보니, 객체는 자기만의 정보를 나타내는 변수들과, 이를 가지고 있는 어떤 작업을 하는 함수들로 감싸져 있다고 보시면 됩니다. 이를 `인스턴스 변수(instance variable)`와 `인스턴스 메소드(instance method)`라고 부르며, 일반적인 변수, 함수와 동일한 의미지만 나름의 차이는 존재합니다. 
```cpp
Animal animal

// 초기화 과정 생략

animal.food += 100; // 불가능
animal.increase_food(100); // 가능
```
기본적으로 객체의 인스턴스 변수에 직접 접근하는 것이 불가능합니다. (물론 일정 수준 사용자의 요구에 따라 바뀔 순 있다.)
보통 외부에서 직접 인스턴스 변수의 값을 바꿀 수 없고 항상 인스턴스 메소드를 통해서 간접적으로 조절하는 것을 **캡슐화(Encapsulation)** 라고 부릅니다. 
이를 통해 객체 내부적으로 어떻게 동작하는지는 몰라도 사용할 수 있다- 라는 특징이 생기게 됩니다. 이는 현실에서 일어나는 복잡한 작업과 관련성에 대해서 개발자가 일일이 처리해주는 작업이 생기는다면, 이를 내부에서 알아서 처리되도록 한번 짜줌으로서 객체를 사용하는 프로그래머가 굳이 이해하지 않아도 되게 됩니다. 
# 클래스  #class #member_variable #member_method #access_identifier 
객체를 만드는 설계도가 필요한데, 이를 클래스(class)라고 합니다. 

![](./src/Pasted%20image%2020220905085700.png)

```cpp
#include <iostream>

class Animal {
	private:
		int food;
		int weight;

	public:
		void	set_animal(int _food, int _weight){
			food = _food;
			weight = _weight;
		}
		void	increase_food(int inc){
			food += inc;
			weight += (inc / 3);
		}
		void	view_stat() {
			std::cout << "이 동물의 food   : " << food << std::endl;
			std::cout << "이 동물의 weight : " << weight << " kg" << std::endl;
		}
		int	GetWeight(){
			return (weight);
		}
};

int main(){
	Animal animal;
	std::cout << "이 동물의 초기값을 설정해 주십시오." << std::endl;
	int set_food;
	int set_weight;
	std::cout << "초기 food 값 : ";
	std::cin >> set_food;
	std::cout << "초기 weight 값 : ";
	std::cin >> set_weight;
	animal.set_animal(set_food, set_weight);
	while (true)
	{
		std::cout << "음식을 얼마나 주시겠습니까? ";
		std::cin >> set_food;
		animal.increase_food(set_food);
		animal.view_stat();
		if (animal.GetWeight() > 100)
		{
			std::cout << "이 동물이 다 컸습니다!" << std::endl;
			break ;
		}
	}
	return (0);
}
```

- 멤버 변수(member variable) : 클래스 내부에 생성되는 변수
- 멤버 함수(member function) : 클래스 내부에 생성되는, 변수들을 감싼 함수들

```cpp
private:
		int food;
		int weight;
public:
		void	set_animal(int _food, int _weight){
			food = _food;
			weight = _weight;
		}
		void	increase_food(int inc){
			food += inc;
			weight += (inc / 3);
		}
		void	view_stat() {
			std::cout << "이 동물의 food   : " << food << std::endl;
			std::cout << "이 동물의 weight : " << weight << " kg" << std::endl;
		}
		int	GetWeight(){
			return (weight);
		}
```
- 접근 지시자 : `private` 키워드 하에 쓰여진 내용은 객체 내에서 보호되고 있다는 것을 의미합니다. 객체 내부에서는 사용이 가능하지만, 외부에서 인위적으로 해당 키워드를 사용해 접근하는 것은 불가능합니다. 반대로 `public` 키워드 하에 쓰여진 멤버 함수들은 말그대로 공개되어 있기에 외부 함수, main함수에서 이들을 사용하는게 가능합니다. 
- 명시적으로 접근 지시자 를 설정하지 않은 경우 `private` 로 지정이 가능합니다. 동시에 이러한 방식이 아닌 `public`으로 변수를 설정한다면, 멤버 변수에도 직접 접근이 가능해집니다. 


```toc

```
