# 4.2 多线程：凭什么只有 Rust 能在编译期拦住数据竞争？

> **副标题**：`std::thread::scope`、`mpsc` 通道、`Arc<Mutex<T>>` 与 `Send` / `Sync` 边界

**核心结论**：Rust 把并发安全编进两个自动标记 Trait——**`Send`（可跨线程转移所有权）**和**`Sync`（可跨线程共享只读引用）**。只要不用 `unsafe`，数据竞争在编译期直接报错，不会留到线上偶现。

---

## 一、与 TS / Python 的核心差异

- **TS (Node/Browser)**：单线程 Event Loop，真正并行要靠 Worker 序列化传消息。
- **Python**：受 GIL 限制，多线程无法并行跑 CPU 密集型 Python 代码。
- **Rust**：原生 OS 1:1 线程，无 GIL，满载多核；同时靠 `Send`/`Sync` 静态拦住非线程安全类型（如 `Rc`、`RefCell`）跨线程。

---

## 二、三种高频并发模式

### 1. 共享状态：`Arc<Mutex<T>>`

Rust 的 `Mutex<T>` **把锁和数据包在一起**——不拿锁根本拿不到内部数据，彻底杜绝 C++ 里“忘了加锁直接读共享变量”的低级失误。

```rust
use std::sync::{Arc, Mutex};
use std::thread;

let counter = Arc::new(Mutex::new(0_u64));
let mut handles = Vec::new();

for _ in 0..4 {
    let counter = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        *counter.lock().unwrap() += 1;
    }));
}
for h in handles { h.join().unwrap(); }
assert_eq!(*counter.lock().unwrap(), 4);
```

### 2. 消息传递：`std::sync::mpsc` 通道

“不要靠共享内存来通信，而要靠通信来共享内存”。发送端 `tx.send(val)` 会**直接 Move 所有权**给接收端，发送后再改 `val` 直接编译失败。

```rust
use std::sync::mpsc;
use std::thread;

let (tx, rx) = mpsc::channel();
thread::spawn(move || {
    tx.send(String::from("fill-1001")).unwrap();
});
assert_eq!(rx.recv().unwrap(), "fill-1001");
```

### 3. 借用栈数据并发：`std::thread::scope`（Rust 1.63+）

普通 `thread::spawn` 要求闭包满足 `'static`，不能直接借用当前栈上的局部切片；`thread::scope` 保证作用域结束前所有子线程一定 `join` 完成，因此可以**零拷贝直接借用局部数据**并行计算：

```rust
use std::thread;

pub fn parallel_sum(data: &[i64]) -> i64 {
    let mid = data.len() / 2;
    let (left, right) = data.split_at(mid);
    thread::scope(|s| {
        let h1 = s.spawn(|| left.iter().sum::<i64>());
        let h2 = s.spawn(|| right.iter().sum::<i64>());
        h1.join().unwrap() + h2.join().unwrap()
    })
}
```

---

## 三、`Send` 与 `Sync` 到底代表什么？

- **`T: Send`**：可以把 `T` 的所有权安全地移交（Move）给另一个线程。
- **`T: Sync`**：可以把 `&T` 安全地同时分享给多个线程（等价于 `&T: Send`）。

| 类型 | `Send`？ | `Sync`？ | 原因 |
|---|---|---|---|
| `i32` / `String` / `Vec<T>` | 是 | 是 | 无内部可变共享状态 |
| `Rc<T>` | **否** | **否** | 非原子引用计数，跨线程改计数会竞争 |
| `RefCell<T>` | 是 | **否** | 运行期借用计数非原子，不可多线程共享 `&RefCell` |
| `Arc<T>`（当 `T: Send + Sync`） | 是 | 是 | 原子引用计数 |
| `Mutex<T>`（当 `T: Send`） | 是 | 是 | 锁保证同一时刻仅一线程访问内部 `T` |

---

## 四、面试追问 Q&A

### Q1：为什么 `Mutex<RefCell<T>>` 可以跨线程共享，而 `Arc<RefCell<T>>` 不行？

- **结论**：`RefCell<T>` 是 `Send` 但不是 `Sync`；`Arc<T>` 要求 `T: Send + Sync`，而 `Mutex<T>` 只需要 `T: Send`。
- **原理**：`Mutex` 自身提供互斥锁，保证同一时刻最多只有一个线程拿到内部 `RefCell`，从而把它升级成 `Sync`；`Arc` 只管计数不管互斥，多线程同时读 `&RefCell` 会触发非原子借用计数竞争，因此被编译期拦截。

### Q2：Rust 能防数据竞争，那能防死锁（Deadlock）吗？

- **结论**：**不能**。死锁属于逻辑错误而非内存安全 UB。
- **工程避坑**：两把锁始终按固定顺序加锁、缩小 `MutexGuard` 持锁作用域、热路径优先无锁队列（见 [PL 总书 4.3 无锁队列](/pl/04-concurrency/03-lab3-spsc-ring-buffer)）。

---

- 配套代码：`labs/rust-basics/src/concurrency_sys.rs`（`cargo test concurrency_sys::tests::test_threads_and_channel`）
- 官方参考：[The Rust Programming Language - Fearless Concurrency](https://doc.rust-lang.org/book/ch16-00-concurrency.html)
