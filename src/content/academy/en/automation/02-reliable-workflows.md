---
title: "Reliable workflows and honest retries"
description: "Limit retries, preserve checkpoints, and prevent duplicate effects across local state and remote publication."
order: 2
course: automation
lang: en
duration: "22 min"
---

## Reliability means recovering without multiplying harm

A **reliable workflow** reaches an acceptable outcome despite expected failures, or stops in a state that an operator can understand and recover. Retrying forever can make failures worse: a news pipeline may publish the same article repeatedly even if every HTTP request eventually succeeds.

A **retry** repeats an attempt. **Idempotency** means repeating the same logical operation has no additional intended effect. **Deduplication** identifies repeated inputs. **Checkpoints** preserve completed stages so recovery does not restart everything. These concepts work together, but none alone guarantees exactly-once execution across unrelated systems [1][2].

## Bound the retry budget

Retry transient connection failures, selected server errors, and rate limits when the service contract permits it. Do not blindly retry invalid input, failed authorization, or rejected safety checks. A timeout is ambiguous: the server may have committed a write before the response disappeared.

Use connection and request timeouts, a maximum number of attempts, an overall deadline, and a cost ceiling. Exponential backoff increases the wait after failures; jitter spreads clients across that wait instead of synchronizing them [1]. A practical policy is four total attempts, with full-jitter waits sampled between zero and `min(8, 2 ** retry_index)` seconds for retry indices zero through two. Those caps are one, two, and four seconds. This bounds waiting, not network time: each request still needs a timeout and the whole operation needs a deadline.

Honor a valid `Retry-After` within your remaining budget; if it exceeds the deadline, defer or fail rather than ignoring it. Choose one retry-owning layer. An SDK, worker, and queue that each retry independently can multiply traffic and cost. Record attempts and the terminal reason, not merely “failed.”

## Make local deduplication atomic

Checking whether a marker exists and then creating it is unsafe under concurrency. Two workers can both pass the check. A database uniqueness constraint makes the claim atomic. This offline example uses a temporary on-disk SQLite database; it demonstrates local state, not remote publication:

```python
import sqlite3
from tempfile import TemporaryDirectory
from pathlib import Path

with TemporaryDirectory() as folder:
    path = Path(folder) / "jobs.sqlite"
    db = sqlite3.connect(path)
    db.execute("CREATE TABLE jobs (id TEXT PRIMARY KEY, state TEXT NOT NULL)")
    key = "weekly:2026-11-08:en-ko:v1"
    def claim():
        with db:
            return db.execute(
                "INSERT OR IGNORE INTO jobs VALUES (?, 'pending')", (key,)
            ).rowcount == 1
    assert claim() is True
    assert claim() is False
    with db:
        db.execute("UPDATE jobs SET state='drafted' WHERE id=?", (key,))
    db.close()
    db = sqlite3.connect(path)
    assert db.execute("SELECT state FROM jobs").fetchone() == ("drafted",)
    print("one claim; checkpoint survives reconnect")
    db.close()
```

Production needs a persistent database path, backups, and a state machine. Distinguish pending, drafted, approved, publishing, published, and blocked. Store artifact hashes, source identifiers, destination IDs, and errors alongside the state. Bind an idempotency key to one intent; changed content needs an explicit revision rather than silently reusing an old key.

## Close the remote-write gap

A crash after remote publication but before saving `published` leaves uncertain state. A local marker cannot resolve that gap. Prefer destination-supported idempotency keys and read back the destination using a stable identifier [2]. If the destination offers neither, require reconciliation or human review before another write.

Workers also need ownership rules: use transactional claims or leases with expiry and fencing where appropriate. Do not reset a pending job simply because it looks old while its first worker might still publish. Checkpoints should resume from verified artifacts, not skip validation of a changed draft.

## Exercise: the missing response

**Exercise:** Publication timed out. The local state says `publishing`. Should recovery delete the row and rerun?

<details>
<summary>Answer</summary>

No. Keep the intent and key, inspect the destination, and reconcile the result. Retry with the same destination-supported idempotency key only under its contract. If the effect cannot be determined safely, mark the job blocked for review. Deleting the row destroys useful evidence and can duplicate publication. Retry source retrieval separately from publishing so a harmless fetch failure cannot replay a completed write.

</details>

## Sources

1. [AWS Builders' Library: timeouts, retries, backoff, and jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
2. [AWS Builders' Library: making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
