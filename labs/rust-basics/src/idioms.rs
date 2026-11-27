use std::collections::HashMap;
use std::fmt;

/// 3.1: Trait definition for static & dynamic dispatch.
pub trait Priced {
    fn notional(&self) -> i64;
}

pub struct StockOrder {
    pub price: i64,
    pub qty: i64,
}

pub struct FutureOrder {
    pub price: i64,
    pub qty: i64,
    pub multiplier: i64,
}

impl Priced for StockOrder {
    fn notional(&self) -> i64 {
        self.price * self.qty
    }
}

impl Priced for FutureOrder {
    fn notional(&self) -> i64 {
        self.price * self.qty * self.multiplier
    }
}

/// 3.1: Static dispatch (monomorphized).
pub fn total_notional<T: Priced>(items: &[T]) -> i64 {
    items.iter().map(|x| x.notional()).sum()
}

/// 3.1: Dynamic dispatch (`dyn Trait` fat pointer).
pub fn mixed_notional(items: &[Box<dyn Priced>]) -> i64 {
    items.iter().map(|x| x.notional()).sum()
}

/// 3.1: Newtype bypassing orphan rule to implement `Display` for `Vec<i64>`.
pub struct PriceList(pub Vec<i64>);

impl fmt::Display for PriceList {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self.0)
    }
}

/// 3.2: Custom library error enum with `From` conversion for `?`.
#[derive(Debug, PartialEq, Eq)]
pub enum ParseOrderError {
    InvalidFormat,
    InvalidNumber(std::num::ParseIntError),
    NonPositiveQty,
}

impl fmt::Display for ParseOrderError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidFormat => write!(f, "expected SYMBOL:QTY format"),
            Self::InvalidNumber(e) => write!(f, "invalid qty number: {e}"),
            Self::NonPositiveQty => write!(f, "qty must be positive"),
        }
    }
}

impl std::error::Error for ParseOrderError {}

impl From<std::num::ParseIntError> for ParseOrderError {
    fn from(err: std::num::ParseIntError) -> Self {
        Self::InvalidNumber(err)
    }
}

pub fn parse_order_line(line: &str) -> Result<(&str, u32), ParseOrderError> {
    let (sym, qty_str) = line.split_once(':').ok_or(ParseOrderError::InvalidFormat)?;
    let qty: u32 = qty_str.trim().parse()?;
    if qty == 0 {
        return Err(ParseOrderError::NonPositiveQty);
    }
    Ok((sym.trim(), qty))
}

/// 3.3: Zero-allocation iterator chain + HashMap entry API.
pub fn sum_doubled_above(prices: &[i64], threshold: i64) -> i64 {
    prices
        .iter()
        .copied()
        .filter(|&p| p > threshold)
        .map(|p| p * 2)
        .sum()
}

pub fn aggregate_volume<'a>(trades: &[(&'a str, u64)]) -> HashMap<&'a str, u64> {
    let mut totals = HashMap::with_capacity(trades.len());
    for &(sym, qty) in trades {
        *totals.entry(sym).or_insert(0) += qty;
    }
    totals
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::mem::size_of;

    #[test]
    fn test_static_and_dynamic_dispatch() {
        let stocks = [
            StockOrder { price: 100, qty: 5 },
            StockOrder { price: 200, qty: 3 },
        ];
        assert_eq!(total_notional(&stocks), 1_100);

        let mixed: Vec<Box<dyn Priced>> = vec![
            Box::new(StockOrder { price: 100, qty: 2 }),
            Box::new(FutureOrder { price: 50, qty: 4, multiplier: 10 }),
        ];
        assert_eq!(mixed_notional(&mixed), 2_200);
        assert_eq!(size_of::<&dyn Priced>(), 16);
        assert_eq!(format!("{}", PriceList(vec![1, 2])), "[1, 2]");
    }

    #[test]
    fn test_error_propagation() {
        assert_eq!(parse_order_line("BTC:10"), Ok(("BTC", 10)));
        assert_eq!(parse_order_line("BTC"), Err(ParseOrderError::InvalidFormat));
        assert_eq!(parse_order_line("BTC:0"), Err(ParseOrderError::NonPositiveQty));
        assert!(matches!(
            parse_order_line("BTC:abc"),
            Err(ParseOrderError::InvalidNumber(_))
        ));
    }

    #[test]
    fn test_iterators_and_entry_api() {
        assert_eq!(sum_doubled_above(&[50, 120, 80, 200], 100), 640);

        let totals = aggregate_volume(&[("BTC", 3), ("ETH", 5), ("BTC", 7)]);
        assert_eq!(totals.get("BTC"), Some(&10));
        assert_eq!(totals.get("ETH"), Some(&5));
    }
}
