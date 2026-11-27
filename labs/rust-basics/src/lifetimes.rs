/// 2.3: Multiple input references require explicit `'a` (intersection = shorter lifetime).
pub fn longer<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() >= y.len() { x } else { y }
}

/// 2.3: Only the returned parameter needs `'a`.
pub fn take_first<'a>(x: &'a str, _ignored: &str) -> &'a str {
    x
}

/// 2.3: Zero-copy struct holding borrowed slices tied to `'a`.
#[derive(Debug, PartialEq, Eq)]
pub struct LogEntry<'a> {
    pub level: &'a str,
    pub message: &'a str,
}

impl<'a> LogEntry<'a> {
    pub fn parse(line: &'a str) -> Option<Self> {
        let (level, msg) = line.split_once(':')?;
        Some(Self {
            level: level.trim(),
            message: msg.trim(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_longer_and_shorter_scope() {
        let s1 = String::from("long-order-id");
        {
            let s2 = String::from("short");
            assert_eq!(longer(&s1, &s2), "long-order-id");
        }

        let kept;
        {
            let temp = String::from("ignored");
            kept = take_first(&s1, &temp);
        }
        assert_eq!(kept, "long-order-id");
    }

    #[test]
    fn test_zero_copy_log_entry() {
        let raw = String::from("ERROR: timeout after 50ms");
        let entry = LogEntry::parse(&raw).unwrap();
        assert_eq!(
            entry,
            LogEntry {
                level: "ERROR",
                message: "timeout after 50ms",
            }
        );
    }

    #[test]
    fn test_owned_string_satisfies_static_bound() {
        fn requires_static<T: 'static>(_val: T) {}
        let owned = String::from("lives on heap, no short borrows");
        requires_static(owned);
    }
}
