# 2.1 所有权：为什么 `let b = a` 之后，原变量直接报废？

> **副标题**：所有权三原则、Move vs `Copy`/`Clone` 与确定性 `Drop`

**核心结论**：Rust 没有 GC，靠编译期**唯一所有权**决定谁负责释放内存。默认赋值和传参执行 **Move（所有权转移）**，在零运行期开销下杜绝二次释放（Double Free）和悬垂指针。

---

## 一、与 TS / Python 的核心差异

### 1. 赋值与传参：共享引用 vs 转移所有权

在 TS / Python 里，变量只是指向堆对象的引用，赋值和传参只是多了一个别名，生命周期交给 GC。在 Rust 里，拥有堆资源的值默认**转移所有权**，原变量在编译期立刻失效。

::: code-group

```ts [TypeScript]
const a = 'order-1001'
const b = a          // 共享引用
console.log(a, b)    // 两者都可用
```

```python [Python]
a = "order-1001"
b = a                # 引用计数 +1
print(a, b)          # 两者都可用
```

```rust [Rust]
let a = String::from("order-1001");
let b = a;           // Move：所有权从 a 转移给 b，a 立刻失效
// println!("{a}");  // 编译报错：E0382 borrow of moved value: `a`
println!("{b}");     // OK
```

:::

### 2. 所有权三原则

1. Rust 中的每个值都有一个**所有者（Owner）**。
2. 同一时刻，一个值**只能有一个所有者**。
3. 当所有者离开作用域时，该值被自动销毁（调用 `Drop` 释放资源）。

---

## 二、Move、Copy、Clone 与 Drop

### 1. 为什么 `String` 必须 Move，而 `i32` 可以 Copy？

`String` 在栈上存 24 字节头（指针 `ptr`、长度 `len`、容量 `cap`），字符数据在堆上：

```text
栈上 s1: [ ptr | len=5 | cap=5 ] ──▶ 堆内存: ['h','e','l','l','o']
```

- 若允许直接按位拷贝栈上 24 字节得到 `s2`，`s1` 和 `s2` 的 `ptr` 会指向**同一块堆内存**；离开作用域时各释放一次，直接触发 **Double Free** 崩溃。
- 因此 Rust 对含堆资源的类型默认执行 **Move**：只拷贝栈上 24 字节头，同时在编译期废止 `s1`，保证堆内存只释放一次。

### 2. `Copy` vs `Clone`

| 机制 | 底层动作 | 触发方式 | 适用类型 |
|---|---|---|---|
| **`Copy`（按位浅拷贝）** | 直接复制栈上字节（`memcpy`），原变量继续有效 | 赋值 / 传参时**自动静默触发** | 纯栈数据，且不能实现 `Drop`（标量、不可变引用、`#[derive(Copy, Clone)]` 小结构体） |
| **`Clone`（显式深拷贝）** | 执行自定义复制逻辑，通常申请新堆内存并逐元素拷贝 | 必须**显式调用** `.clone()` | 任意类型（如 `String`、`Vec<T>`） |

```rust
#[derive(Debug, Copy, Clone)]
pub struct Tick {
    pub price: i64,
    pub qty: u32,
}

let t1 = Tick { price: 10_500, qty: 10 };
let t2 = t1;               // Copy：纯栈 16 字节复制，t1 仍可用
println!("{:?} {:?}", t1, t2);

let s1 = String::from("BTC-USDT");
let s2 = s1.clone();       // Clone：显式申请新堆内存并复制内容，s1/s2 独立
```

### 3. 确定性释放（`Drop`）

值离开作用域时，编译器自动在末尾插入 `Drop::drop` 调用，**按声明逆序（LIFO）**释放内存、文件句柄或锁。不需要手动 `free`，也没有 GC 停顿；如需提前释放，可调用 `std::mem::drop(val)`（把所有权 Move 进空函数立刻销毁）。

```rust
{
    let a = String::from("first");
    let b = String::from("second");
} // 先 drop(b)，再 drop(a)
```

