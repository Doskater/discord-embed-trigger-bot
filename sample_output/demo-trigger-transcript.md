# Demo Trigger Transcript

This transcript shows the expected behavior using the sample trigger in `data/triggers.example.json`.

1. Third-party bot `111111111111111111` posts an embed in channel `333333333333333333`.
2. Embed title, description, or field value contains `rare drop detected`, with any capitalization.
3. The listener sends an embed reply titled `Rare Drop Alert` in the same channel.
4. The listener pings role `222222222222222222`.
5. The listener reacts to the original third-party bot embed with `🚨`.

Negative checks covered by tests:

- Human-authored messages are ignored.
- Bot-authored messages are intentionally accepted.
- Wrong source bot ids do not match.
- Channels outside the allowlist do not match.
- Embed field values are scanned, not only title and description.
