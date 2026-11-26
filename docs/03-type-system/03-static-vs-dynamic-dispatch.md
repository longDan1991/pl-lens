# 3.3 虚函数表到底慢在哪？

> **副标题**：静态派发 vs 动态派发（`vptr` vs `dyn Trait` 胖指针）、CRTP、`Concepts`、`constexpr` 与 `const generics`

::: info 编写中
本文已纳入《PL Lens》课程路线图，将按 **底层机制与跨语言对照 → 工程落地与踩坑（Rust & C++） → 面试连环追问 Q&A** 三段式结构展开。
:::