---

## 三、高频编译报错与踩坑

### 1. 函数传参触发意外 Move（`E0382`）

```rust
fn consume(s: String) {
    println!("{s}");
}

let sym = String::from("ETH");
consume(sym);       // 所有权移入 consume，函数结束时 sym 已被释放
// println!("{sym}"); // error[E0382]: borrow of moved value: `sym`
```

**解法**：函数若只需读取，参数改为借用 `&str` / `&String`（详见 [2.2 借用](/rust/02-ownership/02-borrowing-slices)）；只有确实要接管资源或销毁它时，才按值传 `String`。

### 2. 结构体局部 Move（Partial Move）

把结构体的某个非 `Copy` 字段移走后，**整个结构体不能再整体使用**，但未移走的其余字段仍可单独访问：

```rust
struct Packet { id: u64, payload: String }

let pkt = Packet { id: 1, payload: String::from("data") };
let body = pkt.payload; // 仅移走 payload
println!("{}", pkt.id); // OK：id 未被移走
// println!("{}", pkt.payload); // 报错：已被移走
```

### 3. 为什么 `Copy` 和 `Drop` 不能同时实现？（反例拆解）

假设允许一个持有文件描述符 `fd` 的结构体同时实现 `Copy` 和 `Drop`：

```rust
// 伪代码（实际编译报错：E0184）
#[derive(Copy, Clone)]
struct FileHandle { fd: i32 }

impl Drop for FileHandle {
    fn drop(&mut self) { close(self.fd); } // 离开作用域时关闭文件
}

fn main() {
    let f1 = FileHandle { fd: 3 };
    let f2 = f1; // 因为是 Copy，f1 和 f2 拿到同一个 fd = 3，且 f1 不失效！
} // 作用域结束：先 drop(f2) 关闭 fd=3，再 drop(f1) 再次关闭 fd=3 -> 双重释放！
```

矛盾本质：
- **`Copy` 的契约**：赋值时只是无脑复制栈字节，**不执行自定义逻辑，原变量继续有效**。
- **`Drop` 的契约**：每个值离开作用域时，**必须执行一次清理动作**（释放堆内存、关文件、解锁）。
- 两者并存 → 复制出 N 份指向同一资源的副本 → 离开作用域时触发 N 次 `Drop` → **Double Free / 重复关闭**。因此编译器直接从规则上禁止共存（`error[E0184]`）。

---

## 四、面试追问 Q&A

### Q1：Rust 的 Move 在运行期有性能开销吗？

- **结论**：几乎零开销，等价于一次栈上浅拷贝（`memcpy` 栈头），编译器优化后通常直接消除。
- **原理**：Move 不会触碰堆内存，也不执行任何析构或构造逻辑；“原变量失效”完全是编译期静态检查，运行期不占任何字节或指令。

### Q2：Rust 的 Move 和 C++ 的 `std::move` 有什么本质区别？

- **结论**：Rust Move 是**默认语义 + 编译期废止源变量**；C++ `std::move` 只是**类型转换（转为右值引用）+ 允许继续访问源对象**。
- **原理**：C++ 移动后源对象处于“有效但未指定状态”，仍会在作用域结束时执行析构函数，且误读源对象不报错；Rust 在编译期直接禁止再使用被 Move 的变量，也不再对其调用 `Drop`（详见 [PL 总书 2.2 移动语义](/pl/02-ownership-raii/02-cpp-raii-move)）。

### Q3：为什么 `Copy` 要求类型必须先实现 `Clone`？

- **结论**：`Copy` 是 `Clone` 的子 Trait（`trait Copy: Clone`），保证所有可按位浅拷贝的类型都能在泛型代码里统一通过 `.clone()` 调用。

---

- 配套代码：`labs/rust-basics/src/ownership.rs`（`cargo test ownership`）
- 官方参考：[The Rust Programming Language - What Is Ownership?](https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html)
