---
title: "[MMP] Stl相关类库"
date: 2017-08-13 17:09:45
categories: [学习笔记, MMP]  
tags: MMP
---
stl涉及到多线程的一些内容。<!--more-->这部分有一些内容（atomic）在前面已经提到，重复的这里就不会再记录。  
_这部分内容不想整理（感觉没什么好整理的，但是又不想删掉以前的笔记），因为网上很多地方都有同样的内容，也不想弄成类库文档（已经有官方文档），尽量记一些其它内容，关于类库使用直接查官方文档即可。_   

boost的相关类库跟stl的差不多，比stl多的那些等以后再整理，因为记到了其它文档里等整理到了再单独拿出来。

这里讨论的是vs中vc带的stl。
因为相关的类库调用到很多编译器内部函数（intrin.h），所以很多都不能直接分析源码，能分析的就尽量分析。  

# Thread
不用的函数：
_beginthreadex
因为C运行库之前不支持多线程，很多函数都往全局变量写，所以使用这个函数可以让这部分数据线程独享，这样就不会出问题了，这个函数以前还有，现在编译环境貌似没了。
现在用的是 std::thread

`<thread>`
创建即执行。在析构时，如果线程未结束，将会引发异常；可用detach将线程和对象分离。
get_id 可以取到tid。  
native_handle 可取得线程句柄，可用来设置关联性。  
可用thread::hardware_concurrency取得核心数。

在运行过程中可在线程内部用this_thread管理（sleep、yield）或获得一些相关信息（取tid）。  

用法没什么特别的：
```cpp
using namespace std;
thread t([]() {
	this_thread::yield();
});
t.join();
thread([](int) {
	this_thread::sleep_for(chrono::seconds(1));
}, 123).detach();
thread([](int) {
	this_thread::sleep_until(chrono::system_clock::now() + chrono::seconds(1));
}, 123).join();
```

# Atomic
`<atomic>`
提供了C、C++两种风格的实现方式。  

在做类似
```cpp
if (!flag)
{
	// ...
	flag = true;
}
```
的结构时可以用atomic_flag来做flag，因为上面那个不是线程安全的，用这个类型实现会很方便：
```cpp
if (!flag.test_and_set())
{
	// ...
}
```
`test_and_set` 当前是true就返回true，false返回false，并设置当前值为true。  
需要用`ATOMIC_FLAG_INIT`设置初始值，包括flag在内，atomic都需要设置初值，否则就是未初始化类型。

其它情况可以用atomic类，它对很多类型都有特化（包括指针），所以不必担心会出问题。  
load、store、内存序什么的其它文档已记录，这里略。  

exchange和store都可以用原子操作的形式设定值，但是exchange会返回旧值。
所以前面的例子可以这样：
```cpp
atomic<bool> flag(false);
if (!flag.exchange(true))
{
	// ...
}
```

cas比较并交换
`compare_exchange_strong`、`compare_exchange_weak` 
```cpp
atomic<int> num(0);
int inOut = 123;
int newVal = 456;
bool ret = num.compare_exchange_strong(inOut, newVal, orderSucc, orderFail);
```
比较inOut，如果num跟inOut相同（返回值会为true，否则false），会把num设置为newVal，当不相等时inOut会设置为num的旧值（相等设不设置都一样）；当相等时会用orderSucc的排序方式，否则用orderFail。
简单来说就是，返回inOut==num，设置inOut为num旧值，当(inOut==num)==true时，num=newVal。

关于strong、weak，在x86/64环境执行路径完全相同。

