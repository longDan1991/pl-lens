# 四、运行时与并发模型

> 切入路径：**6 门语言横向拉通**

把并发拆解为两个正交问题：**调度机制（谁在什么时候跑）**与**共享状态安全（如何避免数据竞争）**。

## 本章核心议题

1. **有栈协程 vs 无栈状态机**：Go Goroutine（动态增长栈 + M:N 调度器）对比 Rust `Future` / JS `Promise` / Python `asyncio`。
2. **数据竞争的防护策略**：单线程事件循环（JS）、GIL（Python）、CSP 通信约定（Go）与 `Send`/`Sync` 静态约束（Rust）。
3. **取消传播与结构化并发**：`AbortController`、`context.Context`、`Drop` 取消与超时控制。
