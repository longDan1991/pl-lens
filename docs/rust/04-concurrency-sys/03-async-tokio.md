# 4.3 异步：为什么 Rust 的 `async` 函数不 `.await` 根本不会执行？

> **副标题**：惰性 `Future` 状态机、`Pin` 的存在意义、`tokio` 运行时与阻塞避坑

**核心结论**：JS `Promise` 一创建就立刻开始跑；Rust `async fn` 是**零成本无栈状态机**，调用它只是返回一个惰性的 `impl Future`，必须交给执行器（如 `tokio`）不断 `poll` 才会推进。

---

## 一、与 TS / Python 的核心对照

| 维度 | TypeScript (`Promise`) | Python (`asyncio`) | Rust (`async` / `tokio`) |
|---|---|---|---|
| **触发时机** | **热启动**：调用即执行 | **惰性**：返回协程对象，需事件循环驱动 | **惰性**：返回 `Future` 状态机，需执行器 `poll` |
| **内置运行时** | 有（V8 Event Loop） | 有（标准库 `asyncio`） | **无**（标准库只定 `Future` Trait，社区主流用 `tokio`） |
| **并发能力** | 单线程 | 单线程（受 GIL 限制） | 多线程 Work-Stealing 调度 |
| **取消方式** | `AbortController` | `task.cancel()` 抛 `CancelledError` | **直接 `Drop` 该 `Future`** 即可停止推进 |

::: code-group

```ts [TypeScript]
async function fetchPrice(): Promise<number> {
  return 100
}
const p = fetchPrice() // 已经开始执行
const v = await p
```

```python [Python]
import asyncio

async def fetch_price() -> int:
    return 100

coro = fetch_price()   # 惰性，尚未执行
v = await coro
```

```rust [Rust]
// 需要 tokio 运行时驱动（#[tokio::main]）
async fn fetch_price() -> i64 {
    100
}

let fut = fetch_price(); // 惰性：只是构造了一个状态机结构体，未执行
let v = fut.await;       // 驱动执行
```

:::

---

## 二、拆开黑盒：`Future::poll` 与 `Pin`

### 1. `Future` 的真实定义

```rust
pub trait Future {
    type Output;
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
}
```

- 每次 `poll` 只返回两种结果：`Poll::Pending`（I/O 还没就绪，注册 `Waker` 后立刻让出线程）或 `Poll::Ready(val)`（完成）。
- 编译器把整个 `async fn` 按 `.await` 切点改写成一个 `enum` 状态机，只把**跨 `.await` 存活的局部变量**存进该状态机，不需要为每个任务分配几 KB 的独立调用栈（无栈协程）。

### 2. 为什么需要 `Pin<&mut Self>`？

如果 `async fn` 里一个局部变量借用了另一个局部变量（跨 `.await` 保存），编译生成的 `Future` 结构体内部就会出现**自引用指针**（指向自身另一个字段的地址）。
如果允许该 `Future` 在内存里被 Move 到新地址，内部指针立刻悬垂。`Pin` 就是告诉编译器：**这个值一旦开始 `poll`，内存地址钉死，禁止再 Move**。

---

## 三、`tokio` 生产三大避坑

### 1. 绝不在 `async` 任务里跑阻塞 I/O 或重 CPU 计算

`tokio` 默认只有等于 CPU 核数的工作线程。在 `async fn` 里直接调用 `std::thread::sleep`、同步文件读写或重计算，会把整条工作线程卡死，导致同线程上千个异步任务集体饿死。
- **解法**：异步等待用 `tokio::time::sleep`；重 CPU / 同步阻塞任务扔进专用阻塞池 `tokio::task::spawn_blocking(...)`。

### 2. 绝不跨 `.await` 持有 `std::sync::MutexGuard`

`std::sync::MutexGuard` 不是 `Send`，跨 `.await` 可能导致任务被调度到另一线程解锁或直接死锁（编译器通常会拦住）。
- **短临界区（不跨 `.await`）**：优先用 `std::sync::Mutex`（锁完立刻 `drop`，比异步锁快得多）。
- **必须跨 `.await` 持锁**：改用 `tokio::sync::Mutex`。

### 3. `tokio::select!` 中的取消安全（Cancel Safety）

`select!` 竞争多个分支时，未胜出的分支会被直接 `Drop` 取消。丢弃半截状态机可能丢数据（例如已读出一半缓冲区的 `AsyncRead`），生产中优先选明确标明 Cancel Safe 的方法（如 `mpsc::Receiver::recv`）。

---

## 四、面试追问 Q&A

### Q1：Rust 的无栈协程（`tokio`）和 Go 的有栈协程（Goroutine）有什么权衡？

- **结论**：Rust 无栈协程单任务内存极小（几十字节）、无运行时栈扩容与 GC 扫描开销，但存在函数染色（`async` 传染）和 `Pin` 复杂度；Go Goroutine 写起来像同步代码（无染色），代价是独立栈（初始 2KB+ 动态扩缩）和调度器开销（详见 [PL 总书 4.4 协程](/pl/04-concurrency/04-stackless-vs-stackful)）。

### Q2：既然 Rust 有 `tokio`，极致低延迟核心数据面为什么常不用 `tokio`？

- **结论**：`tokio` 擅长高并发网络 I/O（控制面/网关）；极致微秒级数据面往往追求单线程绑核 + 忙轮询 + 无锁队列，避免 `epoll` 系统调用与多线程调度抖动（详见 [PL 总书 4.5 忙轮询](/pl/04-concurrency/05-busy-polling-vs-epoll)）。

---

- 配套代码：`labs/rust-basics/src/concurrency_sys.rs`（`cargo test concurrency_sys::tests::test_manual_future_poll`，用标准库零依赖手写 `Future::poll` 状态机）
- 官方参考：[Asynchronous Programming in Rust](https://rust-lang.github.io/async-book/) · [Tokio Tutorial](https://tokio.rs/tokio/tutorial)
