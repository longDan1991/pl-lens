# 4.4 拆开 `async/await` 的黑盒：协程到底有没有栈？

> **副标题**：`Future::poll`、`Pin`、`tokio` vs C++20 协程、Go GMP 与 JS/Python Event Loop

::: info 编写中
本文已纳入《PL Lens》课程路线图，将按 **底层机制与跨语言对照 → 工程落地与踩坑（Rust & C++） → 面试连环追问 Q&A** 三段式结构展开。
:::
