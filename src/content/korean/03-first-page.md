---
title: "처음으로 작동하는 페이지 만들기"
description: "용도에 맞는 HTML 폼으로 책 제목을 입력받아 목록에 표시합니다. 저장 기능은 아직 추가하지 않습니다."
order: 3
part: 'Foundations'
duration: '18분'
---

## 하나의 상호작용을 끝까지 완성하기

먼저 책 제목을 입력하고 제출하면 목록에 나타나게 만듭니다. 저장, 정렬, 표지 이미지, 애니메이션은 아직 추가하지 마세요. 이 동작 하나를 끝까지 완성해 두면 이후 변경을 비교할 기준이 생기고, 문제가 나도 살펴볼 범위가 작습니다.

다음 문서를 `index.html`에 넣으세요. 강좌 화면에 수업 제목이 표시되는 것과 별개로, 만드는 애플리케이션에도 아래와 같이 제목 요소가 있어야 합니다.

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

레이블(label)은 보조 기술이 입력란을 구별할 수 있도록 접근 가능한 이름(accessible name)을 붙여 줍니다. 폼(form)을 쓰면 별도의 키보드 처리 함수를 만들지 않아도 입력란에서 Enter를 눌러 제출할 수 있습니다. 상태 문단에는 처리 결과를 표시합니다. 이 요소의 status 역할(role) 덕분에 보조 기술(assistive technology)은 포커스(focus)를 옮기지 않고도 변경 사항을 알릴 수 있습니다. 브라우저가 제공하는 네이티브 컨트롤(native control)을 활용하면 구현할 일이 줄어듭니다. 그래도 페이지가 의도대로 동작하는지는 직접 테스트해야 합니다.

## 상태를 화면에 표시하기

다음 코드를 `app.js`에 추가하세요. 상태(state)를 담는 배열은 이벤트 처리 함수인 핸들러(handler) 바깥에 둡니다. 그래야 페이지가 실행되는 동안 제목을 제출할 때마다 기존 목록에 책을 추가할 수 있습니다.

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

`preventDefault()`는 폼 제출 시 브라우저가 기본으로 수행하는 페이지 이동을 막습니다. `trim()`은 앞뒤 공백을 제거하므로 공백으로만 된 문자열이 책으로 추가되지 않습니다. `textContent`는 제목을 HTML로 해석하지 않고 문자 그대로 넣습니다. 식별자에는 `crypto.randomUUID()`를 사용합니다. 이 메서드는 최신 브라우저의 보안 컨텍스트(secure context)에서 사용할 수 있으며, 일반적인 localhost 개발 환경도 여기에 포함됩니다. 대상 브라우저가 오래된 버전이라면 호환성을 확인하세요.

렌더링(rendering) 함수는 상태를 읽어 화면의 목록을 다시 만듭니다. 작은 프로젝트에서는 흐름을 파악하기 쉬운 방식입니다. 다만 나중에 목록 안에 조작 가능한 컨트롤을 넣는다면, 목록을 다시 만든 뒤에도 포커스가 유지되는지 살펴야 합니다.

## 키보드로 쓰기 편한 화면 만들기

처음에는 짧은 스타일시트(stylesheet)면 충분합니다.

```css
body { font-family: system-ui, sans-serif; line-height: 1.5; }
main { max-width: 40rem; margin: 2rem auto; padding: 1rem; }
input, button { font: inherit; padding: 0.6rem; }
input { max-width: 100%; box-sizing: border-box; }
:focus-visible { outline: 3px solid #174ea6; outline-offset: 3px; }
li { overflow-wrap: anywhere; }
```

로컬 서버로 페이지를 열고 키보드로 입력란과 버튼까지 이동해 보세요. 일반적인 제목, 공백, 꺾쇠괄호가 포함된 제목을 차례로 제출하면서 콘솔(console)에 오류가 뜨는지 살펴봅니다. 새로고침도 해 보세요. 이 버전에서는 목록이 사라지는 것이 예상된 동작입니다. 상태 메시지에도 아직 저장되지 않았다는 점이 드러나야 합니다.

## 파일 사이의 연결 지점 살펴보기

도우미에게 기능을 더해 달라고 요청하기 전에 파일들이 어디서 연결되는지 찾아보세요. HTML은 상대 경로(relative path)로 스타일시트와 모듈을 요청하고, JavaScript는 ID로 요소를 선택합니다. 마크업(markup)의 ID만 바꾸고 선택자(selector)를 그대로 두면 문법 오류가 없어도 두 파일의 연결이 끊어집니다.

핸들러를 위에서 아래로 읽으며 왜 배열을 바꾸기 전에 입력을 검증하는지 설명해 보세요. 렌더링은 왜 배열을 바꾼 뒤에 하는지도 짚어 봅니다. 순서를 뒤집으면 화면에 이전 상태가 표시될 수 있습니다. 핸들러가 짧을 때 이 순서를 직접 설명해 보면, 기능이 늘어나기 전에 이해가 막히는 부분을 찾을 수 있습니다.

## 실습: 첫 버전의 성공 기준 설명하기

Enter를 눌러 책 두 권을 추가한 뒤 공백만 입력해 보세요. 브라우저 창의 폭을 줄였을 때 긴 제목 때문에 가로 스크롤이 생기는지도 확인합니다. 애플리케이션이 모두 완성됐다고 적기보다, 어떤 동작을 확인했고 무엇을 관찰했는지 기록하세요.

<details><summary>동작 확인하기</summary>

유효한 제목 두 개를 제출했다면 목록에 항목 두 개가 남아 있어야 합니다. 공백을 제출해도 항목은 늘지 않아야 하고, 꺾쇠괄호는 텍스트로 보여야 합니다. 책이 정상적으로 추가된 뒤에는 키보드 포커스가 입력란으로 돌아옵니다. 새로고침하면 메모리에 있던 배열은 초기화됩니다. 제출할 때 페이지가 이동한다면 HTML 구조부터 바꾸지 말고, 모듈이 로드됐는지와 이벤트 리스너(event listener)가 등록됐는지 먼저 살펴보세요.

</details>
