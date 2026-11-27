pub mod ownership;

/// 1.1: Shadowing changes binding type without `mut`.
pub fn shadowing_demo(raw: &str) -> usize {
    let count = raw.trim();
    let count = count.len();
    count
}

/// 1.1: Explicit overflow-checked integer arithmetic.
pub fn safe_add_price_ticks(base: i64, delta: i64) -> Option<i64> {
    base.checked_add(delta)
}

/// 1.1: Control flow as an expression.
pub fn classify_latency_us(us: u64) -> &'static str {
    if us < 50 {
        "fast"
    } else if us < 500 {
        "normal"
    } else {
        "slow"
    }
}

/// 1.2: Struct with methods.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Order {
    pub id: u64,
    pub price_ticks: i64,
    pub qty: u32,
}

impl Order {
    pub fn new(id: u64, price_ticks: i64, qty: u32) -> Self {
        Self { id, price_ticks, qty }
    }

    pub fn notional(&self) -> i64 {
        self.price_ticks * i64::from(self.qty)
    }

    pub fn fill(&mut self, filled: u32) -> u32 {
        let actual = filled.min(self.qty);
        self.qty -= actual;
        actual
    }
}

/// 1.2: Tagged union (ADT).
#[derive(Debug, PartialEq, Eq)]
pub enum OrderEvent {
    New(Order),
    Modify { id: u64, new_qty: u32 },
    Cancel(u64),
}

pub fn describe_event(event: &OrderEvent) -> String {
    match event {
        OrderEvent::New(o) => format!("new #{} qty={}", o.id, o.qty),
        OrderEvent::Modify { id, new_qty } => format!("mod #{} qty={}", id, new_qty),
        OrderEvent::Cancel(id) => format!("cancel #{}", id),
    }
}

pub fn extract_cancel_id(event: &OrderEvent) -> Option<u64> {
    let OrderEvent::Cancel(id) = event else {
        return None;
    };
    Some(*id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::mem::size_of;

    #[test]
    fn test_syntax_and_overflow() {
        assert_eq!(shadowing_demo("  hello  "), 5);
        assert_eq!(safe_add_price_ticks(100, 25), Some(125));
        assert_eq!(safe_add_price_ticks(i64::MAX, 1), None);
        assert_eq!(classify_latency_us(12), "fast");
        assert_eq!(classify_latency_us(120), "normal");
        assert_eq!(classify_latency_us(900), "slow");
    }

    #[test]
    fn test_order_and_enum_match() {
        let mut order = Order::new(1, 10_500, 10);
        assert_eq!(order.notional(), 105_000);
        assert_eq!(order.fill(4), 4);
        assert_eq!(order.qty, 6);
        assert_eq!(order.fill(20), 6);
        assert_eq!(order.qty, 0);

        let ev_new = OrderEvent::New(Order::new(2, 9_900, 5));
        let ev_mod = OrderEvent::Modify { id: 2, new_qty: 3 };
        let ev_cancel = OrderEvent::Cancel(2);

        assert_eq!(describe_event(&ev_new), "new #2 qty=5");
        assert_eq!(describe_event(&ev_mod), "mod #2 qty=3");
        assert_eq!(describe_event(&ev_cancel), "cancel #2");
        assert_eq!(extract_cancel_id(&ev_new), None);
        assert_eq!(extract_cancel_id(&ev_cancel), Some(2));
    }

    #[test]
    fn test_niche_optimization() {
        assert_eq!(size_of::<&Order>(), size_of::<Option<&Order>>());
    }
}
