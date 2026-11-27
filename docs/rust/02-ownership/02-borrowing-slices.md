# 2.2 借用：为什么一边读数组一边 `push`，编译器直接拦死？

> **副标题**：不可变 / 可变借用规则（`E0502` / `E0499`）、NLL 与零拷贝切片（`&str` / `&[T]`）

**核心结论**：借用（Borrowing）是**编译期读写锁**——同一时刻，要么允许任意多个只读借用 `&T`，要么只允许一个独占可变借用 `&mut T`，两者绝不同时存在。切片（`&str` / `&[T]`）是带长度的零拷贝视图。

---

## 一、与 TS / Python 的核心差异

在 TS / Python 里，所有引用默认都可读可写，函数拿到对象后随时可以原地修改，甚至在遍历数组时增删元素；Rust 把读写权限写进类型系统，在编译期彻底消灭**别名可变性（Aliasing XOR Mutability）**。

::: code-group

```ts [TypeScript]
function append(nums: number[]) {
  nums.push(4) // 仅看调用点无法知道会不会改原数组
}

const nums = [1, 2, 3]
append(nums)
```

```python [Python]
def append_item(nums: list[int]) -> None:
    nums.append(4)  # 隐式可变引用

nums = [1, 2, 3]
append_item(nums)
```

```rust [Rust]
fn print_len(nums: &[i32]) {          // 只读借用：编译器保证函数内不能改数据
    println!("{}", nums.len());
}

fn append_item(nums: &mut Vec<i32>) { // 可变借用：调用点必须显式写 &mut
    nums.push(4);
}

let mut nums = vec![1, 2, 3];
print_len(&nums);
append_item(&mut nums);
```

:::

---

## 二、借用规则与真实报错反例

### 1. 读写冲突（`E0502`）：`Vec` 边读边 `push`

`Vec` 扩容时会申请一块更大的新堆内存，把旧数据搬过去并**释放旧内存**。如果此时外面还捏着指向旧元素的引用，就会立刻变成悬垂指针：

```rust
fn main() {
    let mut nums = vec![1, 2, 3];
    let first = &nums[0];   // 1. 只读借用：指向旧堆内存里的 nums[0]
    nums.push(4);           // 2. 可变借用：可能触发扩容并释放旧内存
    println!("{first}");    // 3. 还要读 first -> 潜在悬垂指针
}
```

编译器直接拦截：

```text
error[E0502]: cannot borrow `nums` as mutable because it is also borrowed as immutable
 --> src/main.rs:4:5
  |
3 |     let first = &nums[0];
  |                  ---- immutable borrow occurs here
4 |     nums.push(4);
  |     ^^^^^^^^^^^^ mutable borrow occurs here
5 |     println!("{first}");
  |               ------- immutable borrow later used here
```

### 2. 双可变借用冲突（`E0499`）

同一时刻持有两个 `&mut`，会同时破坏单线程不变量与多线程数据安全：

```rust
let mut x = 10;
let a = &mut x;
let b = &mut x; // error[E0499]: cannot borrow `x` as mutable more than once at a time
*a += 1;
*b += 1;
```

### 3. NLL（非词法生命周期）：用完即放，不必等到 `}`

如果把上面 `E0502` 反例里第 5 行的 `println!("{first}")` 提前到 `nums.push(4)` 之前，代码就能直接编译通过：

```rust
let mut nums = vec![10, 20, 30];
let first = &nums[0];
assert_eq!(*first, 10); // first 最后一次使用，只读借用在此刻结束（NLL）
nums.push(40);          // OK：此时已无活跃的只读借用
```

### 4. 需要同时修改同一切片的两个不同位置怎么办？

借用检查器无法在编译期证明 `values[0]` 和 `values[last]` 互不重叠，因此 `&mut values[0]` 和 `&mut values[last]` 不能共存。标准库提供 `split_at_mut`，把切片拆成两段互不重叠的可变切片：

