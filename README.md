# PL Lens

以 **TypeScript / Python** 为思维锚点，以 **C** 为底层标尺，从 **PL（编程语言理论）** 视角切入，系统打通 **Rust & C++** 的高性能与低延迟工程实践及中高级面试。

- **在线阅读**：https://longdan1991.github.io/pl-lens/
- **结构设计**：6 大章 · 24 篇专题文章 + 4 个可运行硬核工程实验（`labs/`）
- **单篇闭环**：底层机制与跨语言对照 → 工程落地与踩坑 → 面试连环追问 Q&A

## 目录结构

```text
pl-lens/
├── docs/                       # VitePress 网页书源码
│   ├── 00-mindset/             # 第 0 章：PL 坐标系与 P99.9 尾延迟架构
│   ├── 01-memory-truth/        # 第 1 章：C 底层内存、Cache Line、UB 与定点数
│   ├── 02-ownership-raii/      # 第 2 章：Rust 所有权 vs C++ RAII/移动语义与零分配
│   ├── 03-type-system/         # 第 3 章：ADT、零拷贝视图与静态/动态派发
│   ├── 04-concurrency/         # 第 4 章：Send/Sync、内存序、无锁 SPSC 与协程
│   └── 05-production/          # 第 5 章：构建、Sanitizers、perf/汇编与 Python FFI
├── labs/                       # Rust & C++ 多语言对照实验
├── archive/c-basics/           # 原 c-learn 仓库归档
└── .github/workflows/          # GitHub Pages 自动构建部署
```

## 本地预览

```bash
pnpm install
pnpm run docs:dev
```
