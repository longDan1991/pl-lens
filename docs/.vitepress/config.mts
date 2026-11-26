import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/pl-lens/',
  lang: 'zh-CN',
  title: 'PL Lens',
  description: '从编程语言理论（PL）视角横向对比 TypeScript / Python / C / Go / Rust / C++',
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '类型系统', link: '/01-type-system/' },
      { text: '内存模型', link: '/02-memory-model/' },
      { text: '所有权与 GC', link: '/03-ownership-gc/' },
      { text: '并发与运行时', link: '/04-concurrency/' }
    ],
    sidebar: [
      {
        text: '一、类型系统与抽象',
        items: [
          { text: '导览：从 TS/Python 看静态类型空间', link: '/01-type-system/' }
        ]
      },
      {
        text: '二、内存模型与值语义',
        items: [
          { text: '导览：以 C 建立底层内存基准', link: '/02-memory-model/' }
        ]
      },
      {
        text: '三、资源管理与安全边界',
        items: [
          { text: '导览：GC 逃逸、借用检查与 RAII', link: '/03-ownership-gc/' }
        ]
      },
      {
        text: '四、运行时与并发模型',
        items: [
          { text: '导览：事件循环、M:N 调度与无栈协程', link: '/04-concurrency/' }
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
