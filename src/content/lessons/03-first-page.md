---
title: "Build the first working page"
description: "Connect a semantic form to visible state before introducing persistence or extra features."
order: 3
part: 'Foundations'
duration: '18 min'
---

## Start with one complete interaction

The first milestone is modest: type a book title, submit it, and see it in a list. Do not add storage, sorting, cover images, or animation yet. One complete interaction gives you a working baseline and a smaller area to inspect when something fails.

Put this document in `index.html`. Include the heading in the application itself; the course layout only supplies the lesson title.

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My reading list</title>
  <link rel="stylesheet" href="./styles.css">
  <main>
    <h1>My reading list</h1>
    <form id="book-form">
      <label for="title">Book title</label>
      <input id="title" name="title" maxlength="200" required>
      <button type="submit">Add book</button>
    </form>
    <p id="status" role="status"></p>
    <ul id="books"></ul>
  </main>
  <script type="module" src="./app.js"></script>
</html>
```

The label gives the input an accessible name. A form lets Enter submit from the input without a separate keyboard handler. The status paragraph provides a place for feedback, and its status role allows assistive technology to announce changes without moving focus. Native controls save work, but they do not remove the need to test the page.

## Make state visible

Add the following to `app.js`. Keep the state array outside the handler so each submission adds to the existing list during this page session.

```js
const form = document.querySelector('#book-form');
const input = document.querySelector('#title');
const list = document.querySelector('#books');
const status = document.querySelector('#status');
const books = [];

function render() {
  list.replaceChildren();
  for (const book of books) {
    const item = document.createElement('li');
    item.textContent = book.title;
    list.append(item);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) {
    status.textContent = 'Enter a book title.';
    input.focus();
    return;
  }
  books.push({ id: crypto.randomUUID(), title, read: false });
  render();
  form.reset();
  status.textContent = 'Book added. Not yet saved after refresh.';
  input.focus();
});
```

`preventDefault()` stops the browser's normal form navigation. `trim()` removes surrounding whitespace, so a string of spaces does not become a book. `textContent` inserts a literal title rather than interpreting it as HTML. The identifier uses `crypto.randomUUID()`, available in modern browsers in secure contexts, including ordinary localhost development. Check compatibility if your target browser is older.

The render function rebuilds the visible list from state. That is easy to inspect for a small project. Once list items contain interactive controls, consider focus preservation before reusing this rendering strategy unchanged.

## Make the page usable without decoration

A small stylesheet is enough to start:

```css
body { font-family: system-ui, sans-serif; line-height: 1.5; }
main { max-width: 40rem; margin: 2rem auto; padding: 1rem; }
input, button { font: inherit; padding: 0.6rem; }
input { max-width: 100%; box-sizing: border-box; }
:focus-visible { outline: 3px solid #174ea6; outline-offset: 3px; }
li { overflow-wrap: anywhere; }
```

Open the page through your local server. Use the keyboard to reach the input and button. Submit a normal title, then spaces, then a title containing angle brackets. Inspect the console for errors. Refresh deliberately: losing the list is currently expected, and the status message should not imply otherwise.

## Inspect the connection points

Before asking an assistant to extend this page, identify every connection between the files. The HTML requests the stylesheet and module by relative path. The JavaScript selects elements by their IDs. Changing an ID in the markup without changing its selector breaks that connection even if both files remain syntactically valid.

Read the handler from top to bottom and explain why validation happens before the array changes. Then explain why rendering happens after the change. If those steps are reversed, the screen may display the previous state. Explaining that order can reveal gaps in your understanding while the handler is still short enough to follow.

## Exercise: describe a successful first version

Add two books using Enter. Try whitespace-only input. Narrow the browser window and check whether a long title causes horizontal scrolling. Record what you observed rather than declaring the whole application finished.

<details><summary>Check the behavior</summary>

The list should contain two items after the valid submissions and no extra item after spaces. Angle brackets should appear as text. Keyboard focus should return to the input after a successful addition. Reloading clears this version's in-memory array. If the page navigates on submission, inspect whether the module loaded and whether the event listener was attached before changing the HTML structure.

</details>
