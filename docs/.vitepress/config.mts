import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/pl-lens/',
  lang: 'zh-CN',
  title: 'PL Lens',
  description: '单仓多书：PL 跨语言核心对比总书 + Rust / C++ / Go / Python 独立工程专书',
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'PL 总书', link: '/pl/00-mindset/01-pl-coordinate-system' },
      { text: 'Rust', link: '/rust/' },
      { text: 'C++', link: '/cpp/' },
      { text: 'Go', link: '/go/' },
      { text: 'Python', link: '/python/' }
    ],
    sidebar: {
      '/pl/': [
        {
          text: '第 0 章：心智模型与延迟光谱',
          collapsed: false,
          items: [
            { text: '0.1 为什么你的直觉在系统语言里全线失效？', link: '/pl/00-mindset/01-pl-coordinate-system' },
            { text: '0.2 为什么 P99.9 尾延迟决定核心路径选型？', link: '/pl/00-mindset/02-p99-latency-and-architecture' }
          ]
        },
        {
          text: '第 1 章：没有 GC 的内存真相',
          collapsed: false,
          items: [
            { text: '1.1 局部变量返回指针为什么会炸？', link: '/pl/01-memory-truth/01-stack-heap-allocator' },
            { text: '1.2 换个字段顺序为什么能快 10 倍？', link: '/pl/01-memory-truth/02-alignment-cache-line' },
            { text: '1.3 编译器为什么敢删掉空指针检查？', link: '/pl/01-memory-truth/03-aliasing-and-ub' },
            { text: '1.4 为什么不能拿 f64 做精确累加和比较？', link: '/pl/01-memory-truth/04-float-and-fixed-point' }
          ]
        },
        {
          text: '第 2 章：零成本资源管理对决',
          collapsed: true,
          items: [
            { text: '2.1 把读写锁搬进编译期：所有权在管什么？', link: '/pl/02-ownership-raii/01-rust-ownership-borrowing' },
            { text: '2.2 std::move 根本没移动任何内存？', link: '/pl/02-ownership-raii/02-cpp-raii-move' },
            { text: '2.3 智能指针选型与循环引用陷阱', link: '/pl/02-ownership-raii/03-smart-pointers' },
            { text: '2.4 热路径零堆分配：Arena 与 Object Pool', link: '/pl/02-ownership-raii/04-zero-allocation-arena' },
            { text: '2.5 [Lab 1] 缓存友好型定长池与 LRU', link: '/pl/02-ownership-raii/05-lab1-pool-lru' }
          ]
        },
        {
          text: '第 3 章：类型系统与零成本抽象',
          collapsed: true,
          items: [
            { text: '3.1 为什么高性能热路径要对异常说不？', link: '/pl/03-type-system/01-adt-error-handling' },
            { text: '3.2 零拷贝切片：&[u8] vs std::span', link: '/pl/03-type-system/02-zero-copy-views' },
            { text: '3.3 虚函数表到底慢在哪？', link: '/pl/03-type-system/03-static-vs-dynamic-dispatch' },
            { text: '3.4 [Lab 2] 零拷贝二进制帧解码器 + JSON 对照', link: '/pl/03-type-system/04-lab2-binary-json-decoder' }
          ]
        },
        {
          text: '第 4 章：并发、内存序与无栈协程',
          collapsed: true,
          items: [
            { text: '4.1 编译期拦住数据竞争：Send/Sync vs Mutex', link: '/pl/04-concurrency/01-send-sync-mutex' },
            { text: '4.2 乱序执行与内存序（Acquire-Release）', link: '/pl/04-concurrency/02-atomics-memory-order' },
            { text: '4.3 [Lab 3] 手撕无锁 SPSC Ring Buffer', link: '/pl/04-concurrency/03-lab3-spsc-ring-buffer' },
            { text: '4.4 协程到底有没有栈？Future vs GMP', link: '/pl/04-concurrency/04-stackless-vs-stackful' },
            { text: '4.5 忙轮询 vs epoll：数据面与控制面', link: '/pl/04-concurrency/05-busy-polling-vs-epoll' }
          ]
        },
        {
          text: '第 5 章：生产工程与底层排错',
          collapsed: true,
          items: [
            { text: '5.1 Cargo Workspace vs 现代 CMake 与 LTO/PGO', link: '/pl/05-production/01-cargo-cmake-lto' },
            { text: '5.2 ASan / UBSan / TSan 与 miri 排错', link: '/pl/05-production/02-sanitizers-miri' },
            { text: '5.3 P99.9 压测、perf 硬件计数器与反汇编', link: '/pl/05-production/03-perf-asm-benchmark' },
            { text: '5.4 [Lab 4] Python 原生扩展：PyO3 / pybind11', link: '/pl/05-production/04-lab4-python-ffi' }
          ]
        }
      ],
      '/rust/': [
        {
          text: 'Rust 专书导览',
          items: [{ text: '概览与路线图', link: '/rust/' }]
        },
        {
          text: '模块 1：语法速通（TS/Python 迁移）',
          collapsed: false,
          items: [
            { text: '1.1 变量、标量类型与表达式', link: '/rust/01-syntax/01-variables-types-expr' },
            { text: '1.2 struct、enum 与模式匹配', link: '/rust/01-syntax/02-struct-enum-match' },
            { text: '1.3 模块系统与 Cargo 工程结构', link: '/rust/01-syntax/03-modules-cargo' }
          ]
        },
        {
          text: '模块 2：核心三座大山',
          collapsed: false,
          items: [
            { text: '2.1 所有权、Move 与 Copy/Clone', link: '/rust/02-ownership/01-ownership-move-copy' },
            { text: '2.2 借用与切片（&str / &[T]）', link: '/rust/02-ownership/02-borrowing-slices' },
            { text: '2.3 生命周期标注实战', link: '/rust/02-ownership/03-lifetimes' }
          ]
        },
        {
          text: '模块 3：抽象与工程惯用法',
          collapsed: true,
          items: [
            { text: '3.1 泛型、Trait 与 dyn Trait', link: '/rust/03-idioms/01-generics-traits' },
            { text: '3.2 Option/Result、? 与错误处理', link: '/rust/03-idioms/02-error-handling' },
            { text: '3.3 集合、闭包与零开销迭代器', link: '/rust/03-idioms/03-collections-iterators' }
          ]
        },
        {
          text: '模块 4：并发与系统深水区',
          collapsed: true,
          items: [
            { text: '4.1 智能指针与内部可变性', link: '/rust/04-concurrency-sys/01-smart-pointers' },
            { text: '4.2 多线程、Channel 与 Send/Sync', link: '/rust/04-concurrency-sys/02-threads-send-sync' },
            { text: '4.3 async/await 与 tokio 基础', link: '/rust/04-concurrency-sys/03-async-tokio' },
            { text: '4.4 unsafe 边界、#[repr(C)] 与 PyO3', link: '/rust/04-concurrency-sys/04-unsafe-ffi-pyo3' }
          ]
        }
      ],
      '/cpp/': [
        { text: 'C++ 专书', items: [{ text: '概览与规划', link: '/cpp/' }] }
      ],
      '/go/': [
        { text: 'Go 专书', items: [{ text: '概览与规划', link: '/go/' }] }
      ],
      '/python/': [
        { text: 'Python 专书', items: [{ text: '概览与规划', link: '/python/' }] }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/longDan1991/pl-lens' }
    ],
    search: {
      provider: 'local'
    },
    outline: {
      level: [2, 3],
      label: '本页目录'
    }
  }
})
