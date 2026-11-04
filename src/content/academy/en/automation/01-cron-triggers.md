---
title: "Cron schedules and event triggers"
description: "Translate a weekly intention into a timezone-aware trigger and distinguish scheduling from successful execution."
order: 1
course: automation
lang: en
duration: "18 min"
---

## A trigger is not a completed job

A **trigger** requests work; a **scheduler** decides when to issue that request; a **worker** executes it. A saved schedule proves only that the scheduler has configuration. It does not prove that a worker started, retrieved useful sources, or delivered a result. Track these as separate states: scheduled, started, completed, and delivered.

A weekly news assistant needs a working execution environment as well as a Sunday trigger. If it runs on a laptop, the laptop must be awake when the job is due. Hermes documents fresh agent sessions for scheduled runs [1]. Treat each run as a new worker: provide the repository path, source policy, output schema, deadline, and durable checkpoint location. Do not depend on yesterday's conversation remaining in context.

## Read all five fields

A conventional five-field cron expression has this order [2]:

```text
minute hour day-of-month month day-of-week
0      8    *            *     0
```

Here, `*` means every permitted value, and `0` denotes Sunday in this convention. Therefore `0 8 * * 0` means Sunday at 08:00 **in the scheduler's effective timezone**. The expression itself does not contain a timezone. Do not paste it into a UTC scheduler and expect Seoul time.

Our requirement is Sunday 08:00 in `Asia/Seoul`. For a scheduler using UTC, the equivalent expression is `0 23 * * 6`: Saturday 23:00 UTC. Verify the date boundary, not just the hour. This offline Python example uses the standard library and creates no job:

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

local = datetime(2026, 11, 8, 8, 0, tzinfo=ZoneInfo("Asia/Seoul"))
utc = local.astimezone(timezone.utc)
assert local.strftime("%A") == "Sunday"
assert utc.isoformat() == "2026-11-07T23:00:00+00:00"
assert utc.strftime("%A") == "Saturday"
print(local.isoformat(), "=>", utc.isoformat())
```

For regions with daylight-saving changes, a fixed UTC expression may not preserve local wall-clock time throughout the year. Prefer a supported named timezone and inspect upcoming occurrences around clock changes. Cron dialects also differ on Sunday numbering and on combining day-of-month with day-of-week; check the actual scheduler instead of assuming universal syntax.

## Choose the right source of events

**Polling** repeatedly asks whether something changed. **Webhooks** deliver an event when the producer observes a change. A weekly digest naturally uses a schedule; reacting to a pull-request review naturally uses an event. Webhooks still need signature verification, replay protection, and duplicate handling. They are not a guarantee of exactly-once delivery.

GitHub Actions scheduled workflows run from the default branch, and their documented behavior includes possible delays [2]. A hosted workflow avoids dependence on your laptop, but it does not automatically host a separate local Hermes gateway. Confirm where each worker actually runs.

## Inspect before enabling

Prepare a run contract with the effective timezone, next three intended occurrences, overlap policy, maximum runtime, missed-run policy, and success destination. Decide whether a missed week should be skipped or caught up once; do not accidentally replay months of publication jobs.

For Hermes, compare the installed command/tool schema with current documentation before using any scheduling option. Documentation and installed releases can differ. Verify the persisted next-run timestamp and enabled state, then perform an explicitly authorized dry-run. This lesson does not create a live schedule. Keep credentials in the runtime's secret store, never inside cron text, prompts, committed files, or notification messages.

## Exercise: correct the timezone and check delivery

“Cron accepted my expression, so the newsletter will arrive” confuses configuration with delivery. Use separate evidence for each transition, including a readback of the intended destination.

**Exercise:** A UTC worker has `0 8 * * 0`, but the editor requested Sunday 08:00 Seoul. What should change, and what else must be checked?

<details>
<summary>Answer</summary>

Use `0 23 * * 6` if the worker truly uses UTC, or retain `0 8 * * 0` with a supported `Asia/Seoul` timezone setting. Check the persisted next occurrence, worker availability, credentials, fresh-session instructions, overlap handling, and final delivery evidence. A timezone correction alone does not establish successful execution.

</details>

## Sources

1. [Hermes: Scheduled Tasks](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron)
2. [GitHub Actions: events that trigger workflows, schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
