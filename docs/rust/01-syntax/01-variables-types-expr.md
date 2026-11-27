# 1.1 变量、标量类型与表达式

> **核心结论**：Rust 默认不可变、强类型且无隐式数值转换；几乎所有控制流（`if`、`match`、代码块 `{}`）都是有返回值的表达式。

---

## 一、与 TS / Python 的 4 个关键差异

| 特性 | TS / Python | Rust | 工程意义 |
|---|---|---|---|
| **默认可变性** | `let` / 普通变量默认可变 | `let` 默认不可变，可变必须写 `let mut` | 减少意外状态修改，辅助编译器优化 |
| **数值类型** | 统一 `number` (`f64`) / 任意精度 `int` | 精确位宽 `i32`/`u64`/`usize`/`f64`，禁止隐式转换 | 内存大小精确可控，避免静默精度丢失 |
| **整数溢出** | TS 浮点截断 / Python 自动扩容 | Debug 模式 `panic`，Release 模式二进制补码回绕 | 必须显式选用 `checked_*` / `saturating_*` / `wrapping_*` |
| **语句 vs 表达式** | `if` 是语句（TS 另需三元 `?:`） | `if`/`match`/`{}` 都是表达式；**不加分号即返回值** | 无需三元运算符，代码更紧凑 |

---

## 二、最小可运行示例

以下示例位于 `labs/rust-basics/src/lib.rs`：

```rust
/// 1. 不可变默认、mut 可变与 Shadowing（同名遮蔽，可改变类型）
pub fn shadowing_demo(raw: &str) -> usize {
    let count = raw.trim(); // &str
    let count = count.len(); // 遮蔽为 usize，无需 mut
    count // 无分号 = 隐式返回
}

/// 2. 整数运算：不依赖 Debug/Release 溢出差异，显式处理边界
pub fn safe_add_price_ticks(base: i64, delta: i64) -> Option<i64> {
    base.checked_add(delta)
}

/// 3. 控制流即表达式（if / loop 都可以直接赋值）
pub fn classify_latency_us(us: u64) -> &'static str {
    let level = if us < 50 {
        "fast"
    } else if us < 500 {
        "normal"
    } else {
        "slow"
    };
    level
}
```

---

## 三、高频编译报错与踩坑

### 1. 多写一个分号导致返回 `()`（单元类型）

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b; // 报错：expected `i32`, found `()`
}
```

加了分号，表达式变成语句，求值结果为 `()`（类似 TS `void` / Python `None`）。删掉分号或显式写 `return a + b;`。

### 2. `as` 强转会静默截断，优先用 `try_from`

```rust
let big: i64 = 1_000_000;
let bad = big as i16;                 // 静默截断为 16960！
let safe = i16::try_from(big);        // Err(TryFromIntError)，显式暴露溢出
```

### 3. `usize` / `isize` 与平台字长绑定

数组/切片下标**必须是 `usize`**（64 位机器上是 8 字节无符号整数）。不能直接拿 `i32` 当索引：`arr[idx as usize]` 或一开始就用 `usize`。

---

## 四、面试追问 Q&A

### Q1：`let mut` 和 Shadowing（同名 `let` 遮蔽）有什么区别？

- **`let mut`**：原地修改同一块内存，**不能改变类型**。
- **Shadowing**：创建全新的绑定（可以是不同类型），旧绑定被遮蔽，仍保持不可变属性，适合解析/转换流水线。

### Q2：Rust 整数溢出在 Debug 和 Release 下行为为什么不同？工程上怎么写？

- Debug 插入溢出检查并 `panic`，帮开发阶段抓 Bug；Release 为保证零性能开销默认按补码回绕（wrapping）。
- 涉及资金、计数、索引计算时，绝不依赖默认 `+`，统一显式调用 `checked_add`、`saturating_add` 或 `wrapping_add`。

---

- 官方参考：[The Rust Programming Language - Common Programming Concepts](https://doc.rust-lang.org/book/ch03-00-common-programming-concepts.html)
