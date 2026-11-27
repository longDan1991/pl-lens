# Rust 专书

面向 **TypeScript / Python 开发者** 的 Rust 实战指南：跳过零基础通用编程常识，聚焦语法差异、所有权核心、工程惯用法与系统底层。

## 学习路线（4 模块 · 13 篇）

| 模块 | 篇目 | 状态 |
|---|---|---|
| **模块 1：语法速通** | [1.1 变量、标量类型与表达式](/rust/01-syntax/01-variables-types-expr)<br>[1.2 `struct`、`enum` 与模式匹配](/rust/01-syntax/02-struct-enum-match)<br>[1.3 模块系统与 Cargo 工程结构](/rust/01-syntax/03-modules-cargo) | 1.1–1.2 已发布 |
| **模块 2：核心三座大山** | 2.1 所有权、Move 与 `Copy`/`Clone`<br>2.2 借用与切片（`&str` / `&[T]`）<br>2.3 生命周期标注实战 | 规划中 |
| **模块 3：抽象与工程惯用法** | 3.1 泛型、Trait 与 `dyn Trait`<br>3.2 `Option`/`Result`、`?` 与错误处理<br>3.3 集合、闭包与零开销迭代器 | 规划中 |
| **模块 4：并发与系统深水区** | 4.1 智能指针与内部可变性<br>4.2 多线程、Channel 与 `Send`/`Sync`<br>4.3 `async/await` 与 `tokio` 基础<br>4.4 `unsafe` 边界、`#[repr(C)]` 与 `PyO3` | 规划中 |

## 配套可运行代码

所有示例放在仓库 `labs/rust-basics/` 中，本地直接运行：

```bash
cd labs/rust-basics
cargo test
cargo run
```
