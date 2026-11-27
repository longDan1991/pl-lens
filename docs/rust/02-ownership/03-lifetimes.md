# 2.3 生命周期：`'a` 到底在写什么？为什么 80% 时候不用写？

> **副标题**：生命周期省略规则、多引用交集、结构体借用与 `'static` 常见误区

**核心结论**：`'a` **不会延长或缩短任何变量的真实寿命**，它只是写给编译器检查的约束——向编译器证明“返回的引用或结构体里存的引用，绝不会活得比原数据更久”，在编译期消灭悬垂指针。

---

## 一、与 TS / Python 的核心差异

TS / Python 有 GC：只要还有一个引用指向对象，对象就不会被回收，不存在悬垂指针。
Rust 没有 GC，值离开作用域立刻销毁。当函数**返回引用**或结构体**持有引用**时，编译器必须静态证明“引用失效前，原数据一定还活着”。

---

## 二、80% 的场景不用写 `'a`（生命周期省略规则）

编译器内置 3 条自动推断规则（Lifetime Elision Rules），满足时直接省略 `'a`：

1. **每个输入引用参数**各分配一个独立生命周期参数。
2. 如果只有 **1 个输入引用参数**，它的生命周期自动赋给所有输出引用。
3. 如果是方法（含 `&self` 或 `&mut self`），`self` 的生命周期自动赋给所有输出引用。

```rust
// 规则 2：单输入引用，编译器自动补全为 fn first_word<'a>(s: &'a str) -> &'a str
fn first_word(s: &str) -> &str {
    s.split_whitespace().next().unwrap_or("")
}

// 规则 3：方法带 &self，返回值默认绑定到 &self 的寿命
impl Order {
    fn label(&self, _tag: &str) -> &str {
        "order"
    }
}
```

---

## 三、必须手写 `'a` 的两种实战场景

### 1. 多个输入引用，返回一个引用（取较短交集）

编译器只看函数签名，无法猜出返回值来自 `x` 还是 `y`，必须手写 `'a` 建立关联：

```rust
pub fn longer<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}
```

这里的 `'a` 表示：**返回值的存活时间，受限于 `x` 和 `y` 中更短的那个**（两者的交集）：

```rust
fn main() {
    let s1 = String::from("long-order-id");
    let result;
    {
        let s2 = String::from("short");
        result = longer(&s1, &s2); // 'a 绑定到更短的 s2 作用域
    } // s2 在此销毁
    // println!("{result}"); // 编译报错：`s2` does not live long enough
}
```

如果某个输入参数**不可能**被返回，就不要给它标 `'a`，避免无端收窄返回值寿命：

```rust
// 返回值只依赖 x，与 _ignored 无关
pub fn take_first<'a>(x: &'a str, _ignored: &str) -> &'a str {
    x
}
```

### 2. 结构体里存引用（零拷贝解析器标配）

结构体直接借用原始输入缓冲区（零堆分配），必须在结构体上声明 `'a`，向编译器承诺：**结构体实例绝不能活得比它借用的数据更久**。

```rust
#[derive(Debug, PartialEq, Eq)]
pub struct LogEntry<'a> {
    pub level: &'a str,
    pub message: &'a str,
}

impl<'a> LogEntry<'a> {
    pub fn parse(line: &'a str) -> Option<Self> {
        let (level, msg) = line.split_once(':')?;
        Some(Self {
            level: level.trim(),
            message: msg.trim(),
        })
    }
}
```

工程取舍：
- **解析器 / 临时视图**：用 `&'a str`（零拷贝、极快）。
- **跨线程 / 长期存储 / 配置对象**：直接用拥有权 `String`，别把 `'a` 传染到整个业务层。

---

## 四、`'static` 的最大误区

`'static` 在 Rust 里有两种常见位置，含义容易混淆：

1. **引用类型 `&'static T`**：引用指向的数据活到整个程序结束（如字符串字面量 `let s: &'static str = "ok";`，存在可执行文件只读数据段）。
2. **泛型约束 `T: 'static`**（常见于 `std::thread::spawn`、`tokio::spawn`）：意思是 **“类型 `T` 不包含任何非 `'static` 的短借用”**——不是说值必须永远不释放！

```rust
fn requires_static<T: 'static>(_val: T) {}

let owned = String::from("lives on heap, no short borrows");
requires_static(owned); // OK！拥有所有权的 String 满足 T: 'static，用完照常 Drop
```

> 工程排错铁律：当 `thread::spawn` 报 `borrowed data escapes outside of function / requires 'static` 时，**不是让你把变量泄漏成全局变量**，而是把借用 `&T` 换成拥有权 `T`（或 `Arc<T>`）移进线程。

---

## 五、面试追问 Q&A

### Q1：生命周期标注 `'a` 会影响运行期性能或改变对象存活时间吗？

- **结论**：**零运行期开销，也不改变任何对象的实际销毁时机**。
- **原理**：生命周期只存在于编译期类型检查阶段，编译完成后会被完全擦除；对象何时释放仍严格由所有权和词法作用域（`Drop`）决定。

### Q2：为什么 `String` 满足 `T: 'static`，但 `&String` 不满足？

- **结论**：`T: 'static` 约束的是“类型里不藏短命引用”，而非“对象不能被销毁”。
- **原理**：`String` 自己拥有堆内存，不依赖外部任何栈帧，随时可以安全移交到后台线程并在线程结束时释放；而 `&String` 借用了当前栈帧的局部变量，当前函数一旦返回就可能悬垂，因此不满足 `'static`。

### Q3：工程里什么时候该在结构体里用 `'a`，什么时候该直接用 `String`？

- **结论**：短生命周期、性能敏感的解析/视图层用 `'a`；长期持有、跨异步任务或跨线程传递的数据模型直接用 `String` / `Arc<str>`。
- **权衡**：结构体引入 `'a` 会向上下游所有持有它的类型传染；先保证清晰和可维护，只在热路径明确需要零拷贝时引入。

---

- 配套代码：`labs/rust-basics/src/lifetimes.rs`（`cargo test lifetimes`）
- 官方参考：[The Rust Programming Language - Validating References with Lifetimes](https://doc.rust-lang.org/book/ch10-03-lifetime-syntax.html)
