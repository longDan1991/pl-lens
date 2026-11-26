---
layout: home

hero:
  name: PL Lens
  text: 六门语言的 PL 横向对比笔记
  tagline: 以 TypeScript / Python 为坐标系，按编程语言理论核心维度穿透 C / Go / Rust / C++。
  actions:
    - theme: brand
      text: 开始阅读
      link: /01-type-system/
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/longDan1991/pl-lens

features:
  - title: 类型系统与抽象
    details: Structural vs Nominal、代数数据类型（ADT）、泛型擦除与单态化、空安全。
    link: /01-type-system/
  - title: 内存模型与值语义
    details: 以 C 为基准，拆解栈帧、堆分配、指针别名、结构体对齐与未定义行为（UB）。
    link: /02-memory-model/
  - title: 资源管理与安全边界
    details: 对比 Go 逃逸分析 + GC、Rust 编译期所有权与借用检查、C++ RAII 与移动语义。
    link: /03-ownership-gc/
  - title: 运行时与并发模型
    details: 横向拉通 Event Loop、GIL / asyncio、M:N Goroutine 与无栈状态机协程。
    link: /04-concurrency/
---

## 六门语言的 PL 设计空间全景

| PL 维度 | TypeScript | Python | Go | C | Rust | C++ |
|---|---|---|---|---|---|---|
| **内存管理** | Tracing GC (V8) | 引用计数 + 循环 GC | 逃逸分析 + 三色标记 GC | 手动 (`malloc`/`free`) | 编译期所有权 / 借用检查 | 手动 + RAII / 智能指针 |
| **类型检查** | 静态（编译后擦除） | 动态（运行期 + 可选注解） | 静态（强类型、无隐式转换） | 静态（弱类型、允许强转） | 静态（强类型、类型推导） | 静态（强类型、隐式转换多） |
| **类型等价** | Structural（结构化） | Duck Typing（运行期） | 接口 Structural / 其余 Nominal | Nominal（名义化） | Nominal（名义化） | Nominal（名义化） |
| **泛型实现** | 类型擦除 | 运行期统一对象 | 字典 + GC Shape 单态化 | 无（宏 / `void*`） | 编译期完全单态化 | 编译期模板实例化（单态化） |
| **多态与派发** | 原型链（动态） | 属性字典（动态） | Interface 胖指针（运行期） | 函数指针（手动） | Trait 静态派发 / `dyn` 胖指针 | 虚函数表 vtable / 模板静态派发 |
| **错误处理** | 异常 (`throw`) | 异常 (`raise`) | 多返回值 `error` | 错误码 / `errno` | 代数类型 `Result<T, E>` | 异常 / `std::expected` |
| **并发模型** | 单线程 Event Loop | GIL + `asyncio` / 多进程 | M:N Goroutine + CSP Channel | OS 线程 + 锁 | OS 线程 + 无栈 `async` + `Send`/`Sync` | OS 线程 + 无栈协程 + 内存模型 |
