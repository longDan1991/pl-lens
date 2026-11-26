# 一、类型系统与抽象

> 切入路径：**TypeScript → Python → Go → Rust**

用熟悉的 TypeScript 结构化类型系统作为锚点，区分**静态语义（编译期能证明什么）**与**运行期表示（值在内存里长什么样）**。

## 本章核心议题

1. **Structural vs Nominal**：TS 的结构化子类型、Go 的隐式接口，对比 Rust / C / C++ 的名义类型。
2. **代数数据类型（ADT）**：TS Discriminated Union、Rust `enum` 与 C tagged union 的内存与完备性检查对比。
3. **泛型实现策略**：类型擦除（TS）vs GC Shape 单态化（Go）vs 编译期完全单态化（Rust / C++）。
4. **空安全与错误处理**：`T | null`、`Option<T>`、`Result<T, E>`、`error` 多返回值与异常。

## 示例预览：用 ADT 表达 JSON 值

::: code-group

```ts [TypeScript]
type JsonValue =
  | { kind: 'null' }
  | { kind: 'bool'; value: boolean }
  | { kind: 'number'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'array'; items: JsonValue[] }
  | { kind: 'object'; entries: Record<string, JsonValue> }
```

```python [Python]
from dataclasses import dataclass

@dataclass
class JsonNull: pass

@dataclass
class JsonBool:
    value: bool

@dataclass
class JsonNumber:
    value: float

JsonValue = JsonNull | JsonBool | JsonNumber | str | list['JsonValue'] | dict[str, 'JsonValue']
```

```rust [Rust]
use std::collections::HashMap;

pub enum JsonValue {
    Null,
    Bool(bool),
    Number(f64),
    String(String),
    Array(Vec<JsonValue>),
    Object(HashMap<String, JsonValue>),
}
```

```go [Go]
type JsonValue interface {
    isJsonValue()
}

type JsonNull struct{}
type JsonBool bool
type JsonNumber float64
type JsonString string
type JsonArray []JsonValue
type JsonObject map[string]JsonValue

func (JsonNull) isJsonValue()   {}
func (JsonBool) isJsonValue()   {}
func (JsonNumber) isJsonValue() {}
func (JsonString) isJsonValue() {}
func (JsonArray) isJsonValue()  {}
func (JsonObject) isJsonValue() {}
```

:::
