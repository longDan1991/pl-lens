# 1.1 语法符号速查：从 TS / Python 映射到 Rust

> **核心结论**：先认全 Rust 独有的符号，再把常见语法从 TS / Python 映射到 Rust。本文不讲底层原理，只解决“看代码发懵”。

---

## 一、TS / Python 里没有的符号

### 1. `mut` — 显式声明可变

Rust 变量默认不可变，需要修改必须加 `mut`。

```rust
let x = 1;       // 不可变
let mut y = 1;   // 可变
y += 1;
```

### 2. `&` / `&mut` / `*` — 借用与解引用

- `&x`：不可变借用（只读地址，可同时存在多个）。
- `&mut x`：可变借用（读写地址，同一时刻只能存在一个，且不能与 `&x` 共存）。
- `*r`：解引用，顺着地址取出里面真正的值。

日常大多直接把 `&nums` / `&mut nums` 传给函数，极少单独写 `let r = &n`。调用方法（`v.len()`）、读字段（`order.qty`）时 Rust 自动解引用，90% 场景不用手写 `*`；仅在通过 `&mut` 原地改基础类型或拷贝基础类型值（如 `Some(*id)`）时才写 `*`。

```rust
fn print_len(v: &Vec<i32>) {
    println!("{}", v.len()); // 自动解引用，直接读
}

let mut nums = vec![10, 20];
print_len(&nums);            // 日常写法：直接传 &nums

let mut n = 10;
let mr = &mut n;
*mr += 5;                    // 原地改基础类型，需显式 * 解引用
```

> 冲突报错反例与借用规则详解见 [2.2 借用与切片](/rust/02-ownership/02-borrowing-slices)。

### 3. `'a` / `'static` — 生命周期标注

单引号开头不是字符，是**生命周期参数**。80% 的场景编译器会自动推断，无需手写；只有存在多个输入引用或结构体持有引用时才需显式标注。**`'a` 不改变变量的真实寿命**，只是给编译器检查用的约束条件；`'static` 表示贯穿整个程序运行期。

```rust
// 单输入引用可省略 'a；多输入引用需显式标注约束关系
fn longer<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

let msg: &'static str = "hello"; // 字符串字面量活到程序结束
```

> 省略规则与结构体借用实战见 [2.3 生命周期标注实战](/rust/02-ownership/03-lifetimes)。

### 4. `::` 与 `::<T>` — 路径分隔与 Turbofish

- `::`：访问模块、类型关联函数或枚举变体（相当于 TS/Python 在命名空间上的 `.`）。
- `::<T>`（俗称 Turbofish）：当编译器推不出泛型类型时，在调用处显式指定。

```rust
use std::collections::HashMap;

let map = HashMap::<String, i32>::new();
let n = "42".parse::<i32>().unwrap();
```

### 5. `name!()` — 宏调用

带感叹号 `!` 的不是普通函数，而是编译期展开的**宏**（因此可接受可变参数或检查格式串）。

```rust
println!("id={}, ok={}", 1, true);
let nums = vec![1, 2, 3];
```

### 6. `?` — 错误 / 空值提前返回

用在返回 `Result` 或 `Option` 的函数里：成功就拆出值继续，失败就直接 `return Err(e)` / `return None`。

```rust
fn parse_port(s: &str) -> Result<u16, std::num::ParseIntError> {
    let port = s.parse::<u16>()?; // 解析失败直接返回 Err
    Ok(port)
}
```

### 7. `#[...]` — 属性与派生宏

贴在结构体、函数或模块上方，类比 Python `@decorator`，但只在**编译期**生效、运行期零开销。最常见的 `#[derive(...)]` 类似编译期 `@dataclass`，自动为结构体生成打印、克隆、判等代码。

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}
```

> 为什么 Rust 不默认提供“通用打印 / 判等”？详见 [PL 总书 0.1：运行期反射 vs 裸字节内存](/pl/00-mindset/01-pl-coordinate-system)。

### 8. `..` / `..=` — 区间与结构体更新

- `0..5`：左闭右开 `[0, 5)`。
- `0..=5`：全闭区间 `[0, 5]`。
- `..other`：复用另一个结构体的其余字段（类似 TS 对象展开 `...other`，但放在最后）。

```rust
for i in 0..3 {}    // 0, 1, 2
for i in 0..=3 {}   // 0, 1, 2, 3

let p1 = Point { x: 1, y: 2 };
let p2 = Point { x: 9, ..p1 }; // y 复用 p1.y
```

### 9. `|x| ...` — 闭包（匿名函数）

竖线 `|...|` 里写参数列表，相当于 TS 的 `(x) => ...` 或 Python 的 `lambda x: ...`。

```rust
let add = |a: i32, b: i32| a + b;
let doubled: Vec<i32> = vec![1, 2, 3].into_iter().map(|x| x * 2).collect();
```

### 10. `_` — 占位、丢弃与兜底

- 匹配分支里表示“其余所有情况”（类似 `default`）。
- 类型位置写 `Vec<_>` 表示“让编译器自己推元素类型”。
- 绑定位置写 `let _ = ...` 表示显式丢弃返回值。

```rust
let nums: Vec<_> = (0..5).collect();
match nums.len() {
    0 => println!("empty"),
    _ => println!("non-empty"),
}
```

### 11. `impl Trait for Type` — 为类型实现协议 / 接口

`Trait` 类似 TS 的 `interface` 或 Python 的魔术方法协议（如 `__eq__`）。Rust 把“自身方法”和“实现接口”写成两种 `impl`：

```rust
impl Point { ... }               // 挂载自身方法（如 new）
impl PartialEq for Point {       // 实现 == 比较协议（类似 Python __eq__）
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x && self.y == other.y
    }
}
```

> Trait 与静态/动态派发详解见 [3.1 泛型、Trait 与 dyn Trait](/rust/03-idioms/01-generics-traits)。

---

## 二、同义不同写法（TS / Python / Rust 对照）

### 1. 变量声明与类型标注

::: code-group

```ts [TypeScript]
const id: number = 42
let count: number = 0
count += 1
```

```python [Python]
id: int = 42
count: int = 0
count += 1
```

```rust [Rust]
let id: u64 = 42;
let mut count: u32 = 0;
count += 1;
```

:::

### 2. 函数定义与返回值

Rust 用 `fn` 定义函数、`->` 标注返回类型；函数体最后一行**不加分号**就是返回值。

::: code-group

```ts [TypeScript]
function add(a: number, b: number): number {
  return a + b
}
```

```python [Python]
def add(a: int, b: int) -> int:
    return a + b
