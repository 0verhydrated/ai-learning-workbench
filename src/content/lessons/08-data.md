---
title: "Persist data without hiding failures"
description: "Validate JSON, handle corrupt localStorage, and distinguish visible changes from saved changes."
order: 8
part: 'Building reliably'
duration: '20 min'
---

## Treat stored values as untrusted input

localStorage stores strings under keys for a browser origin. It does not store JavaScript arrays directly, synchronize across devices, or promise permanent backup. Browser settings, private sessions, user actions, and storage limits can affect availability. Two pages on the same origin can also access the same storage area.

Use a namespaced key such as `reading-list:v1`. Serialize the array with `JSON.stringify()` when saving and parse it when loading. Successful JSON parsing only proves that the text is valid JSON. The value might still be `null`, a number, or an array containing invalid books.

Before adding persistence, define which values the app accepts. This version requires an array of objects, each with a unique nonempty string identifier, a title containing non-whitespace text and no more than 200 characters, and a boolean reading status. Limit the number of books too, so a syntactically valid but enormous list is rejected before rendering.

## Validate at the boundary

This parser rejects a whole invalid document rather than silently discarding individual books:

```js
export function parseBooks(raw) {
  if (raw === null) return [];
  const value = JSON.parse(raw);
  if (!Array.isArray(value) || value.length > 1000) {
    throw new Error('Invalid reading list');
  }
  const ids = new Set();
  return value.map(book => {
    if (!book || typeof book !== 'object' ||
        typeof book.id !== 'string' || !book.id.trim() ||
        ids.has(book.id) || typeof book.title !== 'string' ||
        !book.title.trim() || book.title.length > 200 ||
        typeof book.read !== 'boolean') {
      throw new Error('Invalid book');
    }
    ids.add(book.id);
    return { id: book.id, title: book.title.trim(), read: book.read };
  });
}
```

Constructing fresh objects also keeps unexpected fields out of application state. This is a format check, not a general security guarantee. Test malformed JSON, `null` encoded as JSON, missing fields, duplicate identifiers, and a valid empty array. Notice the difference between no stored value, represented by the argument `null`, and the stored string `"null"`.

## Make recovery an explicit state

Both accessing storage and parsing can fail, so wrap the whole read operation:

```js
export function loadBooks(storage) {
  try {
    return { ok: true, books: parseBooks(storage.getItem('reading-list:v1')) };
  } catch {
    return { ok: false, books: [], error: 'Could not load the saved list.' };
  }
}
```

Pass the storage object into this function so tests can use a small fake. Accessing `window.localStorage` itself can throw in restricted environments; catch that in the browser adapter too, before passing it onward.

An empty fallback lets the page continue running after a failed load. Saving that fallback immediately, however, could destroy the only recoverable copy. Track the load error separately, show a recovery message, and keep automatic saving disabled until the user deliberately resets or resolves the problem. Where possible, let them copy or export the original raw value. The interface must distinguish an unreadable list from a list with no books.

## Report failed writes honestly

A write can fail even when a read worked. Catch errors around `setItem()` and distinguish "added for this session" from "saved." You can keep the in-memory change and display a persistent warning, or revert it with a clear message. Choose one policy and test it.

Keep startup from saving unconditionally: after a failed load, that write could erase the only recoverable copy. Document that concurrent tabs can overwrite each other's changes and that this version has no conflict resolution. A storage event can notify other tabs that something changed; deciding how to merge their edits requires a separate design.

## Exercise: design a corrupt-data test

Create a fake storage object whose `getItem()` returns `'{broken'`. Verify that loading reports failure and that no startup code calls `setItem()` afterward. Use a separate fake that throws on writes to test the unsaved-change message.

<details><summary>Check the recovery behavior</summary>

Have the fake count writes so the test can detect an accidental save after loading fails. In the corrupt-read case, check for a warning, preservation of the original value, and an explicit recovery choice before saving resumes. In the failed-write case, check that the interface does not claim the change was saved. A passing read-failure test says nothing about how the app reports a write failure.

</details>
