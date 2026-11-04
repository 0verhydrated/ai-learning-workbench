---
title: "From vibe coding to deliberate development"
description: "Understand what an AI assistant can propose, what the browser does, and what you must verify."
order: 1
part: 'Foundations'
duration: '12 min'
---

## Decide what you are responsible for

**Vibe coding** often means describing an outcome, accepting generated changes, and judging success by whether the screen looks right. That can be useful for a disposable experiment. It becomes risky when you cannot explain what changed, reproduce a failure, or recover someone's data. A convincing interface can still discard a reading list on refresh.

In **responsible AI-assisted development**, you use fast feedback while choosing the behavior, inspecting changes, running checks, and deciding whether the evidence supports shipping. An assistant can propose code and explain unfamiliar syntax. It cannot make your product decisions for you, and **its confident explanation is not a test result**.

Our project is a reading list built with vanilla HTML, CSS, and JavaScript. Readers will add titles, mark books as read, and keep their list in the same browser using localStorage. There are no accounts, shared lists, or server database. Keeping that boundary explicit makes the project small enough to understand.

## Learn the browser's division of labor

**HTML describes meaning and structure**: a form, an input, a button, and a list. **CSS controls presentation**, including spacing and visible keyboard focus. **JavaScript handles events**, changes application state, and updates the document. **The DOM** is the browser's object representation of that document.

A button that looks clickable is not necessarily a working control. Prefer a real `button` because it already supports keyboard activation. A title stored in a JavaScript array is not automatically visible. Your program must render it into the DOM. Nor is that array permanent: a page reload starts a fresh JavaScript execution.

```js
const books = [
  { id: 'book-1', title: 'A Wizard of Earthsea', read: false }
];

const unread = books.filter(book => !book.read);
console.log(unread.map(book => book.title));
```

This example defines an array of objects. Each object has a stable identifier, a string title, and a boolean reading status. The filter creates another array containing matching objects; it does not save anything. Predict what it contains before running it in your browser console.

## Follow one change through the system

When a reader submits a title, the intended flow is: receive the form event, trim and validate the input, create a book, update the array, render the list, then attempt persistence. Later lessons make failure handling explicit. For now, distinguish **state in memory** from **saved state** and from the visible page.

A useful **invariant** is a rule that should remain true after every supported action. For this project, every book should have a nonempty title and a boolean `read` field. Identifiers should be unique within the list. These rules give both you and the assistant something more precise than "make it work."

Try asking for an explanation before requesting implementation:

```text
Explain the data flow for adding one book to a vanilla JavaScript
reading list. Distinguish in-memory state, DOM rendering, and
localStorage. Do not write code yet. Identify two failure cases.
```

Treat the answer as a draft mental model. Check unfamiliar browser APIs against their documentation. Models can invent methods, overlook edge cases, or suggest a dependency that the project does not need.

## Exercise: define a small, observable contract

Write four statements describing your first usable version. Include one normal action, one invalid input, one persistence expectation, and one deliberate limitation. Avoid claims such as "fully secure" or "works everywhere" because they are not specific checks.

<details><summary>Check your contract</summary>

A reasonable contract says that submitting a nonempty title adds one visible book; whitespace-only input adds none and displays a message; a successfully saved list survives a reload on the same origin; and the list does not synchronize between devices. These statements can be checked separately. They leave one question unresolved: what should the interface say when saving fails? Record it for the persistence lesson rather than assuming storage always works.

</details>