```

```rust [Rust]
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

:::

### 3. 空值处理

Rust 没有 `null` / `None` 字面量，用标准库枚举 `Option<T>` 显式包装。`Some` 不是关键字，只是 `Option` 的一个变体名：

```rust
enum Option<T> {
    Some(T), // 有值，把值包在里面
    None,    // 无值（对应 TS null / Python None）
}
```

::: code-group

```ts [TypeScript]
function findUser(id: number): string | null {
  return id === 1 ? 'alice' : null
}
const name = findUser(1) ?? 'guest'
```

```python [Python]
def find_user(id: int) -> str | None:
    return "alice" if id == 1 else None

name = find_user(1) or "guest"
```

```rust [Rust]
fn find_user(id: u64) -> Option<&'static str> {
    if id == 1 { Some("alice") } else { None }
}
let name = find_user(1).unwrap_or("guest");
```

:::

### 4. 数据与方法（`class` → `struct` + `impl`）

Rust 把字段定义（`struct`）和方法实现（`impl`）拆开写，没有 `class`。

::: code-group

```ts [TypeScript]
class Counter {
  value = 0
  inc() {
    this.value += 1
  }
}
```

```python [Python]
class Counter:
    def __init__(self) -> None:
        self.value = 0

    def inc(self) -> None:
        self.value += 1
```

```rust [Rust]
struct Counter {
    value: u32,
}

impl Counter {
    fn new() -> Self {
        Self { value: 0 }
    }
    fn inc(&mut self) {
        self.value += 1;
    }
}
```

:::

### 5. 枚举 / 和类型（`enum`）

TS / Python 的 `enum` 只是常量别名；Rust 的 `enum` 是原生 **Tagged Union（和类型）**，每个变体可直接携带不同结构的数据，无需手写 `kind` 字段。

::: code-group

```ts [TypeScript]
// 无法用 TS enum 携带不同字段，必须手写 kind 拼 Union
type Message =
  | { kind: 'quit' }
  | { kind: 'move'; x: number; y: number }
  | { kind: 'text'; body: string }
```

```python [Python]
from dataclasses import dataclass

@dataclass
class Quit: pass

@dataclass
class Move:
    x: int
    y: int

@dataclass
class Text:
    body: str

Message = Quit | Move | Text
```

```rust [Rust]
enum Message {
    Quit,                    // 不带数据
    Move { x: i32, y: i32 }, // 携带结构体字段
    Text(String),            // 携带单个值
}
```

:::

### 6. 分支匹配（`switch` → `match`）

`match` 用 `=>` 连接模式与结果，且编译器强制覆盖所有变体，漏写分支直接报错。

::: code-group

```ts [TypeScript]
function label(m: Message): string {
  switch (m.kind) {
    case 'quit': return 'quit'
    case 'move': return `move(${m.x},${m.y})`
    case 'text': return m.body
  }
}
```

```python [Python]
def label(m: Message) -> str:
    match m:
        case Quit(): return "quit"
        case Move(x, y): return f"move({x},{y})"
        case Text(body): return body
```

```rust [Rust]
fn label(m: &Message) -> String {
    match m {
        Message::Quit => "quit".to_string(),
        Message::Move { x, y } => format!("move({x},{y})"),
        Message::Text(body) => body.clone(),
    }
}
```

:::

### 7. 动态数组与字符串

Rust 字符串拆成两种：堆上可增长的 `String`，以及只读切片 `&str`。

::: code-group

```ts [TypeScript]
const items: number[] = [1, 2, 3]
items.push(4)

const s: string = 'hello'
```

```python [Python]
items: list[int] = [1, 2, 3]
items.append(4)

s: str = "hello"
```

```rust [Rust]
let mut items: Vec<i32> = vec![1, 2, 3];
items.push(4);

let s: &str = "hello";              // 只读字符串切片
let owned: String = String::from(s); // 堆上拥有的可变字符串
```

:::

### 8. 模块导入与导出

Rust 默认私有，导出用 `pub`，导入用 `use`。

::: code-group

```ts [TypeScript]
import { readFileSync } from 'node:fs'
export function run() {}
```

```python [Python]
from pathlib import Path
def run() -> None: pass
```

```rust [Rust]
use std::fs::read_to_string;
pub fn run() {}
```

:::

### 9. 控制流即表达式（三元运算符 → `if` 表达式）

Rust 没有三元运算符 `a ? b : c`，`if`、`match`、代码块 `{}` 都是表达式，可直接赋值；代码块最后一行**不加分号**即返回值（多写分号会变成语句，求值为单元类型 `()`）。

::: code-group

```ts [TypeScript]
const level = us < 50 ? 'fast' : us < 500 ? 'normal' : 'slow'
```

```python [Python]
level = "fast" if us < 50 else ("normal" if us < 500 else "slow")
```

```rust [Rust]
let level = if us < 50 {
    "fast"
} else if us < 500 {
    "normal"
} else {
    "slow"
};
```

:::
