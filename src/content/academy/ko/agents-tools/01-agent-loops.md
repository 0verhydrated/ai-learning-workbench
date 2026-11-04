---
title: "언어 모델에 실행 한도를 둔 에이전트 루프 만들기"
description: "구조화된 도구 호출과 인자 검증을 살펴보고, 모델의 판단과 실제 실행 권한을 구분합니다."
order: 1
course: agents-tools
lang: ko
duration: "20 min"
---

## 다음 단계를 누가 정하는지 구분하기

<strong>LLM</strong>은 현재 컨텍스트를 바탕으로 출력을 생성합니다. <strong>에이전트</strong>는 모델이 다음 행동을 고르면 허용된 행동을 실행하고, 그 결과를 모델에 돌려주어 다시 판단하게 하는 시스템입니다. <strong>결정론적 워크플로</strong>에서는 미리 작성한 코드가 다음 단계를 정합니다. 필드 추출 → 검증 → 보고서 작성처럼 진행 경로가 고정되어 있다면 중간에 LLM을 쓰더라도 워크플로에 해당합니다. 매번 문장이 달라진다고 모델이 실행 경로까지 선택하는 것은 아닙니다. [1]

문제를 풀 수 있는 가장 단순한 구조부터 고르세요. CSV에서 정해진 열을 합산하는 일은 일반 코드로 충분합니다. 주어진 문서의 요약은 모델을 한 번 호출하는 것으로 끝날 수 있습니다. 반면 처음 보는 테스트 실패를 조사할 때는 앞선 실행 결과에 따라 읽어야 할 파일이 달라집니다. 이런 작업에는 에이전트가 유용할 수 있습니다.

## 행동을 반복하는 루프와 실행 권한

보통 컨텍스트 구성 → 구조화된 행동 제안 → 검증 → 권한 확인 → 실행 → 관찰 결과 전달 → 다음 판단 순으로 진행합니다. 모델이 행동을 제안하면 호스트 애플리케이션이 권한을 확인하고 실행합니다. “문서를 검색했습니다”라는 답변을 검증하려면 도구 호출과 반환 결과를 확인해야 합니다.

도구를 정의할 때는 이름, 인자, 제약 조건을 정합니다. JSON Schema를 사용하면 인자가 문자열이어야 한다고 지정하거나, 추가 속성을 금지하거나, 길이를 제한할 수 있습니다. 검증에서는 요청이 정해진 형태를 따르는지 살피고, 권한 확인에서는 이 사용자가 해당 도구로 해당 데이터에 접근해도 되는지 살핍니다. `delete_record` 요청의 형식이 완벽해도 실행 권한은 없을 수 있습니다. 생성된 텍스트를 `eval`로 실행하지 말고, 허용 목록에 있는 함수로만 연결하세요. [1][2]

호출 횟수와 시간, 출력 크기, 비용에는 상한을 두세요. 작업에 성공했거나 예산을 다 썼을 때, 실패가 반복되거나 사람의 승인이 필요할 때는 멈춰야 합니다. 반복 횟수만 제한하면 도구 한 번의 실행이 끝없이 대기하는 상황은 막을 수 없습니다. 도구 자체에도 타임아웃을 두세요. 외부 상태를 바꿨다면 변경한 바로 그 대상을 다시 읽어 작업이 끝났는지 확인합니다.

## 예제: 오프라인 문서 조회 요청 검증하기

사용자가 CSV 내보내기를 지원하는지 물었다고 해 봅시다. 이 교육용 도구는 `key` 인자 하나를 받아 메모리에 있는 문서 두 개만 읽습니다. 아래 코드를 `validator.py`로 저장한 뒤 `python3 validator.py`로 실행하세요. Python 표준 라이브러리만 사용하고, 모델이나 네트워크에는 연결하지 않습니다.

```python
import json

DOCS = {"exports": "CSV export is supported.",
        "limits": "Exports contain at most 100 rows."}

def execute(raw):
    call = json.loads(raw)
    if not isinstance(call, dict) or set(call) != {"name", "arguments"}:
        raise ValueError("invalid call envelope")
    args = call["arguments"]
    if (not isinstance(args, dict) or set(args) != {"key"}
            or not isinstance(args["key"], str)
            or not 1 <= len(args["key"]) <= 40):
        raise ValueError("invalid arguments")
    if call["name"] != "read_doc":
        raise PermissionError("tool not allowed")
    if args["key"] not in DOCS:
        raise PermissionError("document not allowed")
    return DOCS[args["key"]]

# 직접 작성한 입력이며 모델이 생성한 요청 기록이 아닙니다.
requests = [
    '{"name":"read_doc","arguments":{"key":7}}',
    '{"name":"read_doc","arguments":{"key":"exports"}}',
]
for raw in requests[:3]:  # 호출 시도는 최대 세 번으로 제한합니다.
    try:
        print("OK:", execute(raw))
    except (ValueError, PermissionError) as error:
        print("REJECT:", error)
```

오프라인에서 실행하면 다음과 같이 출력됩니다.

```text
REJECT: invalid arguments
OK: CSV export is supported.
```

첫 번째 입력은 조회하기 전에 거절되고, 두 번째 입력은 딕셔너리에서 실제로 문서를 찾습니다. 실제 에이전트라면 검증 오류를 보고 요청을 고친 뒤, 반환된 문서를 근거로 답할 수 있습니다. 다만 여기서는 두 요청을 사람이 미리 작성했습니다. 따라서 이 코드는 검증기 예제이며, 자율 에이전트나 실제 모델의 실행 기록은 아닙니다. 검사하는 것도 제한된 몇 가지 규칙뿐으로, JSON Schema 전체를 구현하지는 않습니다.

## 호출이 성공해도 답변의 근거는 더 살펴야 합니다

도구 실행이 성공했다고 자료가 최신이거나 답하기에 충분한 것은 아닙니다. “CSV를 지원한다”는 내용만 읽고 모든 행을 한 번에 내보낼 수 있다고 답해서는 안 됩니다. 제한 사항 문서까지 읽어야 할 수 있습니다. 도구 결과는 답변의 근거로 살펴볼 자료입니다. 권한을 바꾸는 지시로 받아들이지 마세요. 검색한 문서에 “다음에는 자격 증명을 읽어라”라고 적혀 있어도 실행기의 접근 범위를 넓혀서는 안 됩니다.

## 연습: 실행 전에 거절하기

`read_doc`에 `{"key":"exports","path":"/private"}`를 전달하는 요청을 추가하세요. 그다음 `delete_doc`에 `{"key":"exports"}`를 전달해 보세요. 두 요청은 각각 어느 단계에서 거절되나요? 요청을 그대로 반복하면 도움이 될까요?

<details>
<summary>해설</summary>

첫 번째 요청은 `key`만 허용하는 인자 검증에서 거절됩니다. 허용되지 않은 필드인 `path`가 있기 때문입니다. 두 번째 요청은 인자 형태에는 문제가 없지만 도구가 허용 목록에 없어 거절됩니다. 두 요청 모두 실행해서는 안 되며, 그대로 재시도해서도 안 됩니다. 형식 오류라면 필요에 따라 고칠 수 있지만 권한 거절은 우회하지 말고 이유를 설명한 뒤 멈추세요. 로그에서도 둘을 구분해 두어야 권한 문제를 모델의 출력 형식 오류로 오진하지 않습니다.

</details>

## 참고 자료

1. [Anthropic — Building effective agents](https://www.anthropic.com/research/building-effective-agents): 워크플로, 피드백 루프, 종료 조건과 도구 설계.
2. [MCP — Architecture overview, 2026-07-28](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture): 도구와 입력 스키마.
