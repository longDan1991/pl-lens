# 3.3 迭代器：为什么链式 `.filter().map().sum()` 能和手写 `for` 循环一样快？

> **副标题**：`Vec`/`HashMap` 惯用法、三种闭包 Trait（`Fn`/`FnMut`/`FnOnce`）与零开销迭代器融合

**核心结论**：Rust 迭代器是**惰性状态机**。链式调用 `.filter().map().sum()` 在编译期被单态化并内联融合为单层循环，**不产生任何中间数组分配**，性能常与手写 `for` 持平甚至更快（可消除边界检查）。

---

## 一、与 TS / Python 的核心对照

JS 数组的 `.filter().map()` 每一步都会在堆上分配一个全新的临时数组；Rust 迭代器默认惰性，直到消费器（`.sum()` / `.collect()`）触发时才逐元素流式计算。

::: code-group

```ts [TypeScript]
// filter 和 map 各自创建一个新的中间数组
const total = prices
  .filter((p) => p > 100)
  .map((p) => p * 2)
  .reduce((acc, x) => acc + x, 0)
```

```python [Python]
# 生成器表达式虽是惰性，但每个元素仍走 Python 解释器循环与对象装箱
total = sum(p * 2 for p in prices if p > 100)
```

```rust [Rust]
// 零中间分配：编译器融合为单层原生循环，无边界检查
let total: i64 = prices
    .iter()
    .copied()
    .filter(|&p| p > 100)
    .map(|p| p * 2)
    .sum();
```

:::

---

## 二、集合与迭代器高频惯用法

### 1. 三种迭代入口（决定所有权）

- `vec.iter()`：产出 `&T`（只读借用，原集合保留）。
- `vec.iter_mut()`：产出 `&mut T`（原地修改，原集合保留）。
- `vec.into_iter()`：产出 `T`（**消费原集合**，直接移出元素所有权）。

### 2. `HashMap` 的 `entry` API（一次哈希查找完成插入或更新）

在 TS/Python 里常见“先查 `has(k)` 再 `set(k, v)`”，会算两次哈希；Rust 用 `entry` 一次查表搞定：

```rust
use std::collections::HashMap;

pub fn aggregate_volume<'a>(trades: &[(&'a str, u64)]) -> HashMap<&'a str, u64> {
    let mut totals = HashMap::with_capacity(trades.len());
    for &(sym, qty) in trades {
        *totals.entry(sym).or_insert(0) += qty;
    }
    totals
}
```

### 3. 三种闭包 Trait：`FnOnce` / `FnMut` / `Fn`

编译器根据闭包**如何使用捕获的外部变量**自动推导，不用手动标注：

| Trait | 捕获方式 | 最多调用次数 | 典型场景 |
|---|---|---|---|
| **`FnOnce`** | 消费捕获变量的所有权（Move） | 最多 **1 次** | `unwrap_or_else`、`thread::spawn` |
| **`FnMut`** | 可变借用捕获变量（`&mut`） | 多次 | 累加计数、排序比较器 |
| **`Fn`** | 只读借用或不捕获（`&`） | 多次（可并发调用） | 纯映射 `map`、回调钩子 |

> 继承关系：`Fn: FnMut: FnOnce`。任何只读闭包都能传给要求 `FnMut` 或 `FnOnce` 的函数。若要把闭包移进新线程，在闭包前加 `move` 强制把捕获变量的所有权移入闭包（`move || ...`）。

---

## 三、高频踩坑

### 1. 忘了消费迭代器（什么都不会发生）

```rust
// 警告：iterators are lazy and do nothing unless consumed
nums.iter().map(|x| x * 2);
```

迭代器是惰性的，不接 `.collect()`、`.sum()`、`.for_each()` 等消费方法，整行代码不会执行任何计算。

### 2. 已知长度却不写 `with_capacity`

循环 `Vec::push` 或 `HashMap::insert` 时，若提前知道大致规模，一律用 `Vec::with_capacity(n)` / `HashMap::with_capacity(n)`，避免热路径上反复触发 `O(N)` 扩容搬迁。

---

## 四、面试追问 Q&A

### Q1：为什么 Rust 迭代器经常比手写下标 `for i in 0..slice.len()` 更快？

- **结论**：迭代器内部用指针递增遍历，LLVM 可静态证明不会越界，从而**消除每次访问的数组边界检查（Bounds Check）**，且更易触发 SIMD 自动向量化。

### Q2：`move || ...` 闭包是不是一定会把所有捕获变量都 Move 掉？

- **结论**：只对非 `Copy` 类型发生 Move；对实现了 `Copy` 的类型（如 `i32`、`usize`），`move` 只是把值按位拷贝进闭包，外面原变量依然可用。

---

- 配套代码：`labs/rust-basics/src/idioms.rs`（`cargo test idioms::tests::test_iterators_and_entry_api`）
- 官方参考：[The Rust Programming Language - Closures and Iterators](https://doc.rust-lang.org/book/ch13-00-functional-features.html)
