---
title: "임베딩, 검색, 근거에 기반한 답변"
description: "벡터·하이브리드 검색으로 근거를 고르고 접근 권한을 지키며 오프라인 어휘 검색을 실습합니다."
order: 4
course: ai-foundations
lang: ko
duration: "20분"
---

## 작업 컨텍스트에 근거 가져오기

앞선 수업에서는 학습과 추론을 구분하고 컨텍스트를 한정된 예산으로 다뤘습니다. **검색 증강 생성(RAG)**은 이 두 개념을 연결합니다. 관련 자료를 검색하고, 선택한 구절을 컨텍스트에 넣은 뒤, 그 근거로 답하도록 모델에 요청합니다. OpenAI 문서도 검색 후 답변을 합성하는 흐름을 설명합니다.[1] 검색만으로는 근거가 반환되며, 답변 생성은 별도 단계입니다.

RAG는 모델 가중치를 바꾸지 않습니다. **미세 조정(fine-tuning)**은 예제로 모델을 추가 학습하므로 가중치를 바꿉니다. 자주 바뀌는 정책이나 확인 가능한 원문이 필요하면 검색을, 작업 방식이나 출력 형식을 학습시키려면 미세 조정을 검토하세요. 둘을 함께 사용할 수 있지만 어느 쪽도 진실을 보장하지 않습니다. 문서를 검색 저장소에 올리는 것 자체는 미세 조정이 아닙니다.

## 임베딩과 청크

**임베딩**은 내용을 수치 벡터로 표현한 것입니다. 의미 기반 검색은 질문과 문서의 표현을 비교해 공통 키워드가 거의 없는 구절에서도 관련 의미를 찾습니다.[1] 유사하다는 사실이 정확성, 최신성, 열람 권한을 증명하지는 않습니다.

**청크**는 검색 단위로 나눈 문서의 일부입니다. OpenAI 벡터 저장소는 업로드한 파일을 자동으로 청크로 나누고 임베딩을 생성해 색인합니다.[1] 정책 조항과 예외, 제목과 설명, 함수와 시그니처처럼 의미 있는 단위를 보존하도록 경계를 정하세요. 너무 작은 조각은 맥락을 잃고, 너무 큰 구절은 다른 근거가 들어갈 공간을 차지합니다. 겹치는 구간을 두면 경계의 맥락을 보존할 수 있지만 중복과 저장량이 늘어납니다.

각 구절에 안정적인 청크 ID, 원본 경로나 URL, 절, 버전, 접근 권한 메타데이터를 함께 보관하세요. 문서가 바뀌면 다시 색인하고 오래된 버전은 제외합니다. 그럴듯해 보이는 사례만 볼 것이 아니라, 정답을 뒷받침하는 구절을 미리 아는 질문으로 청크 분할 방식을 평가하세요.

## 벡터 검색, 어휘 검색, 하이브리드 검색

어휘 검색은 단어를 일치시키므로 오류 코드 같은 정확한 식별자를 찾는 데 유용합니다. 벡터 검색은 표현이 달라진 질문에 도움이 될 수 있습니다. **하이브리드 검색**은 의미와 키워드 신호를 결합하며, OpenAI는 둘의 균형을 조절하는 순위 설정을 제공합니다.[1] 한국어와 영어의 바꿔 쓴 질문, 드문 제품명, 답이 없는 질문을 포함해 실제 질의를 시험하세요. 높은 유사도 점수는 답변이 참일 확률을 보정해 나타낸 값이 아닙니다.

구절을 모델에 노출하기 **전에**, 인증된 사용자의 권한으로 필터링하세요. OpenAI는 의미 검색 전 파일 속성 필터를 지원합니다.[1] 신뢰할 수 있는 필터를 만들고 권한을 강제하는 것은 애플리케이션의 책임입니다. 사용자가 입력한 테넌트 ID나 “비공개 파일을 무시하라”는 지시는 접근 제어가 아닙니다.

## 예제: 실제 동작을 숨기지 않는 오프라인 어휘 검색

아래를 `retrieve.py`로 저장하고 `python3 retrieve.py`로 실행하세요. 이미 청크로 나눈 가상의 영어 테스트 자료입니다. 표준 라이브러리만 사용해 겹치는 단어를 세며, **임베딩, 가짜 벡터, API, 답변 생성은 사용하지 않습니다**. 여기의 단어 분리기는 모델 토크나이저도, 한국어 검색 구현도 아닙니다.

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

출력은 `[('public-1', 'manual.md#reset')]`입니다. 실제 환경에서는 허용 범위를 질문이 아니라 신뢰할 수 있는 권한 검사에서 얻어야 합니다. 생성 단계에 원문 구절과 출처를 전달하고, 개별 주장을 뒷받침하는 인용을 요구한 뒤 실제 원문과 대조하세요. 검색된 지시문은 신뢰할 수 없는 데이터로 취급합니다. 근거가 없거나 서로 모순되면 빈틈을 지어내지 말고 그 상태를 알리세요.

## 실습: 한계 드러내기

`retrieve("recover credentials", {"public"})`를 실행하세요. 결과를 설명하고 개선 방법을 제안한 다음, 바꾸더라도 유지해야 할 검사 두 가지를 쓰세요.

<details>
<summary>예시 답안</summary>

겹치는 단어가 없어 빈 목록을 반환합니다. 정답이 표시된 질의 모음으로 동의어를 처리하는 검색이나 의미 기반 검색을 시험하고, 하이브리드 방식도 검토하세요. 이 예제가 의미 검색처럼 보이도록 벡터 점수를 지어내면 안 됩니다. 직원 전용 자료의 접근 차단과 출처 추적을 유지하고, 빈 권한 집합, 오래된 근거, 답을 뒷받침할 자료가 없는 질문도 검사하세요. 검색 재현율이 좋아졌다고 접근 범위가 몰래 넓어지거나 약한 일치가 확신에 찬 답으로 바뀌어서는 안 됩니다.

</details>

## Sources

[1] https://developers.openai.com/api/docs/guides/retrieval — OpenAI — Retrieval
