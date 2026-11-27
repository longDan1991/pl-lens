# Rust 专书

面向 **TypeScript / Python 开发者** 的 Rust 实战指南：跳过零基础编程常识，直击语法差异、所有权核心、工程惯用法与系统底层。

## 为什么是这 4 个模块？（按认知阻力递增）

编排严格遵循 TS / Python 开发者学 Rust 时**真实撞墙的先后顺序**：

1. **语法（符号映射 → 变量 → 结构体 → 枚举 → 工程组织）**：先扫盲。第一篇把 TS/Python 缺失的符号一次认全；将容易混淆的 `struct` 与 `enum` 拆成独立两篇打透，最快达到能读懂代码、能跑 Cargo。
2. **所有权（所有权 → 借用 → 生命周期）**：专攻 Rust 80% 编译报错的根源，单独成章不与基础语法混杂。
3. **抽象（Trait → 错误处理 → 迭代器）**：掌握无类继承、无 `try/catch` 下的地道工程组织方式。
4. **并发与底层（智能指针 → 多线程 → 异步 → 底层边界）**：补齐共享可变状态（`Arc`/`Mutex`/`RefCell`），向上接并发与 `tokio`，向下接 `unsafe`、`#[repr(C)]` 与 `PyO3`，与 PL 总书汇合。

## 学习路线（4 模块 · 15 篇）

| 模块 | 概念索引 | 状态 |
|---|---|---|
| **1. 语法** | [1.1 符号映射](/rust/01-syntax/01-syntax-symbols) · [1.2 变量](/rust/01-syntax/02-variables) · [1.3 结构体](/rust/01-syntax/03-struct) · [1.4 枚举](/rust/01-syntax/04-enum) · [1.5 工程组织](/rust/01-syntax/05-modules-cargo) | 已发布（1.1–1.5） |
| **2. 所有权** | [2.1 所有权](/rust/02-ownership/01-ownership-move-copy) · [2.2 借用](/rust/02-ownership/02-borrowing-slices) · [2.3 生命周期](/rust/02-ownership/03-lifetimes) | 2.1–2.2 已发布 |
| **3. 抽象** | [3.1 Trait](/rust/03-idioms/01-generics-traits) · [3.2 错误处理](/rust/03-idioms/02-error-handling) · [3.3 迭代器](/rust/03-idioms/03-collections-iterators) | 规划中 |
| **4. 并发与底层** | [4.1 智能指针](/rust/04-concurrency-sys/01-smart-pointers) · [4.2 多线程](/rust/04-concurrency-sys/02-threads-send-sync) · [4.3 异步](/rust/04-concurrency-sys/03-async-tokio) · [4.4 底层边界](/rust/04-concurrency-sys/04-unsafe-ffi-pyo3) | 规划中 |

## 配套可运行代码

所有示例放在仓库 `labs/rust-basics/` 中，本地直接运行：

```bash
cd labs/rust-basics
cargo test
cargo run
```
