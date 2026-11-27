# 1.2 `struct`、`enum` 与模式匹配

> **核心结论**：Rust 没有 `class` 和继承。数据用 `struct`（积类型）和 `enum`（和类型）建模，行为用 `impl` 块挂载，`match` 强制编译期穷尽检查。

---

## 一、与 TS / Python 的直接映射

| 概念 | TypeScript | Rust | 关键区别 |
|---|---|---|---|
| **结构体 / 对象** | `interface Order { id: number; qty: number }` | `struct Order { id: u64, qty: u32 }` | Rust 字段连续扁平存储，无原型链 |
| **联合类型（ADT）** | `type Event = { kind: 'New'; qty: number } \| { kind: 'Cancel' }` | `enum Event { New { qty: u32 }, Cancel }` | Rust 原生带 tag，内存按最大变体对齐，无需手写 `kind` 字段 |
| **空值** | `T \| null \| undefined` | `Option<T>` (`Some(T)` / `None`) | Rust **没有 `null`**，空值必须通过 `Option` 显式处理 |
| **分支匹配** | `switch (e.kind)`（漏写分支不报错，除非手写 `never` 检查） | `match e { ... }` | **漏掉任何变体直接编译失败** |

---

## 二、最小可运行示例

```rust
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Order {
    pub id: u64,
    pub price_ticks: i64,
    pub qty: u32,
}

impl Order {
    // 关联函数（类似静态构造函数），无 self
    pub fn new(id: u64, price_ticks: i64, qty: u32) -> Self {
        Self { id, price_ticks, qty }
    }

    // 不可变借用方法（只读）
    pub fn notional(&self) -> i64 {
        self.price_ticks * i64::from(self.qty)
    }

    // 可变借用方法（原地修改）
    pub fn fill(&mut self, filled: u32) -> u32 {
        let actual = filled.min(self.qty);
        self.qty -= actual;
        actual
    }
}

/// 和类型（Tagged Union）：每个变体可携带完全不同的数据
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

---

## 三、高频语法与踩坑

### 1. 只关心 1 个分支时，用 `if let` / `let ... else`

不必每次都写完整 `match`：

```rust
pub fn extract_cancel_id(event: &OrderEvent) -> Option<u64> {
    let OrderEvent::Cancel(id) = event else {
        return None;
    };
    Some(*id)
}
```

### 2. `#[derive(...)]` 宏自动生成常用能力

Rust 结构体默认**不能打印、不能比较、不能克隆**，需按需标注：
- `Debug`：允许 `{:?}` 打印调试；
- `Clone` / `Copy`：显式克隆 / 按位浅拷贝；
- `PartialEq, Eq`：允许 `==` 比较。

### 3. 小心 `enum` 内存膨胀

`enum` 的大小 = **判别标签（discriminant） + 最大变体的大小 + 对齐填充**。
若 99% 的变体只有 8 字节，但 1 个冷门变体有 1 KB，**所有值都会占 1 KB+**。工程解法：把大变体包一层 `Box<LargePayload>`（降为 8 字节指针）。

---

## 四、面试追问 Q&A

### Q1：Rust 的 `Option<&T>` 占多少字节？有额外标签开销吗？

- **结论**：在 64 位平台上只占 **8 字节**，零额外标签开销。
- **原理**：编译器执行 **空指针优化（Niche Optimization）**。因为合法引用 `&T` 绝不可能为 `0`，编译器直接用全 `0` 表示 `None`，非 `0` 地址表示 `Some(&T)`。

### Q2：Rust 为什么放弃 OOP 继承，改用 `struct` + `enum` + `Trait`？

- **结论**：解耦数据布局与多态行为，避免菱形继承和隐式虚表开销。
- **原理**：封闭集合用 `enum` + `match`（编译期穷尽检查、连续内存布局）；开放扩展用 `Trait`（静态单态化或显式 `dyn Trait` 胖指针，不侵入原结构体定义）。

---

- 官方参考：[Structs](https://doc.rust-lang.org/book/ch05-00-structs.html) · [Enums and Pattern Matching](https://doc.rust-lang.org/book/ch06-00-enums.html)
