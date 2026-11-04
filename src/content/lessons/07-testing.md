---
title: "Test behavior with deterministic examples"
description: "Use Node's built-in test runner for pure reading-list logic and keep browser checks separate."
order: 7
part: 'Building reliably'
duration: '18 min'
---

## Extract a rule you can test directly

Start with a rule you can explain: toggling one identifier changes only that book and leaves the original array unchanged. The test should fail if either part of the rule breaks and show which expectation was violated. Merely calling the function, or comparing two outputs built on the same assumption from the assistant, does not establish the intended behavior.

Pure functions make this rule easy to test. They accept values and return values without reading the DOM, storage, the clock, or a network service. Keep browser event handling in `app.js`, and put the transformation in `books.mjs`. The `.mjs` extension tells Node to treat the file as an ES module without requiring package configuration. Browsers can import it too when your server sends an appropriate JavaScript MIME type.

## Write the expectation before the implementation

Create `books.test.mjs` with this test:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { toggleBook } from './books.mjs';

test('toggle changes only the requested book without mutation', () => {
  const input = [
    { id: 'a', title: 'Earthsea', read: false },
    { id: 'b', title: 'Kindred', read: true }
  ];
  const before = structuredClone(input);
  const result = toggleBook(input, 'a');

  assert.deepEqual(result, [
    { id: 'a', title: 'Earthsea', read: true },
    { id: 'b', title: 'Kindred', read: true }
  ]);
  assert.deepEqual(input, before);
});
```

Run `node --test books.test.mjs`. If the module is missing, you have an import failure, not yet a meaningful behavioral failure. Create an exported stub returning the input, rerun, and check that the assertion fails because the requested status did not change. This confirms that the test detects the missing behavior.

Then implement the smallest matching rule:

```js
export function toggleBook(books, id) {
  return books.map(book =>
    book.id === id ? { ...book, read: !book.read } : book
  );
}
```

Run the test again and inspect its actual result. The example is a proposed implementation, not a report that your environment passed. Import the function into the application and assign its returned array to your state; calling it without using the return value will not update the list.

## Control sources of variation

Use fixed identifiers in tests. A test that generates random IDs or depends on today's date can fail for reasons unrelated to the rule. If a creation function needs an identifier, pass it in or inject an ID generator. The browser adapter can still call `crypto.randomUUID()` during real use.

Test toggling twice, which should restore the original reading status, and passing an unknown identifier. Choose the unknown-ID policy yourself. Returning a list with unchanged values is reasonable here; write that expectation down so an assistant cannot silently substitute a different policy.

Check that the other book retains its values. Unless the requirements say otherwise, the number of calls to a particular helper is an implementation detail. Asserting that detail would force you to rewrite the test when reorganizing code even if the behavior stayed correct.

## Know what these tests cannot prove

Node's built-in test runner does not provide the browser DOM or localStorage. These tests cannot show that a checkbox has an accessible name, a script URL loads, or focus survives rendering. Keep a short browser checklist alongside the unit tests. Later, a browser automation tool may cover part of that checklist, but manual inspection still has a role.

An assistant can suggest missing cases, but review what each assertion requires the app to do. Generated code and generated tests may share the same misunderstanding. A passing test supports the expectation you wrote; it does not establish that you chose the right expectation.

## Exercise: test the unknown identifier

Write a test showing that toggling `missing` leaves a two-book list equal to its original value. Run it, then temporarily remove the identifier condition in the implementation to confirm that the test catches the mistake. Restore the correct code afterward.

<details><summary>Check the assertion</summary>

Use `assert.deepEqual(toggleBook(input, 'missing'), input)` with fixed sample books. The deliberately broken implementation should change their status and fail the assertion. If the test still passes, inspect whether the test file ran and whether its input was empty. Record real results; a test that was written but never executed remains unverified.

</details>