```rust
pub fn swap_and_bump_ends(values: &mut [i64]) {
    if values.len() < 2 { return; }
    let mid = values.len() / 2;
    let (left, right) = values.split_at_mut(mid);
    let last = right.len() - 1;
    std::mem::swap(&mut left[0], &mut right[last]);
    left[0] += 1;
    right[last] += 1;
}
```

---

## 三、切片（Slice）：零拷贝视图

切片是对一段连续内存的**借用视图**，不拥有堆内存，也不触发拷贝。在 64 位平台上，拥有者、普通引用与切片的内存大小对比如下：

| 类型 | 栈上大小（64 位） | 内存组成 | 角色 |
|---|---|---|---|
| 拥有者（堆字符串 / 动态数组） | **24 字节** | 指针 + 长度 + 容量 | 负责堆内存分配与释放 |
| 普通引用（指向拥有者） | **8 字节** | 指向 24 字节头的指针 | 访问字符需二次指针跳转 |
| 切片视图（字符串切片 / 数组切片） | **16 字节** | 数据首地址 + 长度（胖指针） | 零拷贝子区间视图，一次寻址 |

### 工程铁律：函数参数优先写 `&str` 和 `&[T]`

不要在函数参数里写 `&String` 或 `&Vec<T>`：
- 写 `&str` 可以同时接收 `&String`（自动 Deref 转换）、字符串字面量 `"BTC-USDT"` 和任意子切片 `&s[..3]`；
- 写 `&[i64]` 可以同时接收 `&Vec<i64>`、定长数组 `&[1, 2, 3]` 和窗口切片 `&nums[1..3]`。

```rust
pub fn split_pair(symbol: &str) -> Option<(&str, &str)> {
    symbol.split_once('-') // 零拷贝：返回的两个 &str 直接指向原内存
}

pub fn sum_window(prices: &[i64]) -> i64 {
    prices.iter().sum()
}
```

> 注意：`&str` 按 **UTF-8 字节**索引而非字符索引，对含中文的字符串按字节下标切片（如 `&s[..1]`）若切在字符中间会运行期 `panic`。处理非 ASCII 文本应使用 `.chars()` 或 `.split_once()`。

---

## 四、面试追问 Q&A

### Q1：为什么 Rust 严格禁止同时存在 `&T` 和 `&mut T`？

- **结论**：这是在无 GC 下同时保住**内存安全**与**极致编译器优化**的唯一解。
- **原理**：
  1. **单线程防失效**：消除容器扩容/重排导致的迭代器失效和悬垂引用（如 `Vec` 边读边 `push`）；
  2. **多线程防数据竞争**：数据竞争的三个必要条件之一就是“存在可变别名”，借用规则直接静态掐断；
  3. **编译器优化红利**：`&mut T` 保证独占无别名，Rust 可直接向 LLVM 发射 `noalias` 标记，允许激进寄存器缓存和自动向量化（C/C++ 指针默认可能别名，很难触发同类优化）。

### Q2：函数参数为什么应该用 `&str` 而不是 `&String`？

- **结论**：`&str` 更通用且少一次指针间接跳转。
- **原理**：`&String` 是 8 字节瘦指针，指向栈上 `String` 头再跳到堆字节（两级间接）；`&str` 是 16 字节胖指针 `(ptr, len)`，直接指向字符首地址，且借助 `Deref<Target = str>` 兼容 `&String`、字面量和任意子切片。

### Q3：NLL（Non-Lexical Lifetimes）是什么？

- **结论**：借用的作用域在**最后一次使用点**立刻结束，而不是死板地延续到词法块末尾 `}`。
- **意义**：大幅减少误报，允许在同一代码块内先只读借用、用完后直接发起可变借用。

---

- 配套代码：`labs/rust-basics/src/borrowing.rs`（`cargo test borrowing`）
- 官方参考：[References and Borrowing](https://doc.rust-lang.org/book/ch04-02-references-and-borrowing.html) · [The Slice Type](https://doc.rust-lang.org/book/ch04-03-slices.html)
