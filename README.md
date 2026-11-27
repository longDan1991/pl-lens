# PL Lens

单仓多书知识库：**1 本 PL 跨语言对比总书 + 4 本语言工程专书（Rust / C++ / Go / Python）**。

- **在线阅读**：https://longdan1991.github.io/pl-lens/
- **PL 总书（`/pl/`）**：按内存、所有权、类型系统、并发与生产工程横向对比 TS / Python / Go / C / Rust / C++。
- **语言专书（`/rust/`、`/cpp/`、`/go/`、`/python/`）**：解决语法门槛、标准库惯用法与各自擅长领域的工程实战。

## 仓库结构

```text
pl-lens/
├── docs/
│   ├── pl/               # PL 跨语言对比总书（6 章 · 24 篇）
│   ├── rust/             # Rust 专书（4 模块 · 13 篇）
│   ├── cpp/              # C++ 专书
│   ├── go/               # Go 专书
│   └── python/           # Python 专书
├── labs/                 # 可运行多语言实验（Rust / C++ / Go / Python）
├── archive/c-basics/     # 原 c-learn 仓库归档
└── .github/workflows/    # GitHub Pages 自动构建部署
```

## 本地预览

```bash
pnpm install
pnpm run docs:dev
```
