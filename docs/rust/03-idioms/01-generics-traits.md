# 3.1 泛型、Trait 与 dyn Trait

> **核心主题**：单态化静态派发、胖指针动态派发与孤儿规则

::: info 编写中
本文已纳入《Rust 专书》路线图，将按 **与 TS/Python 核心差异 → 最小可运行代码与踩坑 → 面试追问 Q&A** 结构编写。
:::

## 待写提纲

- `impl Trait for Type` 协议展开与运算符重载（如 `PartialEq` 对应 Python `__eq__`、`Display` 对应 `__str__`）
- 静态派发（泛型单态化）vs 动态派发（`dyn Trait` 胖指针与对象安全）
- 孤儿规则（Orphan Rule）与 Newtype 模式
