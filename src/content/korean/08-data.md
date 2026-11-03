---
title: "실패를 숨기지 않고 데이터 저장하기"
description: "JSON을 검증하고 손상된 localStorage를 처리하며, 화면에 반영된 변경과 저장된 변경을 구분합니다."
order: 8
part: 'Building reliably'
duration: '20분'
---

## 저장된 값도 신뢰할 수 없는 입력으로 다루기

localStorage는 브라우저의 출처(origin)별로 키에 문자열을 저장합니다. JavaScript 배열을 직접 저장하거나 기기 간에 동기화하지 않으며, 영구적인 백업을 보장하지도 않습니다. 브라우저 설정, 비공개 세션, 사용자의 조작, 저장 용량 제한에 따라 사용하지 못할 수도 있습니다. 같은 출처의 두 페이지는 같은 저장 영역에 접근할 수도 있습니다.

`reading-list:v1`처럼 이름 공간(namespace)을 구분하는 키를 사용하세요. 저장할 때는 `JSON.stringify()`로 배열을 문자열로 직렬화(serialize)하고, 불러올 때는 파싱(parse)해 값으로 복원합니다. JSON 파싱 성공은 텍스트가 올바른 JSON이라는 사실만 증명합니다. 그 값이 여전히 `null`이나 숫자일 수도 있고, 유효하지 않은 책 데이터가 담긴 배열일 수도 있습니다.

영구 저장 기능을 추가하기 전에 형식을 정의하세요. 이번 버전에서는 객체의 배열이어야 하며, 각 객체에는 비어 있지 않고 서로 중복되지 않는 문자열 식별자, 공백이 아닌 텍스트가 포함된 200자 이하 제목, 불리언(boolean) 읽음 상태가 있어야 합니다. 실수로 엄청나게 큰 입력을 화면에 그리지 않도록 목록 크기에도 적절한 제한을 두세요.

## 데이터가 들어오는 경계에서 검증하기

이 파서(parser)는 잘못된 책만 조용히 버리는 대신, 잘못된 데이터가 있는 문서 전체를 거부합니다.

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

새 객체를 만들면 예상하지 않은 필드가 애플리케이션 상태에 들어오는 것도 막을 수 있습니다. 이것은 형식 검사이지, 전반적인 보안을 보장하는 장치는 아닙니다. 잘못된 JSON, JSON으로 표현된 `null`, 누락된 필드, 중복 식별자, 유효한 빈 배열을 테스트하세요. 저장된 값이 없어 인수로 전달되는 `null`과 저장된 문자열 `"null"`은 서로 다르다는 점에 주의하세요.

## 복구가 필요한 상태를 명시적으로 표현하기

저장소 접근과 파싱 모두 실패할 수 있으므로 읽기 작업 전체를 감싸세요.

```js
export function loadBooks(storage) {
  try {
    return { ok: true, books: parseBooks(storage.getItem('reading-list:v1')) };
  } catch {
    return { ok: false, books: [], error: 'Could not load the saved list.' };
  }
}
```

테스트에서 작은 가짜 객체(fake)를 사용할 수 있도록 저장소 객체를 함수에 전달하세요. 제한된 환경에서는 `window.localStorage`에 접근하는 것 자체가 예외를 던질 수 있습니다. 브라우저 어댑터(adapter)에서도 이를 다음 함수로 전달하기 전에 예외를 처리하세요.

실패 시 빈 목록으로 대체하면 앱이 중단되는 것은 막을 수 있지만, 그 목록으로 손상된 데이터를 곧바로 덮어써서는 안 됩니다. 불러오기 오류 여부를 별도의 플래그(flag)로 관리하고, 복구 안내를 보여 주세요. 사용자가 의도적으로 초기화하거나 문제를 해결할 때까지 자동 저장을 비활성화하세요. 가능하다면 원래의 원시 값(raw value)을 복사하거나 내보내는 기능도 제공하세요. 대체용 빈 목록을 사용자의 책이 원래 없었다는 증거처럼 보여 주면 안 됩니다.

## 쓰기 실패를 있는 그대로 알리기

읽기에 성공했어도 쓰기는 실패할 수 있습니다. `setItem()` 호출의 오류를 처리하고, "이번 세션에 추가됨"과 "저장됨"을 구분하세요. 메모리의 변경 사항을 유지하면서 경고를 계속 표시할 수도 있고, 명확한 메시지와 함께 변경을 되돌릴 수도 있습니다. 한 가지 정책을 선택하고 테스트하세요.

시작할 때 무조건 저장하지 마세요. 불러오기에 실패한 뒤 복구할 수 있는 유일한 사본까지 지울 수 있습니다. 동시에 열린 탭들이 서로의 변경 사항을 덮어쓸 수 있다는 점도 문서에 명시하세요. 이 간단한 버전에는 충돌 해결 기능이 없습니다. 저장소 이벤트(storage event)로 다른 탭에 변경 사실을 알릴 수는 있지만, 충돌하는 편집 내용을 병합하려면 별도의 설계가 필요합니다.

## 실습: 손상된 데이터 테스트 설계하기

`getItem()`이 `'{broken'`을 반환하는 가짜 저장소 객체를 만드세요. 불러오기가 실패를 알리고, 이후 시작 코드에서 `setItem()`을 호출하지 않는지 검증하세요. 저장되지 않은 변경 사항을 알리는 메시지는 쓰기 시 예외를 던지는 별도의 가짜 객체로 테스트하세요.

<details><summary>복구 동작 확인하기</summary>

유용한 가짜 객체는 쓰기 횟수를 세고, 테스트에서 그 횟수를 확인할 수 있게 합니다. 손상된 데이터를 읽는 경우에는 경고를 표시하고 원래 저장소 값을 유지하며, 사용자가 명시적으로 복구 방법을 선택하기 전까지 저장하지 않아야 합니다. 쓰기가 실패한 경우에는 저장에 성공했다고 알리면 안 됩니다. 두 경우는 서로 다른 실패 경로이므로, 테스트 하나를 통과했다고 둘 다 검증된 것은 아닙니다.

</details>
