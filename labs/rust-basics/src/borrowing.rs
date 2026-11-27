/// 2.2: Zero-copy string slicing (`&str` accepts `&String`, literals, and subslices).
pub fn split_pair(symbol: &str) -> Option<(&str, &str)> {
    symbol.split_once('-')
}

/// 2.2: Slice parameter `&[i64]` works with `Vec<i64>`, arrays, and subslices.
pub fn sum_window(prices: &[i64]) -> i64 {
    prices.iter().sum()
}

/// 2.2: Mutating two disjoint parts of the same slice via `split_at_mut`.
pub fn swap_and_bump_ends(values: &mut [i64]) {
    if values.len() < 2 {
        return;
    }
    let mid = values.len() / 2;
    let (left, right) = values.split_at_mut(mid);
    let last = right.len() - 1;
    std::mem::swap(&mut left[0], &mut right[last]);
    left[0] += 1;
    right[last] += 1;
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::mem::size_of;

    #[test]
    fn test_nll_and_slices() {
        let mut nums = vec![10, 20, 30];
        let first = &nums[0];
        assert_eq!(*first, 10); // Last use of `first`; immutable borrow ends here (NLL).
        nums.push(40);
        assert_eq!(sum_window(&nums), 100);
        assert_eq!(sum_window(&nums[1..3]), 50);
    }

    #[test]
    fn test_zero_copy_split_pair() {
        let owned = String::from("BTC-USDT");
        assert_eq!(split_pair(&owned), Some(("BTC", "USDT")));
        assert_eq!(split_pair("ETH-USDC"), Some(("ETH", "USDC")));
        assert_eq!(split_pair("INVALID"), None);
    }

    #[test]
    fn test_split_at_mut_and_pointer_sizes() {
        let mut data = [10, 20, 30, 40];
        swap_and_bump_ends(&mut data);
        assert_eq!(data, [41, 20, 30, 11]);

        assert_eq!(size_of::<String>(), 24);
        assert_eq!(size_of::<&String>(), 8);
        assert_eq!(size_of::<&str>(), 16);
        assert_eq!(size_of::<&[i64]>(), 16);
    }
}
