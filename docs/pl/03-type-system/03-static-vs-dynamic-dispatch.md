# 3.3 虚函数表到底慢在哪？

> **副标题**：静态派发 vs 动态派发（`vptr` vs `dyn Trait` 胖指针）、CRTP、`Concepts`、`constexpr` 与 `const generics`

::: info 编写中
本文已纳入《PL Lens》课程路线图，将按 **底层机制与跨语言对照 → 工程落地与踩坑（Rust & C++） → 面试连环追问 Q&A** 三段式结构展开。
:::

## 待写提纲

- C++ 虚函数侵入式 `vptr`（每实例多 8B、无法零侵入扩展、对象切片）vs Rust `&dyn Trait` / Go `interface` 16B 胖指针解耦布局
- 菱形继承深挖：为什么 `FlyingDog` 内存里会存在两份 `Animal` 子对象（从而导致 `flying_dog.id` 二义性），以及虚继承 `vbptr` 带来的间接寻址代价
- 静态派发（单态化 + 内联）vs 动态派发（虚表间接跳转对分支预测和内联的影响）
