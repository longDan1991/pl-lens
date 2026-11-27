# 4.1 智能指针：当“唯一所有权”不够用时，Rust 怎么共享并修改数据？

> **副标题**：`Box` / `Rc` / `Arc` / `RefCell` / `Mutex` 选型树与 `Weak` 破循环引用

**核心结论**：普通变量受限于“单所有者 + 编译期借用检查”。需要**堆分配、多所有者共享，或运行期可变借用**时，按“单线程/多线程 × 只读/可变”查表组合智能指针即可。

---

## 一、智能指针速查选型树

| 需求 | 单线程 | 多线程 | 代价 |
|---|---|---|---|
| **堆分配（唯一所有权）** | `Box<T>` | `Box<T>` | 仅一次堆分配，零额外计数开销 |
| **多所有者共享（只读）** | `Rc<T>` | `Arc<T>` | `Rc` 普通计数；`Arc` 原子计数（有缓存同步开销） |
| **内部可变性（共享且可改）** | `Rc<RefCell<T>>` | `Arc<Mutex<T>>` / `Arc<RwLock<T>>` | `RefCell` 运行期检查（冲突 `panic`）；`Mutex` 线程互斥阻塞 |
| **打破循环引用** | `Weak<T>`（`Rc::downgrade`） | `Weak<T>`（`Arc::downgrade`） | 不增加强引用计数，读取需 `.upgrade()` |

---

## 二、三种高频组合实战

### 1. `Box<T>`：把大数据放堆上，或定义递归类型

- 递归结构体（如链表、树节点）在编译期无法算出固定大小，必须用 `Box<Node>`（固定 8 字节指针）打破无限嵌套。
- 枚举里某个冷门大变体也可以包一层 `Box<LargePayload>`，防止整个 `enum` 内存膨胀。

```rust
pub enum Expr {
    Lit(i64),
    Add(Box<Expr>, Box<Expr>),
}
```

### 2. `Rc<RefCell<T>>`：单线程共享可变状态

`RefCell<T>` 把借用规则（多读或单写）从**编译期推迟到运行期**检查。违背规则（同时两个 `borrow_mut()`）不会造成内存破坏，而是直接运行期 `panic`。

```rust
use std::cell::RefCell;
use std::rc::Rc;

let shared = Rc::new(RefCell::new(vec![1, 2]));
let handle = Rc::clone(&shared); // 只增加引用计数，不深拷贝 Vec
handle.borrow_mut().push(3);
assert_eq!(*shared.borrow(), vec![1, 2, 3]);
```

> 注意：`Rc::clone(&shared)` 是 O(1) 增加引用计数，社区惯例用 `Rc::clone(&x)` 而非 `x.clone()`，一眼区分“浅增计数”和“昂贵深拷贝”。

### 3. `Arc<Mutex<T>>`：多线程共享可变状态

`Rc` 的计数是非原子的，跨线程会数据竞争（编译器直接拒绝编译）；多线程共享一律换 `Arc`（Atomic Reference Counted）+ `Mutex`（详见 [4.2 多线程](/rust/04-concurrency-sys/02-threads-send-sync)）。

---

## 三、高频踩坑

### 1. 循环引用导致内存泄漏

两个 `Rc` 互相指向对方时，强引用计数永远 ≥ 1，离开作用域也不会 `Drop`（内存泄漏在 Rust 里属于安全行为，编译器不拦）。
**解法**：父持子用 `Rc`，子指父用 `Weak`；或者干脆用**连续 `Vec` + 整数下标句柄**替代指针图结构（更省内存、缓存更友好）。

### 2. `RefCell::borrow_mut()` 跨越过长作用域

拿到 `let mut g = cell.borrow_mut();` 后若未释放就调用了另一个也会 `borrow()` 同一 `RefCell` 的函数，会立刻运行期 `panic`。把可变借用限制在最小代码块 `{ ... }` 里，或立刻 `drop(g)`。

---

## 四、面试追问 Q&A

### Q1：`RefCell<T>` 和 `Mutex<T>` 的本质区别是什么？

- **结论**：两者都是**内部可变性（Interior Mutability）**容器，区别在**线程安全与冲突策略**。
- **原理**：`RefCell` 仅限单线程（`!Sync`），冲突时直接 `panic`；`Mutex` 跨线程安全（`Sync`），冲突时阻塞当前线程等待锁释放，且用 `MutexGuard` 借助 RAII 在离开作用域时自动解锁。

### Q2：Rust 保证了内存安全，为什么依然可能发生内存泄漏？

- **结论**：Rust 定义的“内存安全”是无 UB（无悬垂指针、无数据竞争、无越界），不包含“绝不泄漏内存”。
- **常见来源**：`Rc`/`Arc` 循环引用，或显式调用 `std::mem::forget` / `Box::leak`。

---

- 配套代码：`labs/rust-basics/src/concurrency_sys.rs`（`cargo test concurrency_sys::tests::test_smart_pointers`）
- 官方参考：[The Rust Programming Language - Smart Pointers](https://doc.rust-lang.org/book/ch15-00-smart-pointers.html)
