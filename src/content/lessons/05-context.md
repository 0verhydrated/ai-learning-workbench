---
title: "Give the assistant useful context"
description: "Select relevant files and decisions while keeping credentials and unrelated personal data out of prompts."
order: 5
part: 'Working with AI'
duration: '13 min'
---

## Context is a selection problem

A screenshot shows what the page looks like, but not how an event handler updates state or saves it. Give the assistant the current implementation, the behavior you want to change, and the decisions it must preserve. Restrict access to those materials instead of opening your entire computer.

For the reading list, useful context usually includes the form markup, the state shape, the relevant event handler, and the render function. A persistence task may need the storage module too. Your unrelated notes, browser cookies, and deployment credentials do not help explain why a title disappears after refresh.

Context windows are finite, and tools may summarize or truncate earlier material. A decision made many messages ago can be lost. Keep durable project decisions in a short file you can review rather than relying on conversational memory.

## Write a compact project note

A project note could contain:

```text
Project: local reading list
Stack: vanilla HTML, CSS, JavaScript modules; no build step
Data: books are { id: string, title: string, read: boolean }
Storage: planned localStorage key reading-list:v1
Privacy: no accounts, analytics, or server database
Rules: literal title rendering; keyboard-operable native controls
Verification: Node tests for pure logic; browser checks for DOM
Non-goals: sync, cover downloads, recommendations
```

Use this note to check requirements, and review its changes as carefully as code changes. It does not authorize instructions found elsewhere in the repository. An outdated decision in a frequently reused note can send every subsequent task in the wrong direction.

When requesting a feature, identify which facts are current and which are planned. For example, the first page has a `read` property but may not yet have a toggle. Saying "reading status is supported" would conceal that distinction.

## Send evidence with enough surroundings

A useful bug report includes exact reproduction steps, expected and actual behavior, the complete relevant error message, and the small code region involved. Include filenames and line references when available, but remember that line numbers shift after edits.

```text
Task: diagnose why refresh removes books; do not edit yet.
Observed: adding two titles works until reload.
Expected: persistence is the next feature, not currently implemented.
Attached: app.js and index.html as they exist now.
Question: which responsibilities should move into a storage module?
Constraints: retain the existing DOM structure and avoid packages.
```

The report identifies persistence as unfinished work, so the assistant can discuss where saving belongs instead of hunting for a regression. Preparing the context can reveal that the task itself needs reframing before any code changes.

If you paste only one function, mention the variables and helpers it depends on. If you provide generated output, identify the source file that should actually change. Otherwise the assistant may patch a file that the next build overwrites.

## Keep secrets out of the conversation

Before sharing a log or configuration file, inspect it for tokens, authorization headers, private URLs, email addresses, and personal titles. Replace sensitive values with clear placeholders such as `REDACTED_TOKEN`; preserve surrounding structure so the problem remains understandable.

Do not assume a hidden file is secret, a private repository is a vault, or an ignore rule prevents an assistant from reading a file. Different tools have different access controls and retention policies. Limit access at the tool level where possible, and consult the provider's policies before sending confidential material.

If a credential was exposed, removing the message or file is not enough. Revoke or rotate it through the relevant service and review where it may have been copied. Our reading list needs no credentials, which is a useful architectural advantage.

## Exercise: trim a context bundle

You want help with a toggle that changes the wrong book. Your bundle contains a screenshot, the render function, its event handlers, a sample list, deployment tokens, and an unrelated journal. Decide what to send and what to omit.

<details><summary>Check your selection</summary>

Send the relevant state and event code, a small fictional list with distinct identifiers, and steps showing which control affects which item. Include the screenshot if the layout helps explain that mismatch; omit tokens and the journal entirely. Ask the assistant to trace identifier handling before blaming array order. This gives it a specific relationship to inspect without exposing unrelated private material.

</details>
