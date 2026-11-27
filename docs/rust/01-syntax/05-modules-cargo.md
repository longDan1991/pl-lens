# 1.5 工程组织：为什么 Rust 的文件不能直接 `import`？

> **副标题**：模块树（`mod` / `pub` / `use`）、Crate 边界与 Cargo Workspace

**核心结论**：TS / Python 以**文件系统**为模块入口，建好文件就能 `import`；Rust 以 **`crate` 根文件（`src/lib.rs` / `src/main.rs`）**为起点，文件必须显式用 `mod` 挂进模块树才参与编译。

---

## 一、与 TS / Python 的 4 个关键差异

### 1. 文件不会自动成为模块（必须显式 `mod`）

新建一个 `src/pricing.rs` 后，如果不写 `mod pricing;`，编译器完全无视它。`mod` 只在**父模块里声明一次**；其他文件引用它用 `use`，不要重复写 `mod`。

::: code-group

```ts [TypeScript]
// src/index.ts：直接按文件路径 import
import { calcNotional } from './pricing'
```

```python [Python]
# main.py：直接按目录/文件名 import
from pricing import calc_notional
```

```rust [Rust]
// src/lib.rs：先把 src/pricing.rs 挂进模块树
pub mod pricing;

// 其他文件里通过 crate 路径引入，绝不重复写 mod pricing;
use crate::pricing::calc_notional;
```

:::

### 2. 默认私有与细粒度可见性

Rust 所有项（函数、结构体、结构体字段、模块）**默认私有**。子模块可以看到父模块的私有项，但父模块看不到子模块的私有项。

- `pub`：对外完全公开（跨 crate 可见）。
- `pub(crate)`：仅当前 crate 内部公开，不暴露给外部调用方（工程最常用）。
- `pub(super)`：仅对直接父模块公开。

```rust
pub struct Engine {
    pub id: u64,               // 外部可直接读写
    pub(crate) seq: u64,       // 仅本 crate 内可访问
    secret_key: [u8; 32],      // 仅本模块及子模块可见
}
```

### 3. 路径根与 `pub use` 重导出

Rust 路径有三个固定起点：`crate::`（当前包根）、`super::`（父模块，类似 `..`）、`self::`（当前模块）。

工程里常用 **`pub use`** 在 `src/lib.rs` 扁平重导出核心类型，避免调用方写很长的嵌套路径：

```rust
// src/lib.rs
mod order;
pub use order::{Order, OrderEvent}; // 外部直接 use my_crate::Order;
```

### 4. Cargo 工程结构（Package / Crate / Workspace）

| 概念 | 对应 TS / Python | 含义 |
|---|---|---|
| **Package** | `package.json` / `pyproject.toml` 项目 | 含一个 `Cargo.toml` 的工程单元 |
| **Crate** | 编译产物（库或可执行程序） | 编译与类型检查的最小单元；一个 Package 最多 1 个库 crate（`src/lib.rs`）+ 多个二进制 crate（`src/main.rs`、`src/bin/*.rs`） |
| **Module** | 命名空间 / 文件 | crate 内部用 `mod` 划分的可见性与组织单元 |
| **Workspace** | pnpm workspace / monorepo | 根 `Cargo.toml` 用 `[workspace] members = [...]` 统一管理多个子 crate，共享 `Cargo.lock` 与 `target/` 编译缓存 |

---

## 二、典型工程目录与 `Cargo.toml`

```text
my-engine/
├── Cargo.toml          # 依赖、feature 与编译 profile
├── Cargo.lock          # 锁定精确依赖版本
├── src/
│   ├── lib.rs          # 库入口（核心逻辑写这里，方便单测与复用到多个 bin）
│   ├── main.rs         # 轻量 CLI 入口，调用 lib.rs
│   └── order/
│       ├── mod.rs      # 或改为与目录同名的 src/order.rs（Rust 2018+ 推荐）
│       └── book.rs
└── tests/
    └── integration.rs  # 集成测试（以黑盒外部视角调用 lib.rs）
```

高频 `Cargo.toml` 工程配置（特性开关与发布优化）：

```toml
[package]
name = "my-engine"
version = "0.1.0"
edition = "2021"

[features]
default = []
simd = []                # 可选编译特性：cargo build --features simd

[profile.release]
lto = "thin"             # 跨 crate 链接时优化，允许跨模块内联
codegen-units = 1        # 牺牲一点编译速度，换更高优化质量
```

---

## 三、高频报错与踩坑

### 1. 文件里写代码却没有语法提示 / 编译器不报错

99% 是因为忘了在 `lib.rs` 或父模块里写 `mod xxx;`。未挂载的文件不在模块树里，rust-analyzer 和 `rustc` 都不会编译它。

### 2. 在两个文件里都写了 `mod foo;`

这会让编译器把同一份文件当成**两个互不相干的独立模块**编译两次，导致同名类型互不兼容。记住：**`mod` 只声明一次，`use` 负责引用**。

### 3. `lib.rs` 和 `main.rs` 是两个独立的 Crate

在 `main.rs` 里引用 `lib.rs` 的内容，不能写 `mod xxx;`，而要按包名引入：`use my_engine::Order;`。

---

## 四、面试追问 Q&A

### Q1：Rust 里 Package、Crate、Module 三者有什么区别？

- **Module**：源码组织与隐私边界（`mod`）。
- **Crate**：编译器一次编译的最小单元（库或可执行文件），决定孤儿规则与 `pub(crate)` 边界。
- **Package**：由 `Cargo.toml` 管理的分发单元，可包含 0–1 个库 crate 和任意个二进制 crate。

### Q2：为什么工程惯例要把核心代码放在 `src/lib.rs`，而 `src/main.rs` 只留很薄的壳？

- `tests/` 下的集成测试和基准测试（`benches/`）只能导入**库 crate**，无法直接导入 `main.rs`；把逻辑放进 `lib.rs`，测试、基准测试和多个 `src/bin/` 命令行工具才能直接复用。

---

- 配套代码：`labs/rust-basics/`（同时演示 `lib.rs` + `main.rs` 结构）
- 官方参考：[Managing Growing Projects with Packages, Crates, and Modules](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html)
