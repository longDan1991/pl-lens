import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/pl-lens/',
  lang: 'zh-CN',
  title: 'PL Lens',
  description: '以 TypeScript / Python 为锚点，从 PL 原理到低延迟系统工程：Rust & C++ 实战与面试指南',
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '第 0 章', link: '/00-mindset/01-pl-coordinate-system' },
      { text: '内存真相', link: '/01-memory-truth/01-stack-heap-allocator' },
      { text: '所有权与 RAII', link: '/02-ownership-raii/01-rust-ownership-borrowing' },
      { text: '类型与抽象', link: '/03-type-system/01-adt-error-handling' },
      { text: '并发与无锁', link: '/04-concurrency/01-send-sync-mutex' },
      { text: '生产工程', link: '/05-production/01-cargo-cmake-lto' }
    ],
    sidebar: [
      {
        text: '第 0 章：写惯了 TS 和 Python，为什么一碰 Rust 和 C++ 就浑身难受？',
        collapsed: false,
        items: [
          { text: '0.1 为什么你的直觉在系统语言里全线失效？', link: '/00-mindset/01-pl-coordinate-system' },
          { text: '0.2 为什么 P99.9 尾延迟会把 GC 语言按在地上摩擦？', link: '/00-mindset/02-p99-latency-and-architecture' }
        ]
      },
      {
        text: '第 1 章：没有 GC 的世界有多残酷？从一次段错误看透计算机内存真相',
        collapsed: false,
        items: [
          { text: '1.1 局部变量返回个指针，程序怎么就炸了？', link: '/01-memory-truth/01-stack-heap-allocator' },
          { text: '1.2 同样的逻辑，换个字段顺序为什么能快 10 倍？', link: '/01-memory-truth/02-alignment-cache-line' },
          { text: '1.3 编译器为什么敢“偷偷删掉”你的空指针检查？', link: '/01-memory-truth/03-aliasing-and-ub' },
          { text: '1.4 别再拿 f64 做精确累加和比较了', link: '/01-memory-truth/04-float-and-fixed-point' }
        ]
      },
      {
        text: '第 2 章：为什么 Rust 编译器天天骂你，C++ 却笑着让你线上崩溃？',
        collapsed: true,
        items: [
          { text: '2.1 把读写锁搬进编译期：所有权到底在管什么？', link: '/02-ownership-raii/01-rust-ownership-borrowing' },
          { text: '2.2 std::move 根本没移动任何内存？', link: '/02-ownership-raii/02-cpp-raii-move' },
          { text: '2.3 智能指针一用就循环引用或性能掉底？', link: '/02-ownership-raii/03-smart-pointers' },
          { text: '2.4 热路径上调用一次 malloc，延迟就失控了', link: '/02-ownership-raii/04-zero-allocation-arena' },
          { text: '2.5 [Lab 1] 手写缓存友好型定长池与 LRU', link: '/02-ownership-raii/05-lab1-pool-lru' }
        ]
      },
      {
        text: '第 3 章：告别 null 和 try/catch：如何把 80% 的 Bug 摁死在编译期？',
        collapsed: true,
        items: [
          { text: '3.1 为什么高性能热路径要对异常说不？', link: '/03-type-system/01-adt-error-handling' },
          { text: '3.2 零拷贝切片的刀尖舞蹈', link: '/03-type-system/02-zero-copy-views' },
          { text: '3.3 虚函数表到底慢在哪？', link: '/03-type-system/03-static-vs-dynamic-dispatch' },
          { text: '3.4 [Lab 2] 零拷贝二进制帧解码器 + JSON 对照', link: '/03-type-system/04-lab2-binary-json-decoder' }
        ]
      },
      {
        text: '第 4 章：多线程一写就死锁？拆穿无栈状态机与内存序',
        collapsed: true,
        items: [
          { text: '4.1 编译期拦住数据竞争，凭什么只有 Rust 做得到？', link: '/04-concurrency/01-send-sync-mutex' },
          { text: '4.2 CPU 和编译器都在乱序执行，标志位还靠谱吗？', link: '/04-concurrency/02-atomics-memory-order' },
          { text: '4.3 [Lab 3] 手撕无锁 SPSC Ring Buffer', link: '/04-concurrency/03-lab3-spsc-ring-buffer' },
          { text: '4.4 拆开 async/await 黑盒：协程到底有没有栈？', link: '/04-concurrency/04-stackless-vs-stackful' },
          { text: '4.5 为什么极致低延迟宁愿死循环空转，也不用 epoll？', link: '/04-concurrency/05-busy-polling-vs-epoll' }
        ]
      },
      {
        text: '第 5 章：能跑通 Demo 根本不算会：进生产必须跨过的 5 道工程门槛',
        collapsed: true,
        items: [
          { text: '5.1 别再手写 Makefile 和乱配依赖了', link: '/05-production/01-cargo-cmake-lto' },
          { text: '5.2 上线前揪出所有内存越界和数据竞争', link: '/05-production/02-sanitizers-miri' },
          { text: '5.3 别猜哪里慢：拿硬件计数器和汇编说话', link: '/05-production/03-perf-asm-benchmark' },
          { text: '5.4 [Lab 4] 给 Python 装上 Rust/C++ 涡轮引擎', link: '/05-production/04-lab4-python-ffi' }
        ]
      }
    ],
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
