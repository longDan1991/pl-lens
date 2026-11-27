# 4.1 编译期拦住数据竞争，凭什么只有 Rust 做得到？

> **副标题**：`Send`/`Sync` 静态边界 vs C++ `std::thread`/`mutex`/`condition_variable` 人工契约

::: info 编写中
本文已纳入《PL Lens》课程路线图，将按 **底层机制与跨语言对照 → 工程落地与踩坑（Rust & C++） → 面试连环追问 Q&A** 三段式结构展开。
:::
