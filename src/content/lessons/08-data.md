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

Define a format before adding persistence. For this version, require an array of objects with unique nonempty string identifiers, titles containing non-whitespace text and no more than 200 characters, and boolean reading status. Set a reasonable list limit to avoid accidentally rendering enormous input.

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

An empty fallback prevents a crash, but it must not immediately overwrite corrupt data. Keep a separate load-error flag, show a recovery message, and disable automatic saving until the user deliberately resets or resolves the problem. Offer copying or exporting the original raw value where possible. Do not present an empty fallback as proof that the user had no books.

## Report failed writes honestly

A write can fail even when a read worked. Catch errors around `setItem()` and distinguish "added for this session" from "saved." You can keep the in-memory change and display a persistent warning, or revert it with a clear message. Choose one policy and test it.

Avoid an unconditional save during startup. It can erase the only recoverable copy after a failed load. Also document that concurrent tabs can overwrite each other's changes; this simple version does not implement conflict resolution. A storage event can notify other tabs of changes, but merging conflicting edits requires its own design.

## Exercise: design a corrupt-data test

Create a fake storage object whose `getItem()` returns `'{broken'`. Verify that loading reports failure and that no startup code calls `setItem()` afterward. Use a separate fake that throws on writes to test the unsaved-change message.

<details><summary>Check the recovery behavior</summary>

A useful fake counts writes and lets the test inspect that count. The corrupt-read case should expose a warning, retain the original storage value, and require an explicit recovery choice before saving. The failed-write case should not claim persistence succeeded. These are separate failure paths, so one passing test does not cover both.

</details>
