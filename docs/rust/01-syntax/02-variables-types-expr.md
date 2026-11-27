# 1.2 变量、标量类型与表达式

> **核心结论**：Rust 默认不可变、强类型且禁止隐式数值转换；`if`、`match`、代码块 `{}` 都是有返回值的表达式。

---

## 一、与 TS / Python 的 4 个关键差异

### 1. 默认不可变与 Shadowing（同名遮蔽）

- `let` 默认不可变，原地修改必须写 `let mut`（不能改类型）。
- 同名再次 `let` 叫 **Shadowing**，会创建新绑定并允许改变类型，适合解析流水线。

::: code-group

```ts [TypeScript]
let count: string | number = '  hello  '.trim()
count = count.length
```

```python [Python]
count = "  hello  ".strip()
count = len(count)
```

```rust [Rust]
let mut n = 1;
n += 1; // 原地修改，类型始终是 i32

let count = "  hello  ".trim(); // &str
let count = count.len();        // Shadowing 为 usize，无需 mut
```

:::

### 2. 精确位宽数值与禁止隐式转换

TS 只有 `number`（`f64`），Python `int` 自动扩容；Rust 必须明确位宽（`i32` / `i64` / `u64` / `usize` / `f64`），不同类型不能直接相加。

::: code-group

```ts [TypeScript]
const a: number = 10
const b: number = 2.5
const sum = a + b // 12.5
```

```python [Python]
a: int = 10
b: float = 2.5
sum_val = a + b  # 12.5，int 自动提升为 float
```

```rust [Rust]
let a: i32 = 10;
let b: f64 = 2.5;
// let sum = a + b;           // 编译报错：不同类型禁止隐式转换
let sum = f64::from(a) + b;   // 必须显式转换
```

:::

### 3. 整数溢出行为

Rust 的 `+` 在 Debug 模式溢出直接 `panic`，在 Release 模式按补码静默回绕（wrapping）。
涉及资金、计数、边界计算时，显式使用 `checked_*` / `saturating_*` / `wrapping_*`。

```rust
let ok = 100_i64.checked_add(25);       // Some(125)
let overflow = i64::MAX.checked_add(1); // None
let clamped = u8::MAX.saturating_add(5); // 255（饱和截断）
```

### 4. 控制流即表达式

Rust 没有三元运算符 `a ? b : c`，直接用 `if` 表达式赋值；代码块最后一行**不加分号**即返回值。

::: code-group

```ts [TypeScript]
const level = us < 50 ? 'fast' : us < 500 ? 'normal' : 'slow'
```

```python [Python]
level = "fast" if us < 50 else ("normal" if us < 500 else "slow")
```

```rust [Rust]
let level = if us < 50 {
    "fast"
} else if us < 500 {
    "normal"
} else {
    "slow"
};
```

:::

---

## 二、最小可运行示例

完整代码与单元测试见 `labs/rust-basics/src/lib.rs`：

```rust
pub fn shadowing_demo(raw: &str) -> usize {
    let count = raw.trim();
    let count = count.len();
    count
}

pub fn safe_add_price_ticks(base: i64, delta: i64) -> Option<i64> {
    base.checked_add(delta)
}

pub fn classify_latency_us(us: u64) -> &'static str {
    if us < 50 {
        "fast"
    } else if us < 500 {
        "normal"
    } else {
        "slow"
    }
}
```

---

## 三、高频编译报错与踩坑

### 1. 多写一个分号导致返回 `()`

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b; // 报错：expected `i32`, found `()`
}
```

加分号会把表达式变成语句，求值结果为单元类型 `()`（对应 TS `void` / Python `None`）。删掉分号或显式 `return a + b;`。

### 2. `as` 强转会静默截断，优先用 `try_from`

```rust
let big: i64 = 1_000_000;
let bad = big as i16;          // 静默截断为 16960
let safe = i16::try_from(big); // Err(TryFromIntError)
```

### 3. 数组下标必须是 `usize`

`usize` 与平台字长绑定（64 位机为 8 字节无符号整数）。不能拿 `i32` 直接索引切片，需用 `usize` 或 `usize::try_from(idx)`。

---

## 四、面试追问 Q&A

### Q1：`let mut` 和 Shadowing 有什么区别？

- **`let mut`**：原地修改同一块内存，不能改变类型。
- **Shadowing**：创建新绑定并遮蔽旧名称，可改变类型且新绑定默认不可变。

### Q2：Rust 整数溢出在 Debug 和 Release 下行为为什么不同？

- Debug 插入溢出检查并 `panic` 方便排错；Release 为零性能开销默认补码回绕。
- 工程中禁止依赖默认溢出语义，显式调用 `checked_*` / `saturating_*` / `wrapping_*`。

---

- 官方参考：[The Rust Programming Language - Common Programming Concepts](https://doc.rust-lang.org/book/ch03-00-common-programming-concepts.html)
