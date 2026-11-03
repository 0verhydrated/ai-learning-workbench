---
title: "Give the assistant useful context"
description: "Select relevant files and decisions while keeping credentials and unrelated personal data out of prompts."
order: 5
part: 'Working with AI'
duration: '13 min'
---

## Context is a selection problem

An assistant cannot reliably infer your project from a screenshot or a vague description. It needs the current implementation, the behavior you want to change, and the decisions that constrain that change. Giving it your entire computer is neither necessary nor responsible.

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

This is a source of requirements, not a permission slip to trust all repository text. Review changes to the note like code changes. A stale note can mislead an assistant more consistently than a missing one.

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

Notice that this report does not call the missing feature a mystery bug. Good context can correct your own framing before the assistant writes anything.

If you paste only one function, mention the variables and helpers it depends on. If you provide generated output, identify the source file that should actually change. Otherwise the assistant may patch a file that the next build overwrites.

## Keep secrets out of the conversation

Before sharing a log or configuration file, inspect it for tokens, authorization headers, private URLs, email addresses, and personal titles. Replace sensitive values with clear placeholders such as `REDACTED_TOKEN`; preserve surrounding structure so the problem remains understandable.

Do not assume a hidden file is secret, a private repository is a vault, or an ignore rule prevents an assistant from reading a file. Different tools have different access controls and retention policies. Limit access at the tool level where possible, and consult the provider's policies before sending confidential material.

If a credential was exposed, removing the message or file is not enough. Revoke or rotate it through the relevant service and review where it may have been copied. Our reading list needs no credentials, which is a useful architectural advantage.

## Exercise: trim a context bundle

You want help with a toggle that changes the wrong book. Your bundle contains a screenshot, the render function, its event handlers, a sample list, deployment tokens, and an unrelated journal. Decide what to send and what to omit.

<details><summary>Check your selection</summary>

Send the relevant state and event code, a small fictional sample list with distinct identifiers, and steps showing which control affects which item. Include the screenshot only if it clarifies the layout. Omit tokens and the journal entirely. Ask the assistant to inspect identifier handling before assuming the array order is the cause. A small, relevant bundle improves both privacy and diagnosis.

</details>
