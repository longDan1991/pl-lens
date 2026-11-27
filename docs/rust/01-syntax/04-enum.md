# 1.4 枚举：为什么 Rust 的 `enum` 比 TS / Python 强一个量级？

> **副标题**：和类型（Tagged Union）、`match` 穷尽检查与 `Option<T>` 空安全

**核心结论**：TS / Python 的 `enum` 只是常量别名；Rust 的 `enum` 是原生和类型（Tagged Union），每个变体可携带不同数据结构，`match` 在编译期强制覆盖全部分支。

---

## 一、与 TS / Python 的核心对照

### 1. 和类型与穷尽匹配（Union + `switch` → `enum` + `match`）

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

### 2. 空值也是枚举：`Option<T>` 与 `let ... else`

Rust 没有 `null`，空值用标准库枚举 `Option<T>`（`Some(T)` / `None`）表达。只关心单个变体时，用 `let ... else` 或 `if let` 替代完整 `match`：

```rust
pub fn extract_cancel_id(event: &OrderEvent) -> Option<u64> {
    let OrderEvent::Cancel(id) = event else {
        return None;
    };
    Some(*id)
}
```

---

## 二、高频踩坑

### 1. `enum` 内存膨胀

`enum` 的体积 = **判别标签（discriminant） + 最大变体体积 + 对齐填充**。
若一个冷门变体占 1 KB，其余变体只有 8 字节，该枚举的每个实例都会占 1 KB+。
**工程解法**：把大变体包一层 `Box<LargePayload>`，将其压回 8 字节指针。

### 2. 滥用 `_` 兜底会丢失穷尽检查保护

写 `match` 时尽量显式列出所有变体；只在确实需要忽略剩余分支时才用 `_ => ...`，否则后续给枚举加新变体时编译器不会提醒你漏处理。

---

## 三、面试追问 Q&A

### Q1：`Option<&T>` 在 64 位平台占多少字节？

- **结论**：**8 字节**，与裸引用 `&T` 相同，零额外标签开销。
- **原理**：编译器执行**空指针优化（Niche Optimization）**。合法引用绝不可能为 `0`，直接用全 `0` 位模式表示 `None`，非 `0` 地址表示 `Some(&T)`。

### Q2：Rust 的 `enum` 与 C 的 `union` 有什么本质区别？

- **结论**：C `union` 是不带标签的非安全内存复用；Rust `enum` 是编译器强制校验标签的 Tagged Union。
- **原理**：C 允许写入字段 A 却按字段 B 误读（未定义行为）；Rust 只能通过 `match` / `if let` 按当前合法标签解包，编译期杜绝类型混淆。

---

- 配套代码：`labs/rust-basics/src/lib.rs`
- 官方参考：[The Rust Programming Language - Enums and Pattern Matching](https://doc.rust-lang.org/book/ch06-00-enums.html)
