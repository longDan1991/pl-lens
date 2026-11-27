# 4.4 底层边界：`unsafe` 不是关闭编译器，而是把安全契约交给你

> **副标题**：`unsafe` 五大能力、安全抽象封装、`#[repr(C)]` ABI 与 `PyO3` 接入 Python

**核心结论**：`unsafe` **不会关掉借用检查器**，它只解锁 5 项编译器无法静态证明安全的操作。工程铁律是：**把 `unsafe` 锁死在极小模块内，用安全函数对外暴露，并逐条注释 `// SAFETY:` 不变量**。

---

## 一、`unsafe` 只解锁这 5 件事

1. **解引用裸指针**（`*const T` / `*mut T`）——创建裸指针是安全的，解引用才是 `unsafe`。
2. **调用 `unsafe` 函数或外部 FFI 函数**（如 C 库函数）。
3. **访问或修改可变静态变量**（`static mut`，多线程易竞争）。
4. **实现 `unsafe trait`**（如手动为含裸指针的结构体声明 `Send` / `Sync`）。
5. **访问 `union` 字段**（无判别标签，类似 C `union`）。

> 之外的所有代码（包括 `unsafe {}` 块里的普通引用 `&T` / `&mut T`）**依然受借用检查器严格约束**。

---

## 二、安全抽象封装范式

标准库的 `Vec`、`Arc`、`split_at_mut` 底层都用到了 `unsafe`，但对外提供 100% 安全的接口。自己写 `unsafe` 时必须遵守同一范式：**入口做全边界校验 → 最小 `unsafe` 块 → 写明 `// SAFETY:` 证明**。

```rust
/// 对外是完全安全的函数，内部用最小 unsafe 实现切片拆分
pub fn split_two_mut<T>(slice: &mut [T], mid: usize) -> (&mut [T], &mut [T]) {
    let len = slice.len();
    assert!(mid <= len, "mid out of bounds");
    let ptr = slice.as_mut_ptr();
    // SAFETY: mid <= len 已校验；两段区间 [0..mid) 与 [mid..len) 严格不重叠，
    // 且均在原切片有效内存范围内，生命周期绑定到输入 `slice`。
    unsafe {
        (
            std::slice::from_raw_parts_mut(ptr, mid),
            std::slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}
```

---

## 三、跨语言 ABI：`#[repr(C)]` 与 `extern "C"`

Rust 编译器默认允许**重排结构体字段顺序**以压缩内存对齐空洞，因此默认 `struct` 不能直接传给 C / C++ / Python。
跨语言传递结构体或导出函数时，必须锁定 C ABI：

- **`#[repr(C)]`**：禁止重排字段，严格按 C 语言结构体对齐规则布局。
- **`#[no_mangle] pub extern "C" fn`**：禁止符号名修饰，使用 C 调用约定。

```rust
#[repr(C)]
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct CQuote {
    pub price_ticks: i64,
    pub qty: u32,
    pub side: u8,
}

#[no_mangle]
pub extern "C" fn quote_notional(q: CQuote) -> i64 {
    q.price_ticks * i64::from(q.qty)
}
```

---

## 四、给 Python 装上 Rust 引擎：`PyO3` + `maturin`

如果策略、数据分析在 Python，热路径计算想下沉到 Rust，`PyO3` 能让你几乎不写手写 C FFI 胶水，直接编译出原生 Python 模块（`.so` / `.pyd`）：

```rust
// 配合 Cargo.toml: pyo3 = { version = "0.23", features = ["extension-module"] }
// 构建命令：maturin develop --release
use pyo3::prelude::*;

#[pyfunction]
fn sum_notional(prices: Vec<i64>, qtys: Vec<i64>) -> i64 {
    prices.iter().zip(qtys.iter()).map(|(p, q)| p * q).sum()
}

#[pymodule]
fn fast_engine(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(sum_notional, m)?)?;
    Ok(())
}
```

**边界设计铁律**：
1. **粗粒度过界**：把整批数组/字节流一次传入 Rust，不要在 Python `for` 循环里每秒跨 FFI 调百万次小函数。
2. **重计算释放 GIL**：耗时计算前用 `py.allow_threads(|| ...)` 释放 Python GIL，允许其他 Python 线程并行。

---

## 五、面试追问 Q&A

### Q1：`unsafe` 块里的代码出错，怎么在上线前测出未定义行为（UB）？

- **结论**：使用 **`cargo +nightly miri test`**。
- **原理**：`miri` 是 Rust 中间表示（MIR）的解释器，能在测试期精准抓出裸指针越界、悬垂解引用、违反别名规则（Stacked Borrows）和未初始化内存读取（详见 [PL 总书 5.2 内存排错](/pl/05-production/02-sanitizers-miri)）。

### Q2：为什么跨 FFI 边界传递 `String` 或 `Vec<T>` 是危险的？

- **结论**：Rust 的 `String`/`Vec` 没有稳定 C ABI，且两端可能使用不同的内存分配器（如 jemalloc vs glibc malloc）。
- **解法**：跨 FFI 传递裸指针 + 长度（`*const u8, usize`）或 `#[repr(C)]` 结构体，并遵循**“谁分配，谁释放”**原则。

---

- 配套代码：`labs/rust-basics/src/concurrency_sys.rs`（`cargo test concurrency_sys::tests::test_safe_unsafe_wrapper_and_repr_c`）
- 官方参考：[The Rustonomicon](https://doc.rust-lang.org/nomicon/) · [PyO3 User Guide](https://pyo3.rs/)
