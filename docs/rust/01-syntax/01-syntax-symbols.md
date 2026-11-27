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

- `&x`：不可变借用（只读引用，可同时存在多个）。
- `&mut x`：可变借用（读写引用，同一时刻只能有一个）。
- `*r`：解引用，取出引用指向的值。

```rust
let mut n = 10;
let r = &n;          // 只读借用
println!("{}", *r);  // 解引用读取

let mr = &mut n;     // 可变借用
*mr += 5;            // 解引用修改，n 变为 15
```

### 3. `'a` / `'static` — 生命周期标注

单引号开头不是字符，是**生命周期参数**，用来向编译器说明“返回引用的存活时间依赖哪个输入引用”。`'static` 表示贯穿整个程序运行期。

```rust
fn first<'a>(s: &'a str) -> &'a str {
    &s[..1]
}

let msg: &'static str = "hello"; // 字符串字面量活到程序结束
```

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

贴在结构体、函数或模块上方，给编译器下指令。最常见的是 `#[derive(...)]`，自动生成打印、克隆、判等代码。

```rust
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}
```

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

Rust 没有 `null` / `None` 字面量，用 `Option<T>` 显式包装 `Some(v)` 或 `None`。

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

### 5. 联合类型与分支匹配（`switch` → `enum` + `match`）

`match` 用 `=>` 连接模式与结果，且编译器强制覆盖所有分支。

::: code-group

```ts [TypeScript]
type Event = { kind: 'ping' } | { kind: 'data'; size: number }

function label(e: Event): string {
  switch (e.kind) {
    case 'ping': return 'ping'
    case 'data': return `data:${e.size}`
  }
}
```

```python [Python]
from dataclasses import dataclass

@dataclass
class Ping: pass

@dataclass
class Data:
    size: int

def label(e: Ping | Data) -> str:
    match e:
        case Ping(): return "ping"
        case Data(size=s): return f"data:{s}"
```

```rust [Rust]
enum Event {
    Ping,
    Data { size: usize },
}

fn label(e: &Event) -> String {
    match e {
        Event::Ping => "ping".to_string(),
        Event::Data { size } => format!("data:{size}"),
    }
}
```

:::

### 6. 动态数组与字符串

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

### 7. 模块导入与导出

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
