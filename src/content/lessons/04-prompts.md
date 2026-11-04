---
title: "Write prompts with a finish line"
description: "Turn an ambiguous feature request into a bounded change with observable acceptance criteria."
order: 4
part: 'Working with AI'
duration: '14 min'
---

## Replace adjectives with behavior

"Make my reading list better" invites the assistant to invent a product. It might add accounts, a framework, or a sorting menu when you only wanted to mark a book as read. Broad requests also make review difficult: there is no agreed boundary for deciding whether a change belongs.

A useful prompt states the current behavior, one desired change, relevant constraints, and checks that distinguish success from failure. Give the assistant enough information to avoid guessing decisions such as which data field should hold reading status. A special persona or elaborate prompt format is unnecessary.

For this project, the next feature is a reading-status toggle. The data already has a boolean `read` field, so the change should use that field rather than create a second, conflicting representation such as a CSS class that becomes the only source of truth.

## Specify a bounded change

Try this prompt after providing the current files:

```text
Add a read/unread toggle to the vanilla reading list.

Current behavior: the form adds books to an in-memory array and
render() displays titles. Each book has id, title, and read.

Scope: change app.js and only the CSS needed for the new control.
Do not add packages, persistence, accounts, sorting, or a framework.

Acceptance criteria:
- A new book starts unread.
- Each book has a keyboard-operable control with an accessible name.
- Activating one control changes only that book's read value.
- Activating it again restores unread.
- Titles remain literal text, never interpreted HTML.
- Focus remains usable after the list updates.

First explain your approach and any uncertainty. Then propose a
small diff. Report checks you actually ran separately from checks
I still need to run in a browser.
```

This prompt does not prescribe every implementation detail. A labeled checkbox is one reasonable design. A button with a suitable name and state is another. Ask the assistant to justify its choice using the required interaction, not personal preference.

The focus requirement matters because rebuilding the list removes its old controls from the DOM. An implementation might update one row in place or deliberately restore focus to the corresponding new control. Either approach needs a browser check.

## Separate acceptance from implementation

Acceptance criteria describe observable behavior. Implementation constraints describe permitted approaches. "Toggling the second book leaves the first unchanged" is an acceptance criterion. "Do not install packages" is a constraint. Mixing them is not fatal, but distinguishing them helps you identify missing evidence.

Also state non-goals. The absence of a request for cloud sync does not always stop an assistant from suggesting it. An explicit non-goal reduces unnecessary changes and gives you a reason to reject them during review.

Before accepting code, compare the diff with your scope. If the assistant changed unrelated files, ask why. A sensible explanation may reveal a real dependency; a vague claim about cleanup is not enough. Split useful unrelated work into a later change.

## Ask for uncertainty, not reassurance

Requesting "production-ready code" rarely produces a usable definition of readiness. Ask for assumptions and unverified behavior instead. An assistant may be unable to run a browser, or it may run tests that do not cover keyboard interaction. Those limits belong in the handoff.

When the proposal misses a requirement, refer to the exact criterion and describe the observation. "After toggling, Tab jumps to the top of the page" is more useful than "the UX is bad." Keep the repair prompt as narrow as the original feature.

## Exercise: improve a vague request

Rewrite "Add search and make it nice" into a prompt for filtering the existing list by title. Decide whether matching ignores case, whether filtering changes saved data, and what an empty result looks like. Keep search separate from sorting.

<details><summary>Compare your acceptance criteria</summary>

A bounded version requests a labeled search input, case-insensitive substring matching, an explicit no-results message, and restoration of all books when the query is cleared. It says filtering must not delete books or change reading status. It also asks for keyboard checks and forbids unrelated dependencies. With these rules in the prompt, you can check the proposed search against agreed behavior instead of debating an implementation based on guesses.

</details>
