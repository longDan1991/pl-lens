use std::cell::RefCell;
use std::future::Future;
use std::pin::Pin;
use std::rc::Rc;
use std::sync::{mpsc, Arc, Mutex};
use std::task::{Context, Poll, RawWaker, RawWakerVTable, Waker};
use std::thread;

/// 4.1: Recursive enum requires `Box` for finite stack size.
pub enum Expr {
    Lit(i64),
    Add(Box<Expr>, Box<Expr>),
}

impl Expr {
    pub fn eval(&self) -> i64 {
        match self {
            Self::Lit(v) => *v,
            Self::Add(l, r) => l.eval() + r.eval(),
        }
    }
}

/// 4.2: Scoped threads borrowing stack slices directly with zero copies.
pub fn parallel_sum(data: &[i64]) -> i64 {
    let mid = data.len() / 2;
    let (left, right) = data.split_at(mid);
    thread::scope(|s| {
        let h1 = s.spawn(|| left.iter().sum::<i64>());
        let h2 = s.spawn(|| right.iter().sum::<i64>());
        h1.join().unwrap() + h2.join().unwrap()
    })
}

/// 4.3: Minimal hand-written `Future` state machine (zero external deps).
pub struct CountdownFuture {
    remaining: u8,
}

impl CountdownFuture {
    pub fn new(remaining: u8) -> Self {
        Self { remaining }
    }
}

impl Future for CountdownFuture {
    type Output = &'static str;

    fn poll(mut self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<Self::Output> {
        if self.remaining == 0 {
            Poll::Ready("done")
        } else {
            self.remaining -= 1;
            Poll::Pending
        }
    }
}

fn noop_waker() -> Waker {
    unsafe fn clone(_: *const ()) -> RawWaker {
        RawWaker::new(std::ptr::null(), &VTABLE)
    }
    unsafe fn noop(_: *const ()) {}
    static VTABLE: RawWakerVTable = RawWakerVTable::new(clone, noop, noop, noop);
    // SAFETY: VTABLE functions are all pure no-ops that ignore the null data pointer.
    unsafe { Waker::from_raw(RawWaker::new(std::ptr::null(), &VTABLE)) }
}

/// 4.4: Safe wrapper around minimal `unsafe` slice split.
pub fn split_two_mut<T>(slice: &mut [T], mid: usize) -> (&mut [T], &mut [T]) {
    let len = slice.len();
    assert!(mid <= len, "mid out of bounds");
    let ptr = slice.as_mut_ptr();
    // SAFETY: `mid <= len` verified above; `[0..mid)` and `[mid..len)` are disjoint
    // subranges within the valid allocation of `slice`.
    unsafe {
        (
            std::slice::from_raw_parts_mut(ptr, mid),
            std::slice::from_raw_parts_mut(ptr.add(mid), len - mid),
        )
    }
}

/// 4.4: Stable C ABI struct layout.
#[repr(C)]
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub struct CQuote {
    pub price_ticks: i64,
    pub qty: u32,
    pub side: u8,
}

#[no_mangle]
pub extern "C" fn quote_notional(q: CQuote) -> i64 {
    q.price_ticks * i64::from(q.qty)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_smart_pointers() {
        let expr = Expr::Add(Box::new(Expr::Lit(10)), Box::new(Expr::Lit(32)));
        assert_eq!(expr.eval(), 42);

        let shared = Rc::new(RefCell::new(vec![1, 2]));
        let handle = Rc::clone(&shared);
        handle.borrow_mut().push(3);
        assert_eq!(*shared.borrow(), vec![1, 2, 3]);
    }

    #[test]
    fn test_threads_and_channel() {
        let counter = Arc::new(Mutex::new(0_u64));
        let mut handles = Vec::new();
        for _ in 0..4 {
            let counter = Arc::clone(&counter);
            handles.push(thread::spawn(move || {
                *counter.lock().unwrap() += 1;
            }));
        }
        for h in handles {
            h.join().unwrap();
        }
        assert_eq!(*counter.lock().unwrap(), 4);

        let (tx, rx) = mpsc::channel();
        thread::spawn(move || {
            tx.send(String::from("fill-1001")).unwrap();
        });
        assert_eq!(rx.recv().unwrap(), "fill-1001");
        assert_eq!(parallel_sum(&[1, 2, 3, 4, 5, 6]), 21);
    }

    #[test]
    fn test_manual_future_poll() {
        let waker = noop_waker();
        let mut cx = Context::from_waker(&waker);
        let mut fut = CountdownFuture::new(2);
        let mut pinned = Pin::new(&mut fut);

        assert_eq!(pinned.as_mut().poll(&mut cx), Poll::Pending);
        assert_eq!(pinned.as_mut().poll(&mut cx), Poll::Pending);
        assert_eq!(pinned.as_mut().poll(&mut cx), Poll::Ready("done"));
    }

    #[test]
    fn test_safe_unsafe_wrapper_and_repr_c() {
        let mut buf = [10, 20, 30, 40];
        let (left, right) = split_two_mut(&mut buf, 2);
        left[0] += 1;
        right[1] += 2;
        assert_eq!(buf, [11, 20, 30, 42]);

        let q = CQuote { price_ticks: 10_500, qty: 4, side: 1 };
        assert_eq!(quote_notional(q), 42_000);
        assert_eq!(std::mem::size_of::<CQuote>(), 16);
    }
}
