# 3.2 错误处理：告别 `try/catch`，`Result` 和 `?` 怎么写出干净的错误链？

> **副标题**：可恢复错误 `Result<T, E>`、`?` 传播、不可恢复 `panic!` 与 `thiserror` / `anyhow` 分工

**核心结论**：Rust 没有异常机制。可恢复错误全部作为返回值编码进 `Result<T, E>`，用 `?` 零样板传播；只有程序逻辑违背不变量（Bug）时才用 `panic!`。

---

## 一、与 TS / Python 的核心对照

TS / Python 靠 `throw` / `raise` 隐式跳栈，看函数签名无法知道会抛什么异常；Rust 把错误类型直接写进函数返回值，调用方必须显式处理或向上传播。

::: code-group

```ts [TypeScript]
function parseQty(raw: string): number {
  const n = Number(raw)
  if (!Number.isInteger(n) || n <= 0) throw new Error(`invalid qty: ${raw}`)
  return n
}
```

```python [Python]
def parse_qty(raw: str) -> int:
    n = int(raw)
    if n <= 0:
        raise ValueError(f"invalid qty: {raw}")
    return n
```

```rust [Rust]
#[derive(Debug, PartialEq, Eq)]
pub enum ParseOrderError {
    InvalidFormat,
    InvalidNumber(std::num::ParseIntError),
    NonPositiveQty,
}

impl From<std::num::ParseIntError> for ParseOrderError {
    fn from(err: std::num::ParseIntError) -> Self {
        Self::InvalidNumber(err)
    }
}

pub fn parse_qty(raw: &str) -> Result<u32, ParseOrderError> {
    let qty: u32 = raw.trim().parse()?; // 失败自动经 From 转为 ParseOrderError 返回
    if qty == 0 {
        return Err(ParseOrderError::NonPositiveQty);
    }
    Ok(qty)
}
```

:::

---

## 二、`?` 运算符与 `Option` / `Result` 互转

### 1. `?` 背后干了两件事

1. 如果是 `Ok(v)`，解包出 `v` 继续执行；
2. 如果是 `Err(e)`，自动调用 `From::from(e)` 转换成当前函数的错误类型，并立刻 `return Err(...)`。

### 2. 高频组合子（替代冗长 `match`）

```rust
// Option -> Result：无值时附带具体错误
let (sym, qty_str) = line.split_once(':').ok_or(ParseOrderError::InvalidFormat)?;

// 转换错误类型：不依赖 From 时手动映射
let price = price_str.parse::<i64>().map_err(|_| ParseOrderError::InvalidFormat)?;

// 提供默认值（懒求值优先用 unwrap_or_else）
let timeout_ms = cfg_timeout.unwrap_or(500);
```

---

## 三、工程最佳实践：`thiserror` vs `anyhow` vs `panic!`

| 场景 | 推荐方案 | 理由 |
|---|---|---|
| **库代码 / 核心模块** | 自定义错误枚举（生产常用 `thiserror` 派生） | 调用方需要精确 `match` 不同错误分支做重试或降级 |
| **应用层 / CLI / 顶层胶水** | `anyhow::Result<T>`（带 `.context("...")`） | 只需记录完整上下文并上报，不关心底层具体错误类型 |
| **不可恢复的程序 Bug** | `panic!` / `assert!` / `unreachable!` | 违背代码自身不变量（如数组越界），继续跑只会污染状态 |

### 生产禁区：别在业务逻辑里随手 `.unwrap()`

- 测试代码和原型脚本可以用 `.unwrap()`；
- 生产代码里，只有你**能证明绝不可能为 `None`/`Err`** 时才允许用 `.expect("明确说明为何不可能失败")`。

---

## 四、面试追问 Q&A

### Q1：Rust 为什么放弃异常，改用 `Result<T, E>`？

- **结论**：保证控制流显式可见，并消除异常展开（Stack Unwinding）在热路径上的不确定尾延迟。
- **原理**：异常允许函数在任意行隐式跳出，容易漏清理状态；`Result` 把错误纳入类型系统，且错误返回就是普通值返回，无 C++ 异常表展开开销（详见 [PL 总书 3.1 错误模型](/pl/03-type-system/01-adt-error-handling)）。

### Q2：`unwrap_or(expr)` 和 `unwrap_or_else(|| expr)` 有什么区别？

- **结论**：前者**急切求值**，即使值是 `Some`/`Ok` 也会先执行 `expr`；后者**懒求值**，仅在 `None`/`Err` 时才执行闭包。
- **工程规则**：默认值是字面量/常量用 `unwrap_or(0)`；涉及堆分配或函数调用（如 `String::from(...)`）一律用 `unwrap_or_else`。

---

- 配套代码：`labs/rust-basics/src/idioms.rs`（`cargo test idioms::tests::test_error_propagation`）
- 官方参考：[The Rust Programming Language - Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
