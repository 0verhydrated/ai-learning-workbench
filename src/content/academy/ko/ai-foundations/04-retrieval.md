---
title: "임베딩과 검색으로 근거를 찾아 답하기"
description: "벡터·하이브리드 검색으로 근거를 고르는 법과 접근 권한을 지키는 법을 배우고, 오프라인 어휘 검색을 실습합니다."
order: 4
course: ai-foundations
lang: ko
duration: "20분"
---

## 답변에 필요한 근거를 컨텍스트로 가져오기

<strong>검색 증강 생성(RAG)</strong>은 관련 자료를 검색해 필요한 구절을 컨텍스트에 넣고, 모델이 그 근거를 바탕으로 답하게 하는 방식입니다. OpenAI 문서에서도 검색한 뒤 답변을 구성하는 흐름을 설명합니다.[1] 검색 단계에서 얻는 것은 근거 자료입니다. 이를 이용해 답변을 만드는 일은 별도로 진행합니다.

RAG를 사용해도 모델 가중치는 바뀌지 않습니다. 반면 <strong>미세 조정(fine-tuning)</strong>은 예제로 모델을 추가 학습하므로 가중치가 바뀝니다. 자주 바뀌는 정책을 다루거나 원문을 확인할 수 있어야 한다면 검색을 검토하세요. 작업 방식이나 출력 형식을 학습시키려는 목적이라면 미세 조정을 검토할 수 있습니다. 둘을 함께 쓸 수도 있지만, 어느 쪽도 답변이 참이라고 보장하지는 않습니다. 문서를 검색 저장소에 올리기만 해서는 미세 조정이 이루어지지 않습니다.

## 임베딩과 청크

<strong>임베딩</strong>은 내용을 수치 벡터로 나타낸 것입니다. 의미 기반 검색은 질문과 문서를 이렇게 표현한 뒤 비교합니다. 그래서 공통 키워드가 거의 없는 구절에서도 관련된 의미를 찾을 수 있습니다.[1] 다만 비슷한 내용이라고 해서 정확하거나 최신인 것은 아니며, 사용자가 읽을 권한이 있다는 뜻도 아닙니다.

<strong>청크</strong>는 검색할 수 있도록 나눈 문서의 일부입니다. OpenAI 벡터 저장소는 업로드한 파일을 자동으로 청크로 나누고, 임베딩을 생성해 색인합니다.[1] 나누는 경계를 정할 때는 정책 조항과 예외, 제목과 설명, 함수와 시그니처처럼 함께 읽어야 의미가 통하는 단위를 보존하세요. 너무 잘게 나누면 맥락을 잃고, 너무 크게 나누면 다른 근거를 넣을 공간이 줄어듭니다. 경계 부근을 겹치게 나누면 맥락을 보존할 수 있지만 중복과 저장량이 늘어납니다.

각 구절에는 안정적인 청크 ID와 원본 경로나 URL, 절, 버전, 접근 권한 메타데이터를 함께 보관하세요. 문서가 바뀌면 다시 색인하고 오래된 버전은 제외합니다. 청크가 그럴듯하게 나뉘어 보이는지만 살펴서는 부족합니다. 정답을 뒷받침하는 구절이 어디 있는지 미리 아는 질문으로 분할 방식이 적절한지 평가하세요.

## 벡터 검색, 어휘 검색, 하이브리드 검색

어휘 검색은 일치하는 단어를 찾으므로 오류 코드처럼 정확한 식별자를 검색할 때 유용합니다. 같은 뜻을 다른 표현으로 묻는 질문에는 벡터 검색이 도움이 될 수 있습니다. <strong>하이브리드 검색</strong>은 의미와 키워드 신호를 함께 사용합니다. OpenAI는 두 신호의 비중을 조절하는 순위 설정을 제공합니다.[1] 한국어와 영어로 표현을 바꾼 질문, 드문 제품명, 답이 없는 질문도 넣어 실제 질의를 시험하세요. 유사도 점수가 높더라도 이를 답변이 참일 확률로 해석해서는 안 됩니다. 그런 확률로 보정된 값이 아니기 때문입니다.

