# 1.3 `struct`、`enum` 与模式匹配

> **核心结论**：Rust 没有 `class` 和继承。数据用 `struct`（积类型）和 `enum`（和类型）建模，行为挂载在 `impl` 块里，`match` 在编译期强制穷尽检查。

---

## 一、与 TS / Python 的核心对照

### 1. 结构体与方法（`class` → `struct` + `impl`）

Rust 将字段布局与方法分离：字段连续扁平存储，无原型链和对象头；方法接收 `&self`（只读）、`&mut self`（可写）或 `self`（消费所有权）。

::: code-group

```ts [TypeScript]
class Order {
  constructor(public id: number, public priceTicks: number, public qty: number) {}

  notional(): number {
    return this.priceTicks * this.qty
  }

  fill(filled: number): number {
    const actual = Math.min(filled, this.qty)
    this.qty -= actual
    return actual
  }
}
```

```python [Python]
from dataclasses import dataclass

@dataclass
class Order:
    id: int
    price_ticks: int
    qty: int

    def notional(self) -> int:
        return self.price_ticks * self.qty

    def fill(self, filled: int) -> int:
        actual = min(filled, self.qty)
        self.qty -= actual
        return actual
```

```rust [Rust]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Order {
    pub id: u64,
    pub price_ticks: i64,
    pub qty: u32,
}

impl Order {
    pub fn new(id: u64, price_ticks: i64, qty: u32) -> Self {
        Self { id, price_ticks, qty }
    }

    pub fn notional(&self) -> i64 {
        self.price_ticks * i64::from(self.qty)
    }

    pub fn fill(&mut self, filled: u32) -> u32 {
        let actual = filled.min(self.qty);
        self.qty -= actual;
        actual
    }
}
```

:::

### 2. 和类型与穷尽匹配（Union + `switch` → `enum` + `match`）

Rust `enum` 是原生 Tagged Union：每个变体可携带不同数据，无需手写 `kind` 字段；`match` 漏写任意变体会直接编译失败。

::: code-group

```ts [TypeScript]
type OrderEvent =
  | { kind: 'new'; order: Order }
  | { kind: 'modify'; id: number; newQty: number }
  | { kind: 'cancel'; id: number }

function describeEvent(e: OrderEvent): string {
  switch (e.kind) {
    case 'new': return `new #${e.order.id} qty=${e.order.qty}`
    case 'modify': return `mod #${e.id} qty=${e.newQty}`
    case 'cancel': return `cancel #${e.id}`
  }
}
```

```python [Python]
from dataclasses import dataclass

@dataclass
class NewOrder: order: Order

@dataclass
class ModifyOrder: id: int; new_qty: int

@dataclass
class CancelOrder: id: int

OrderEvent = NewOrder | ModifyOrder | CancelOrder

def describe_event(e: OrderEvent) -> str:
    match e:
        case NewOrder(o): return f"new #{o.id} qty={o.qty}"
        case ModifyOrder(id, new_qty): return f"mod #{id} qty={new_qty}"
        case CancelOrder(id): return f"cancel #{id}"
```

```rust [Rust]
#[derive(Debug, PartialEq, Eq)]
pub enum OrderEvent {
    New(Order),
    Modify { id: u64, new_qty: u32 },
    Cancel(u64),
}

pub fn describe_event(event: &OrderEvent) -> String {
    match event {
        OrderEvent::New(o) => format!("new #{} qty={}", o.id, o.qty),
        OrderEvent::Modify { id, new_qty } => format!("mod #{} qty={}", id, new_qty),
        OrderEvent::Cancel(id) => format!("cancel #{}", id),
    }
}
```

:::

### 3. 空值处理（`null` → `Option<T>`）

Rust 没有 `null`，空值统一用标准库枚举 `Option<T>`（`Some(T)` / `None`）表达。只关心单个分支时，用 `let ... else` 或 `if let` 替代完整 `match`。

```rust
pub fn extract_cancel_id(event: &OrderEvent) -> Option<u64> {
    let OrderEvent::Cancel(id) = event else {
        return None;
    };
    Some(*id)
}
```

---

## 二、高频语法与踩坑

### 1. 结构体默认不具备打印/判等/克隆能力

需显式通过 `#[derive(...)]` 让编译器生成：
- `Debug`：支持 `{:?}` 调试输出；
- `Clone` / `Copy`：显式克隆 / 按位浅拷贝；
- `PartialEq, Eq`：支持 `==` 比较。

### 2. 小心 `enum` 内存膨胀

`enum` 的体积 = 判别标签 + **最大变体体积** + 对齐填充。
若一个冷门变体占 1 KB，其余变体只有 8 字节，所有该枚举值都会占 1 KB+。工程解法：把大变体包一层 `Box<LargePayload>`（降为 8 字节指针）。

---

## 三、面试追问 Q&A

### Q1：`Option<&T>` 在 64 位平台占多少字节？

- **结论**：**8 字节**，与裸引用 `&T` 相同，零额外标签开销。
- **原理**：编译器执行**空指针优化（Niche Optimization）**。合法引用绝不为 `0`，直接用全 `0` 位模式表示 `None`，非 `0` 地址表示 `Some(&T)`。

### Q2：Rust 为什么放弃 OOP 继承，改用 `struct` + `enum` + `Trait`？

- **结论**：解耦内存布局与多态行为，避免菱形继承和隐式虚表开销。
- **原理**：封闭类型集合用 `enum` + `match`（编译期穷尽检查、连续内存）；开放扩展用 `Trait`（静态单态化或显式 `dyn Trait` 胖指针，不侵入原结构体）。

---

- 官方参考：[Structs](https://doc.rust-lang.org/book/ch05-00-structs.html) · [Enums and Pattern Matching](https://doc.rust-lang.org/book/ch06-00-enums.html)
