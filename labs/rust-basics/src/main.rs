use rust_basics::{classify_latency_us, describe_event, Order, OrderEvent};
use std::mem::size_of;

fn main() {
    let mut order = Order::new(42, 10_250, 10);
    let filled = order.fill(3);
    println!("filled={filled}, remaining={}, notional={}", order.qty, order.notional());

    let event = OrderEvent::New(order);
    println!("event: {}", describe_event(&event));
    println!("latency 25us -> {}", classify_latency_us(25));
    println!(
        "size_of<&Order> = {}, size_of<Option<&Order>> = {}",
        size_of::<&Order>(),
        size_of::<Option<&Order>>()
    );
}
