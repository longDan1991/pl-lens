# 3.1 Trait：没有类继承，Rust 怎么实现多态与运算符重载？

> **副标题**：`impl Trait for Type`、静态单态化 vs `dyn Trait` 胖指针、孤儿规则

**核心结论**：Trait 是 Rust 唯一的接口与多态机制——既承担 TS `interface` / Python 魔术方法（`__eq__`、`__str__`）的角色，又让你显式选择**静态派发（零开销单态化）**或**动态派发（`dyn Trait` 胖指针）**。

---

## 一、与 TS / Python 的核心对照

### 1. 定义接口与协议实现（`impl Trait for Type`）

TS 的 `implements` 写在类定义内部；Rust 把接口实现写在结构体外部，因此可以给**已有类型（甚至标准库类型）**追加新能力，且不修改原结构体内存布局。

::: code-group

```ts [TypeScript]
interface Priced {
  notional(): number
}

class StockOrder implements Priced {
  constructor(public price: number, public qty: number) {}
  notional(): number { return this.price * this.qty }
}
```

```python [Python]
from typing import Protocol

class Priced(Protocol):
    def notional(self) -> int: ...

class StockOrder:
    def __init__(self, price: int, qty: int) -> None:
        self.price, self.qty = price, qty
    def notional(self) -> int:
        return self.price * self.qty
```

```rust [Rust]
pub trait Priced {
    fn notional(&self) -> i64;
}

pub struct StockOrder {
    pub price: i64,
    pub qty: i64,
}

impl Priced for StockOrder {
    fn notional(&self) -> i64 {
        self.price * self.qty
    }
}
```

:::

### 2. 运算符重载也是 Trait

Rust 的 `==`、`+`、格式化输出 `{}` 都由标准库 Trait 驱动（对应 Python 魔术方法）：

| 能力 | Python 魔术方法 | Rust Trait |
|---|---|---|
| 相等比较 `==` | `__eq__` | `PartialEq` |
| 排序比较 `<` / `>` | `__lt__` | `PartialOrd` / `Ord` |
| 面向用户格式化 `{}` | `__str__` | `std::fmt::Display` |
| 调试格式化 `{:?}` | `__repr__` | `std::fmt::Debug` |
| 加法运算符 `+` | `__add__` | `std::ops::Add` |

---

## 二、静态派发 vs 动态派发

### 1. 静态派发（泛型约束，默认首选）

用泛型参数 `T: Priced`（或简写 `impl Priced`）时，编译器会为每种具体类型生成独立机器码（**单态化**）并内联。零运行期开销，但容器里只能装同一种具体类型。

```rust
// 编译期单态化：调用 total_notional::<StockOrder> 时生成专用机器码
pub fn total_notional<T: Priced>(items: &[T]) -> i64 {
    items.iter().map(|x| x.notional()).sum()
}
```

### 2. 动态派发（`dyn Trait` 胖指针）

当容器需要**混装多种不同具体类型**（如同时放 `StockOrder` 和 `OptionOrder`）时，使用 `Box<dyn Priced>` 或 `&dyn Priced`。它在栈上是一个 **16 字节胖指针**（8B 数据指针 + 8B `vtable` 指针），运行期查虚表调用。

```rust
pub fn mixed_notional(items: &[Box<dyn Priced>]) -> i64 {
    items.iter().map(|x| x.notional()).sum()
}
```

| 对比维度 | 静态派发（`T: Trait`） | 动态派发（`&dyn Trait` / `Box<dyn Trait>`） |
|---|---|---|
| **运行期开销** | 零开销，可完全内联 | 间接函数调用（查 vtable），阻断内联 |
| **异构集合** | 不支持（`Vec<T>` 只能装同一类型） | 支持（`Vec<Box<dyn Trait>>` 可混装） |
| **编译与体积** | 编译较慢、二进制膨胀 | 编译快、二进制小 |
| **适用场景** | 热路径、数学/解析/撮合核心 | 插件系统、异构事件处理器、错误擦除 |

---

## 三、高频报错与工程规则

### 1. 孤儿规则（Orphan Rule）与 Newtype 绕过

为防止两个第三方库对同一类型实现冲突的 Trait，Rust 规定：**`impl Trait for Type` 中，`Trait` 或 `Type` 至少有一个必须定义在当前 crate 内**。

```rust
// 编译报错：Display 和 Vec 都来自标准库，不能直接 impl Display for Vec<i32>
// 解法：用 Newtype 包一层本地结构体
pub struct PriceList(pub Vec<i64>);

impl std::fmt::Display for PriceList {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self.0)
    }
}
```

### 2. 对象安全（Object Safety / Dyn Compatibility）

不是所有 Trait 都能写成 `dyn Trait`。如果 Trait 方法返回 `Self`（如 `Clone`）或带有泛型方法参数，编译器无法为其构造固定大小的 `vtable`，写成 `Box<dyn Clone>` 会直接编译报错。

---

## 四、面试追问 Q&A

### Q1：Rust 的 `&dyn Trait` 和 C++ 虚函数（`vptr`）在内存布局上有什么区别？

- **结论**：C++ 把 `vptr` 嵌在**对象内存头部**；Rust 把 `vtable` 指针放在**胖指针引用里**，对象本身永远是纯数据。
- **意义**：Rust 结构体零侵入，不用动态派发时零字节开销，且能给外部库类型实现新 Trait（详见 [PL 总书 3.3 派发成本](/pl/03-type-system/03-static-vs-dynamic-dispatch)）。

### Q2：什么时候该用 `enum` 替代 `Box<dyn Trait>`？

- **结论**：类型集合封闭已知（如订单事件、协议帧）优先用 `enum`；需要对外开放扩展（如插件、回调）才用 `dyn Trait`。
- **原因**：`enum` 连续存储在栈或 `Vec` 中、无堆分配和指针跳转，对 CPU 缓存远比 `Vec<Box<dyn Trait>>` 友好。

---

- 配套代码：`labs/rust-basics/src/idioms.rs`（`cargo test idioms::tests::test_static_and_dynamic_dispatch`）
- 官方参考：[The Rust Programming Language - Traits](https://doc.rust-lang.org/book/ch10-02-traits.html)
