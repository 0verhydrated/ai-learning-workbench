---
title: "Refactor in small, tested steps"
description: "Improve structure without mixing cleanup, feature changes, and storage migrations into one diff."
order: 10
part: 'Advanced practice'
duration: '16 min'
---

## Name the problem before changing structure

Refactoring changes the internal structure while preserving intended observable behavior. It can make the next feature easier to build, but "clean up everything" is a poor instruction. You need a specific source of friction: duplicated validation, a handler that mixes several responsibilities, or storage logic that cannot be tested without a browser.

The reading list now has a form, transformations, rendering, and persistence. A single file may still be small enough to understand. Do not split it merely to create more files. Extract a boundary when it reduces coupling or gives you a useful testing seam.

A practical first target is the persistence boundary. Moving JSON parsing and validation into a module lets Node test them directly. The browser adapter can remain responsible for obtaining localStorage and displaying errors.

## Establish the behavior you intend to preserve

Run existing tests before editing and record any failures. Check the browser flow too: add a book, toggle it, refresh, and use the controls by keyboard. If behavior is undocumented, write characterization tests that capture what the current code does. Then decide whether that behavior is actually desirable.

Do not preserve a known bug just because a characterization test captured it. Fixing that bug is a separate behavioral change with a separate expectation. Keeping the distinction clear makes review easier: reviewers can tell whether a difference is intentional or accidental.

Use Git to inspect the starting point:

```sh
git status --short
git diff
node --test books.test.mjs
```

Do not overwrite unrelated local work. Commit a known state or coordinate with its owner before moving shared code. A clean working tree is convenient, but the important requirement is understanding which changes belong to this task.

## Move one responsibility at a time

A focused prompt might say:

```text
Extract parseBooks into storage.mjs without changing its accepted
format, error behavior, or storage key. Update imports and tests.
Do not change rendering, rename DOM IDs, add dependencies, or
introduce a data migration. Show the diff and actual test results.
If behavior must change, stop and explain why before proceeding.
```

First move the function and update its imports. Run the focused tests. Then run the complete available suite and the browser check affected by the module path. An extraction can preserve the function perfectly while breaking the page through a misspelled import.

In a later step, you might separate a submit handler into input normalization, state transformation, rendering, and save reporting. Keep the sequence explicit: a failed save should not accidentally become a successful status message because a helper returns too little information.

## Review for hidden behavior changes

Inspect more than formatting. Did the storage key change? Did title trimming move from input time to render time? Did the new helper swallow errors that the interface used to show? Did a supposedly harmless list rebuild remove keyboard focus?

A rename inside one module is different from renaming a serialized property. Changing `read` to `completed` in stored data requires compatibility decisions for existing lists. That is a migration, not just cleanup. Separate it from the refactor so old-format tests and recovery behavior receive attention.

Prefer a modest improvement you can explain over an elaborate abstraction built for hypothetical features. A generic repository class, event bus, and plugin system would make this small reading list harder to follow unless a concrete requirement justified them.

## Exercise: split an oversized proposal

An assistant proposes extracting storage, changing the saved format, adding search, and redesigning the buttons in one patch. Divide the work into reviewable steps and state the checks for the first step.

<details><summary>Compare your sequence</summary>

Start with a behavior-preserving storage extraction and verify parsing tests, import loading, save failures, and reload behavior. Consider the format migration separately with old-data fixtures and a recovery plan. Add search as its own feature with explicit matching rules. Review the button redesign with keyboard and focus checks. The order may vary, but each patch should have one explainable purpose and evidence appropriate to that purpose.

</details>
