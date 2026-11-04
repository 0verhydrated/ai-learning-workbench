---
title: "Debug with evidence instead of retries"
description: "Reproduce failures, test a hypothesis, and verify a focused repair before accepting it."
order: 6
part: 'Working with AI'
duration: '16 min'
---

## Preserve the failing situation

Each request to "try again" may replace code before you understand why it failed. The original symptom can disappear while a new bug takes its place, leaving neither change explained. Record the shortest sequence that reproduces the failure, then inspect the current diff before accepting another rewrite.

Suppose the reading list appears to add a book, then immediately loses it. Record the URL, browser, steps, visible behavior, and console messages. Does the whole page reload? Does the title disappear only after a manual refresh? Those observations point to different responsibilities. A reload on submission suggests the form's default navigation was not prevented; loss on manual refresh suggests missing or failed persistence.

Before experimenting with stored data, copy any list you want to keep. Use a separate test origin or disposable browser profile when practical. Debugging should not casually destroy the evidence or the user's real reading list.

## Follow the event rather than guessing

Open developer tools and inspect the Console and Network panels. Confirm that `app.js` loaded successfully. A missing script, syntax error, or incorrect selector can prevent an event listener from attaching at all. Adding another `preventDefault()` call somewhere unrelated will not repair that situation.

A temporary observation can help:

```js
form.addEventListener('submit', event => {
  console.log('submit reached', { prevented: event.defaultPrevented });
  event.preventDefault();
  console.log('navigation prevented', event.defaultPrevented);
  // Existing validation and state update follow here.
});
```

Put these observations inside the existing listener. Adding a second handler can make the form run twice and confuse the diagnosis. Log event metadata without private titles when that is enough to answer the question. Once you have the answer, remove temporary logs or turn checks worth retaining into tests.

A breakpoint is often better than more logging. Pause inside the handler, inspect the input value and the books array, then step forward. Check whether the state changes before asking why the screen did not update.

## Make one falsifiable hypothesis

A hypothesis should predict an observation. "The selector is wrong" predicts that `document.querySelector('#book-form')` returns `null`. "Storage belongs to another origin" predicts different stored values when the hostname or port changes. These predictions let you reject explanations without rewriting the application.

Ask an assistant to reason from evidence:

```text
Do not change files yet. The form reloads the page on Enter.
Network shows app.js returned 404. The HTML requests ./scripts/app.js,
but the file tree has app.js beside index.html.
Explain the likely cause and the smallest confirming check.
Distinguish observed facts from assumptions.
```

The failed request points to the script path; adding a form library would leave that evidence unexplained. Correct the path, check that the browser requests the intended URL, and confirm that the handler runs. Then repeat the original steps to find out whether this repair actually resolves the failure.

## Verify the repair and nearby behavior

Run the exact failing sequence again. Then check nearby cases: mouse submission, keyboard submission, whitespace input, and adding two books consecutively. If the repaired code contains pure logic, add a regression test for that logic. A browser loading failure still needs a browser or HTTP-level check; a unit test cannot prove that an HTML path is correct.

Inspect the final diff. Remove speculative edits that were not needed. Keep a brief record of the symptom, cause, change, and checks actually performed. If you could not reproduce the issue, say so rather than claiming a fix based only on code inspection.

## Exercise: distinguish two similar symptoms

A list survives refresh at `http://localhost:8000` but appears empty at `http://127.0.0.1:8000`. Propose a hypothesis and a check that does not erase either list. Explain why changing the render function would be premature.

<details><summary>Check the diagnosis</summary>

The addresses have different origins and therefore separate localStorage areas. Inspect the relevant key in developer tools at each address, then return to the original URL to confirm that its data remains. Clearing storage would remove the evidence you need. If data is present but does not render on the same origin, investigate parsing and rendering next; the origin difference does not explain that additional failure.

</details>
