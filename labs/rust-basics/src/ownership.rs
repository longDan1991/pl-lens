use std::cell::RefCell;
use std::rc::Rc;

/// 2.1: Pure stack struct derives `Copy` + `Clone`.
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct Tick {
    pub price: i64,
    pub qty: u32,
}

/// 2.1: Consumes ownership of a heap-allocated `String`.
pub fn consume_and_len(s: String) -> usize {
    s.len()
}

/// 2.1: Demonstrates deterministic LIFO `Drop` order.
pub struct TraceDrop {
    name: &'static str,
    log: Rc<RefCell<Vec<&'static str>>>,
}

impl TraceDrop {
    pub fn new(name: &'static str, log: Rc<RefCell<Vec<&'static str>>>) -> Self {
        Self { name, log }
    }
}

impl Drop for TraceDrop {
    fn drop(&mut self) {
        self.log.borrow_mut().push(self.name);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_copy_vs_move_and_clone() {
        let t1 = Tick { price: 10_500, qty: 10 };
        let t2 = t1; // Copy: t1 remains valid
        assert_eq!(t1, t2);

        let s1 = String::from("BTC-USDT");
        let s2 = s1.clone(); // Explicit deep clone
        assert_eq!(consume_and_len(s1), 8); // s1 moved here
        assert_eq!(s2, "BTC-USDT"); // s2 unaffected
    }

    #[test]
    fn test_deterministic_lifo_drop_order() {
        let log = Rc::new(RefCell::new(Vec::new()));
        {
            let _first = TraceDrop::new("first", Rc::clone(&log));
            let _second = TraceDrop::new("second", Rc::clone(&log));
            let early = TraceDrop::new("early", Rc::clone(&log));
            drop(early);
        }
        assert_eq!(*log.borrow(), vec!["early", "second", "first"]);
    }
}
