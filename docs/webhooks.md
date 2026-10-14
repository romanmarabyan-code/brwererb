Deliveries are retried by GitHub; handlers must be idempotent.
Redeliveries are processed again on purpose; idempotency lives further in.

## Redeliveries

GitHub retries a delivery up to three times with the same `X-GitHub-Delivery`. The handler
keeps the most recent delivery ids and drops a repeat, so a retry writes nothing twice.
The log is bounded: past that many ids the oldest one is evicted.
