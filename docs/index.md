---
layout: home

hero:
  name: PL Lens
  text: 单仓多书：PL 总书 + 四大语言专书
  tagline: 以 TypeScript / Python 为锚点，PL 总书横向对比 6 门语言核心机制，独立专书打通 Rust / C++ / Go / Python 语法与工程实战。
  actions:
    - theme: brand
      text: 阅读 PL 总书
      link: /pl/
    - theme: alt
      text: 进入 Rust 专书
      link: /rust/
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/longDan1991/pl-lens

features:
  - title: PL 跨语言总书
    details: 按内存、所有权、类型系统、并发与生产工程横向对比 TS / Python / Go / C / Rust / C++。
    link: /pl/
  - title: Rust 专书（更新中）
    details: 面向 TS / Python 开发者：语法速通、所有权与借用、工程惯用法与低延迟/FFI 实践。
    link: /rust/
  - title: C++ 专书（规划中）
    details: 现代 C++20：指针与引用、RAII、移动语义、模板/Concepts 与极致低延迟布局。
    link: /cpp/
  - title: Go & Python 专书（规划中）
    details: Go 高并发服务端与 GMP/逃逸分析；Python 运行时、GIL 与 PyO3/pybind11 混合架构。
    link: /go/
---

## 为什么这样设计？

| 设计决策 | 解决什么痛点 |
|---|---|
| **单仓多书（PL 总书 + 语言专书）** | 没过语法门槛直接看底层对比看不懂；只学单语言教程又只见树木不见森林。**专书解决“写得动”，总书解决“看得透”**。 |
| **面向 TS / Python 重构，不搬官方文档** | 官方文档面向零基础，前几章节奏过慢。以熟悉的语言为锚点，跳过通用编程常识，直击差异、盲区与工程惯用法。 |
| **双层标题（极简索引 + 问题钩子）** | 侧边栏用 2–5 字概念词作**记忆索引**，一眼记住全书骨架；正文 H1 抛出具体痛点或反直觉现象，带着问题读更容易记住因果。 |

## 全站书架导航

| 书目 | 定位 | 当前进度 |
|---|---|---|
| **[PL 总书](/pl/)** | 6 章 · 24 篇，跨语言 PL 机制对比与低延迟系统主线 | 第 0 章（0.1–0.2）已发布 |
| **[Rust 专书](/rust/)** | 4 模块 · 15 篇，解决语法门槛与工程实战，配套 `labs/rust-basics/` | 1.1–2.3 已发布（模块 1–2 完成） |
| **[C++ 专书](/cpp/)** | 现代 C++20 语法、内存控制与工程实践 | 规划中 |
| **[Go 专书](/go/)** | Go 语法速通、运行时与高并发控制面 | 规划中 |
| **[Python 专书](/python/)** | CPython 对象模型、GIL、`asyncio` 与原生扩展 FFI | 规划中 |
