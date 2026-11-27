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
      { text: 'PL 总书', link: '/pl/' },
      { text: 'Rust', link: '/rust/' },
      { text: 'C++', link: '/cpp/' },
      { text: 'Go', link: '/go/' },
      { text: 'Python', link: '/python/' }
    ],
    sidebar: {
      '/pl/': [
        {
          text: 'PL 总书',
          items: [{ text: '概览', link: '/pl/' }]
        },
        {
          text: '0. 坐标系',
          collapsed: false,
          items: [
            { text: '0.1 心智模型', link: '/pl/00-mindset/01-pl-coordinate-system' },
            { text: '0.2 尾延迟', link: '/pl/00-mindset/02-p99-latency-and-architecture' }
          ]
        },
        {
          text: '1. 内存真相',
          collapsed: false,
          items: [
            { text: '1.1 栈与堆', link: '/pl/01-memory-truth/01-stack-heap-allocator' },
            { text: '1.2 缓存行', link: '/pl/01-memory-truth/02-alignment-cache-line' },
            { text: '1.3 未定义行为', link: '/pl/01-memory-truth/03-aliasing-and-ub' },
            { text: '1.4 浮点数', link: '/pl/01-memory-truth/04-float-and-fixed-point' }
          ]
        },
        {
          text: '2. 资源管理',
          collapsed: true,
          items: [
            { text: '2.1 所有权', link: '/pl/02-ownership-raii/01-rust-ownership-borrowing' },
            { text: '2.2 移动语义', link: '/pl/02-ownership-raii/02-cpp-raii-move' },
            { text: '2.3 智能指针', link: '/pl/02-ownership-raii/03-smart-pointers' },
            { text: '2.4 零堆分配', link: '/pl/02-ownership-raii/04-zero-allocation-arena' },
            { text: '2.5 Lab 1：定长池', link: '/pl/02-ownership-raii/05-lab1-pool-lru' }
          ]
        },
        {
          text: '3. 类型抽象',
          collapsed: true,
          items: [
            { text: '3.1 错误模型', link: '/pl/03-type-system/01-adt-error-handling' },
            { text: '3.2 零拷贝视图', link: '/pl/03-type-system/02-zero-copy-views' },
            { text: '3.3 派发成本', link: '/pl/03-type-system/03-static-vs-dynamic-dispatch' },
            { text: '3.4 Lab 2：解码器', link: '/pl/03-type-system/04-lab2-binary-json-decoder' }
          ]
        },
        {
          text: '4. 并发模型',
          collapsed: true,
          items: [
            { text: '4.1 数据竞争', link: '/pl/04-concurrency/01-send-sync-mutex' },
            { text: '4.2 内存序', link: '/pl/04-concurrency/02-atomics-memory-order' },
            { text: '4.3 Lab 3：无锁队列', link: '/pl/04-concurrency/03-lab3-spsc-ring-buffer' },
            { text: '4.4 协程', link: '/pl/04-concurrency/04-stackless-vs-stackful' },
            { text: '4.5 忙轮询', link: '/pl/04-concurrency/05-busy-polling-vs-epoll' }
          ]
        },
        {
          text: '5. 生产工程',
          collapsed: true,
          items: [
            { text: '5.1 构建与链接', link: '/pl/05-production/01-cargo-cmake-lto' },
            { text: '5.2 内存排错', link: '/pl/05-production/02-sanitizers-miri' },
            { text: '5.3 性能剖析', link: '/pl/05-production/03-perf-asm-benchmark' },
            { text: '5.4 Lab 4：Python FFI', link: '/pl/05-production/04-lab4-python-ffi' }
          ]
        }
      ],
      '/rust/': [
        {
          text: 'Rust 专书',
          items: [{ text: '概览', link: '/rust/' }]
        },
        {
          text: '1. 语法',
          collapsed: false,
          items: [
            { text: '1.1 符号映射', link: '/rust/01-syntax/01-syntax-symbols' },
            { text: '1.2 变量', link: '/rust/01-syntax/02-variables' },
            { text: '1.3 结构体', link: '/rust/01-syntax/03-struct' },
            { text: '1.4 枚举', link: '/rust/01-syntax/04-enum' },
            { text: '1.5 工程组织', link: '/rust/01-syntax/05-modules-cargo' }
          ]
        },
        {
          text: '2. 所有权',
          collapsed: false,
          items: [
            { text: '2.1 所有权', link: '/rust/02-ownership/01-ownership-move-copy' },
            { text: '2.2 借用', link: '/rust/02-ownership/02-borrowing-slices' },
            { text: '2.3 生命周期', link: '/rust/02-ownership/03-lifetimes' }
          ]
        },
        {
          text: '3. 抽象',
          collapsed: true,
          items: [
            { text: '3.1 Trait', link: '/rust/03-idioms/01-generics-traits' },
            { text: '3.2 错误处理', link: '/rust/03-idioms/02-error-handling' },
            { text: '3.3 迭代器', link: '/rust/03-idioms/03-collections-iterators' }
          ]
        },
        {
          text: '4. 并发与底层',
          collapsed: true,
          items: [
            { text: '4.1 智能指针', link: '/rust/04-concurrency-sys/01-smart-pointers' },
            { text: '4.2 多线程', link: '/rust/04-concurrency-sys/02-threads-send-sync' },
            { text: '4.3 异步', link: '/rust/04-concurrency-sys/03-async-tokio' },
            { text: '4.4 底层边界', link: '/rust/04-concurrency-sys/04-unsafe-ffi-pyo3' }
          ]
        }
      ],
      '/cpp/': [
        { text: 'C++ 专书', items: [{ text: '概览', link: '/cpp/' }] }
      ],
      '/go/': [
        { text: 'Go 专书', items: [{ text: '概览', link: '/go/' }] }
      ],
      '/python/': [
        { text: 'Python 专书', items: [{ text: '概览', link: '/python/' }] }
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
