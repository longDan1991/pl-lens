# PL Lens

从 **PL（编程语言理论）** 视角横向对比学习 **TypeScript / Python / C / Go / Rust / C++** 的笔记与实验仓库。

- **在线阅读**：https://longdan1991.github.io/pl-lens/
- **核心方法**：按类型系统、内存模型、所有权与 GC、并发与运行时四个正交维度横向对照，配合多语言可运行实验。

## 仓库结构

```text
pl-lens/
├── docs/                  # VitePress 网页书源码
│   ├── 01-type-system/    # 类型系统与抽象
│   ├── 02-memory-model/   # 内存模型与值语义（C 基准）
│   ├── 03-ownership-gc/   # 资源管理与安全边界（Go / Rust / C++）
│   └── 04-concurrency/    # 运行时与并发模型
├── labs/                  # 多语言对照实验
├── archive/c-basics/      # 原 c-learn 仓库 C 语言基础归档
└── .github/workflows/     # GitHub Pages 自动构建部署
```

## 本地预览

```bash
pnpm install
pnpm run docs:dev
```
