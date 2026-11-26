---
layout: home

hero:
  name: PL Lens
  text: 从 PL 原理到低延迟系统工程
  tagline: 以 TypeScript / Python 为思维锚点，以 C 为底层标尺，系统打通 Rust & C++ 的内存、零成本抽象、无锁并发与生产工程。
  actions:
    - theme: brand
      text: 从第 0 章开始
      link: /00-mindset/01-pl-coordinate-system
    - theme: alt
      text: GitHub 仓库
      link: https://github.com/longDan1991/pl-lens

features:
  - title: PL 压缩视角
    details: 不背零散语法，把 6 门语言压缩到内存布局、类型等价、派发机制、并发模型等正交维度。
    link: /00-mindset/01-pl-coordinate-system
  - title: Rust & C++ 双主角
    details: 同一工程问题给出现代 C++20 与 Rust 双版本实现，直面性能、安全与可维护性的真实权衡。
    link: /02-ownership-raii/01-rust-ownership-borrowing
  - title: 确定性低延迟主线
    details: 贯穿 Cache Line、热路径零堆分配、静态派发、无锁 SPSC 队列、硬件计数器与 P99.9 尾延迟。
    link: /04-concurrency/03-lab3-spsc-ring-buffer
  - title: 实战 + 面试闭环
    details: 每篇固定「底层机制 → 工程落地与踩坑 → 面试连环追问 Q&A」，配套 4 个可运行硬核 Lab。
    link: /05-production/03-perf-asm-benchmark
---

## 全书路线图（6 章 · 24 篇）

| 章节 | 核心主题 | 关键产出（Lab） | 进度 |
|---|---|---|---|
| **第 0 章** | **写惯了 TS 和 Python，为什么一碰 Rust 和 C++ 就浑身难受？**<br/>PL 坐标系、运行时成本、P99.9 尾延迟与控制面/数据面分层 | 建立 6 语言心智模型 | 已发布（0.1–0.2） |
| **第 1 章** | **没有 GC 的世界有多残酷？从一次段错误看透计算机内存真相**<br/>栈/堆、64B Cache Line、伪共享、指针别名、UB 与定点数 | 内存布局探针与 ASan 实验 | 规划中 |
| **第 2 章** | **为什么 Rust 编译器天天骂你，C++ 却笑着让你线上崩溃？**<br/>所有权/借用 vs RAII/移动语义、智能指针与热路径零堆分配 | **Lab 1**：缓存友好型定长池与 LRU | 规划中 |
| **第 3 章** | **告别 `null` 和 `try/catch`：如何把 80% 的 Bug 摁死在编译期？**<br/>ADT/错误传播、零拷贝视图、静态派发 vs 虚表与 CRTP/Concepts | **Lab 2**：零拷贝二进制帧解码器 + JSON 对照 | 规划中 |
| **第 4 章** | **多线程一写就死锁？拆穿无栈状态机与内存序**<br/>`Send`/`Sync`、原子内存序、无锁队列、协程与忙轮询 vs `epoll` | **Lab 3**：无锁 SPSC Ring Buffer | 规划中 |
| **第 5 章** | **能跑通 Demo 根本不算会：进生产必须跨过的 5 道工程门槛**<br/>Cargo/CMake、Sanitizers/`miri`、`perf`/汇编分析与 Python FFI | **Lab 4**：PyO3 / pybind11 原生加速扩展 | 规划中 |