구절을 모델에 보여 주기 <strong>전에</strong> 인증된 사용자의 권한에 따라 자료를 걸러야 합니다. OpenAI는 의미 검색 전에 파일 속성으로 필터링하는 기능을 지원합니다.[1] 다만 필터를 신뢰할 수 있게 만들고 실제로 권한을 적용하는 일은 애플리케이션의 책임입니다. 사용자가 입력한 테넌트 ID나 “비공개 파일을 무시하라”는 지시만으로는 접근을 통제할 수 없습니다.

## 예제: 오프라인에서 단어가 겹치는 문서 찾기

아래 코드를 `retrieve.py`로 저장한 뒤 `python3 retrieve.py`로 실행하세요. 가상의 영어 테스트 자료를 미리 청크로 나누어 두었습니다. 표준 라이브러리로 질문과 겹치는 단어를 세어 순위를 정합니다. 임베딩이나 API를 사용하지 않으며 답변도 생성하지 않습니다. 이 단어 분리기를 모델 토크나이저나 한국어 검색 구현으로 보아서는 안 됩니다.

```python
import re

CHUNKS = [
    {"id": "public-1", "scope": "public", "source": "manual.md#reset",
     "text": "Reset your password from account settings."},
    {"id": "staff-1", "scope": "staff", "source": "staff.md#reset",
     "text": "Password reset escalation requires staff approval."},
    {"id": "public-2", "scope": "public", "source": "manual.md#billing",
     "text": "Download invoices from billing settings."},
]

def words(text):
    return set(re.findall(r"[a-z]+", text.lower()))

def retrieve(query, allowed_scopes):
    ranked = []
    for chunk in CHUNKS:
        if chunk["scope"] not in allowed_scopes:
            continue
        score = len(words(query) & words(chunk["text"]))
        if score:
            ranked.append((score, chunk))
    ranked.sort(key=lambda item: (-item[0], item[1]["id"]))
    return [chunk for _, chunk in ranked[:2]]

hits = retrieve("password reset", {"public"})
print([(hit["id"], hit["source"]) for hit in hits])
assert [hit["id"] for hit in hits] == ["public-1"]
assert retrieve("volcano", {"public"}) == []
assert retrieve("password reset", set()) == []
```

출력은 `[('public-1', 'manual.md#reset')]`입니다. 실제 환경에서는 질문에 적힌 범위를 그대로 믿지 말고 신뢰할 수 있는 권한 검사에서 허용 범위를 얻어야 합니다. 답변을 생성할 때는 원문 구절과 출처를 전달하세요. 개별 주장을 뒷받침하는 인용을 요구하고 실제 원문과도 대조합니다. 검색한 자료 안의 지시문은 신뢰할 수 없는 데이터로 취급해야 합니다. 근거가 없거나 서로 모순되면 빈틈을 지어내지 말고 그대로 알리세요.

## 실습: 단어가 겹치지 않는 질문을 넣어 보기

`retrieve("recover credentials", {"public"})`를 실행해 보세요. 왜 그런 결과가 나오는지 설명하고 개선 방법을 제안하세요. 검색 방식을 바꾸더라도 유지해야 할 검사 두 가지도 적어 보세요.

<details>
<summary>예시 답안</summary>

겹치는 단어가 없으므로 빈 목록이 나옵니다. 정답이 표시된 질의 모음으로 동의어를 처리하는 검색이나 의미 기반 검색을 시험하고, 하이브리드 방식도 검토할 수 있습니다. 빈 결과는 단어 일치 방식의 한계를 보여 줍니다. 벡터 점수를 지어내 붙여도 의미 검색의 성능을 시험한 결과가 되지는 않습니다. 방식을 바꿔도 직원 전용 자료의 접근 차단과 출처 추적은 유지해야 합니다. 빈 권한 집합, 오래된 근거, 답을 뒷받침할 자료가 없는 질문도 검사하세요. 검색 재현율이 좋아지더라도 접근 범위가 몰래 넓어지거나, 약한 일치를 근거로 확신에 찬 답을 내놓아서는 안 됩니다.

</details>

## 참고 자료

[1] https://developers.openai.com/api/docs/guides/retrieval — OpenAI — Retrieval
