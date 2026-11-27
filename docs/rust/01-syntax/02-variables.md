# 1.2 变量：不可变默认、精确位宽与整数溢出

> **核心结论**：Rust 变量默认不可变、必须明确数值位宽且禁止隐式转换；整数溢出行为随编译模式变化，工程中必须显式指定溢出策略。

---

## 一、与 TS / Python 的 3 个关键差异

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

### 3. 整数溢出与补码回绕

#### 什么是“补码回绕（Wrapping）”？

定长整数在内存中占固定位数，取值范围像**里程表 / 表盘**一样首尾相连，超过上限就会从头绕回：

- **无符号整数（如 `u8`，范围 `0..=255`）**：`255`（二进制 `1111_1111`）加 `1` 产生进位，超出的第 9 位被截断，结果直接绕回 `0`（`0000_0000`）。
- **有符号整数（如 `i8`，补码存储，范围 `-128..=127`）**：`127`（`0111_1111`）加 `1` 变成 `1000_0000`，在二进制补码里正好代表 **`-128`**——正数加 1 突然变成最小负数。

Rust 的默认 `+` 在 **Debug 模式**下会插入溢出检查，一旦溢出直接 `panic` 帮你抓 Bug；在 **Release 模式**下为了零运行期开销去掉检查，直接按硬件补码静默回绕。

#### 三个显式溢出方法（工程必用）

涉及资金、价格、计数、索引计算时，禁止依赖默认 `+`，按业务语义显式选择以下三种方法（同样适用于 `_sub` / `_mul`）：

- **`checked_add`（检查溢出）**：安全返回 `Option<T>`。未溢出返回 `Some(结果)`，溢出返回 `None`，强制调用方处理异常。**资金、价格、订单量计算首选**。
- **`saturating_add`（饱和截断）**：溢出时不再增长，死死卡在类型最大值或最小值。适合计数器、进度条、限流配额。
- **`wrapping_add`（显式回绕）**：无论 Debug 还是 Release，都强制按补码表盘绕回、绝不 `panic`。适合哈希计算、环形缓冲区索引。

```rust
// 1. checked_*：溢出返回 None
assert_eq!(100_i64.checked_add(25), Some(125));
assert_eq!(i64::MAX.checked_add(1), None);

// 2. saturating_*：溢出卡在上限
assert_eq!(250_u8.saturating_add(10), 255);

// 3. wrapping_*：强制按表盘回绕
assert_eq!(255_u8.wrapping_add(1), 0);
assert_eq!(127_i8.wrapping_add(1), -128);
```

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
```

---

## 三、高频编译报错与踩坑

### 1. `as` 强转会静默截断，优先用 `try_from`

```rust
let big: i64 = 1_000_000;
let bad = big as i16;          // 静默截断为 16960
let safe = i16::try_from(big); // Err(TryFromIntError)
```

### 2. 数组下标必须是 `usize`

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
