---
title: "처음으로 작동하는 페이지 만들기"
description: "저장 기능이나 추가 기능을 넣기 전에 의미에 맞는 폼을 화면에 보이는 상태와 연결합니다."
order: 3
part: 'Foundations'
duration: '18분'
---

## 하나의 상호작용을 끝까지 완성하기

첫 목표는 소박합니다. 책 제목을 입력하고 제출하면 목록에서 확인할 수 있게 만드는 것입니다. 아직 저장, 정렬, 표지 이미지, 애니메이션은 추가하지 마세요. 하나의 상호작용을 끝까지 완성하면 작동하는 기준 버전이 생기고, 문제가 생겨도 살펴볼 범위가 작아집니다.

다음 문서를 `index.html`에 넣으세요. 이 수업의 제목은 강좌 레이아웃에서 제공하지만, 애플리케이션 안에는 아래와 같이 제목 요소가 있어야 합니다.

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

레이블(label)은 입력란에 보조 기술이 인식할 수 있는 접근 가능한 이름(accessible name)을 부여합니다. 폼(form)을 사용하면 별도의 키보드 처리 함수 없이 입력란에서 Enter를 눌러 제출할 수 있습니다. 상태 문단은 피드백을 표시할 공간입니다. 이 요소의 status 역할(role)은 보조 기술(assistive technology)이 포커스(focus)를 옮기지 않고도 변경 사항을 알릴 수 있게 합니다. 브라우저가 기본 제공하는 네이티브 컨트롤(native control)은 수고를 덜어 주지만, 페이지 테스트까지 대신하지는 않습니다.

## 상태를 화면에 표시하기

다음 코드를 `app.js`에 추가하세요. 상태(state) 배열은 이벤트 처리 함수인 핸들러(handler) 바깥에 두세요. 그래야 이번 페이지 실행 중 제출할 때마다 기존 목록에 책이 추가됩니다.

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

렌더링(rendering) 함수는 상태를 바탕으로 화면의 목록을 다시 만듭니다. 작은 프로젝트에서는 살펴보기 쉬운 방식입니다. 나중에 목록 항목에 조작 가능한 컨트롤이 들어가면, 이 렌더링 방식을 그대로 사용하기 전에 포커스가 유지되는지 고려해야 합니다.

## 장식보다 사용성을 먼저 갖추기

처음에는 짧은 스타일시트(stylesheet)면 충분합니다.

```css
body { font-family: system-ui, sans-serif; line-height: 1.5; }
main { max-width: 40rem; margin: 2rem auto; padding: 1rem; }
input, button { font: inherit; padding: 0.6rem; }
input { max-width: 100%; box-sizing: border-box; }
:focus-visible { outline: 3px solid #174ea6; outline-offset: 3px; }
li { overflow-wrap: anywhere; }
```

로컬 서버를 통해 페이지를 여세요. 키보드로 입력란과 버튼까지 이동해 보세요. 일반적인 제목, 공백, 꺾쇠괄호가 포함된 제목을 차례로 제출하세요. 콘솔(console)에 오류가 있는지 살펴보세요. 의도적으로 새로고침도 해 보세요. 현재는 목록이 사라지는 것이 예상된 동작이므로, 상태 메시지가 저장된 것처럼 오해하게 해서는 안 됩니다.

## 파일 사이의 연결 지점 살펴보기

도우미에게 이 페이지를 확장해 달라고 요청하기 전에 파일 사이의 모든 연결을 찾아보세요. HTML은 상대 경로(relative path)로 스타일시트와 모듈을 요청합니다. JavaScript는 ID로 요소를 선택합니다. 마크업(markup)에서 ID만 바꾸고 선택자(selector)를 바꾸지 않으면 두 파일의 문법이 모두 유효하더라도 연결이 끊어집니다.

핸들러를 위에서 아래로 읽고, 배열을 바꾸기 전에 입력을 검증하는 이유를 설명해 보세요. 이어서 변경 뒤에 렌더링하는 이유도 설명하세요. 순서를 뒤집으면 화면에 이전 상태가 표시될 수 있습니다. 이런 짧은 설명은 유용한 검토 방법입니다. 더 큰 기능이 추가되어 순서를 따라가기 어려워지기 전에, 이해하지 못한 부분을 드러내 줍니다.

## 실습: 첫 버전의 성공 기준 설명하기

Enter를 눌러 책 두 권을 추가하세요. 공백만 입력해 보세요. 브라우저 창의 폭을 줄이고 긴 제목 때문에 가로 스크롤이 생기는지 확인하세요. 애플리케이션 전체가 완성됐다고 선언하기보다 실제로 관찰한 내용을 기록하세요.

<details><summary>동작 확인하기</summary>

유효한 제목을 제출한 뒤에는 목록에 항목 두 개가 있어야 하며, 공백을 제출해도 항목이 더 생기지 않아야 합니다. 꺾쇠괄호는 텍스트로 표시되어야 합니다. 책을 정상적으로 추가하면 키보드 포커스가 입력란으로 돌아와야 합니다. 새로고침하면 이 버전의 메모리 내 배열은 초기화됩니다. 제출할 때 페이지가 이동한다면 HTML 구조를 바꾸기 전에 모듈이 로드되었는지, 이벤트 리스너(event listener)가 등록되었는지 살펴보세요.

</details>
