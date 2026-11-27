# 1.3 结构体：没有 `class` 和继承，Rust 怎么组织数据与行为？

> **副标题**：`struct` + `impl`、三种 `self` 接收者与 `#[derive]`

**核心结论**：Rust 把数据布局（`struct`）和行为实现（`impl`）拆开写；字段在内存中连续扁平存放，无原型链和对象头，也不提供类继承。

---

## 一、与 TS / Python 的核心对照

### 1. 数据与方法分离（`class` → `struct` + `impl`）

方法根据对实例的访问权限，显式声明三种接收者：
- `&self`：只读借用（最常用，不消费实例）；
- `&mut self`：可变借用（原地修改字段）；
- `self`：获取所有权（消费实例，常用于状态转换或构建器模式）。

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
    // 关联函数（无 self），惯例用 new 作构造函数
    pub fn new(id: u64, price_ticks: i64, qty: u32) -> Self {
        Self { id, price_ticks, qty }
    }

    // 只读借用
    pub fn notional(&self) -> i64 {
        self.price_ticks * i64::from(self.qty)
    }

    // 可变借用
    pub fn fill(&mut self, filled: u32) -> u32 {
        let actual = filled.min(self.qty);
        self.qty -= actual;
        actual
    }
}
```

:::

### 2. 三种结构体形态

```rust
// 1. 具名字段结构体（最常用）
struct Point { x: i32, y: i32 }

// 2. 元组结构体（常用于 Newtype 包装，零成本区分业务类型）
struct OrderId(u64);

// 3. 单元结构体（占 0 字节，常用于标记类型或状态机）
struct Empty;
```

---

## 二、高频踩坑

### 1. 结构体默认不能打印、判等、克隆

Rust 编译后会丢弃字段名等运行期元数据，需按需用 `#[derive(...)]` 在编译期生成代码（底层原理见 [PL 总书 0.1：运行期反射 vs 裸字节内存](/pl/00-mindset/01-pl-coordinate-system)）：
- `Debug`：支持 `{:?}` 调试输出；
- `Clone` / `Copy`：显式深拷贝 / 按位浅拷贝；
- `PartialEq, Eq`：支持 `==` 比较。

### 2. 字段默认私有

即使结构体本身标记为 `pub struct Order`，内部字段默认仍是私有的；外部模块要直接访问，字段也必须加 `pub`。

---

## 三、面试追问 Q&A

### Q1：Rust 为什么放弃 OOP 继承，改用 `struct` + `enum` + `Trait`？

- **结论**：解耦内存布局与多态行为，避免菱形继承和隐式虚表开销。
- **原理**：封闭类型集合用 `enum` + `match`（连续内存、编译期穷尽检查）；开放扩展用 `Trait`（静态单态化或显式 `dyn Trait` 胖指针，不侵入原结构体定义）。

### Q2：Newtype 模式 `struct PriceTicks(i64)` 有运行期开销吗？

- **结论**：**零开销**。
- **原理**：编译后内存布局与裸 `i64` 完全一致，但在编译期能彻底防止把 `OrderId(u64)` 误传给 `PriceTicks(i64)`。

---

- 配套代码：`labs/rust-basics/src/lib.rs`
- 官方参考：[The Rust Programming Language - Structs](https://doc.rust-lang.org/book/ch05-00-structs.html)
