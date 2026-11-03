---
title: "언어 모델에서 제한된 에이전트 루프로"
description: "구조화된 도구 호출을 추적하고 인자를 검증하며 모델의 판단과 실행 권한을 구분합니다."
order: 1
course: agents-tools
lang: ko
duration: "20 min"
---

## 무엇이 에이전트를 만드는가?

<strong>LLM</strong>은 현재 컨텍스트를 바탕으로 출력을 생성합니다. <strong>에이전트</strong>는 모델이 다음 행동을 선택하게 하고, 허용된 행동을 실행한 뒤, 관찰 결과를 돌려주어 다시 판단하게 하는 시스템입니다. <strong>결정론적 워크플로</strong>는 미리 작성한 코드로 다음 단계를 정합니다. 필드 추출 → 검증 → 보고서 작성처럼 중간에 LLM을 사용하더라도 진행 경로가 고정되어 있다면 워크플로입니다. 문장이 매번 달라지는 것과 실행 경로를 모델이 선택하는 것은 다릅니다. [1]

문제에 맞는 가장 단순한 구조를 선택하세요. CSV의 정해진 열을 합산하는 일에는 일반 코드면 충분합니다. 제공된 문서 요약은 모델 호출 한 번으로 끝날 수 있습니다. 반면 처음 보는 테스트 실패를 조사할 때는 이전 실행 결과에 따라 읽을 파일이 달라지므로 에이전트가 유용할 수 있습니다.

## 루프와 실행 권한의 경계

일반적인 순서는 컨텍스트 구성 → 구조화된 행동 제안 → 검증 → 권한 확인 → 실행 → 관찰 결과 전달 → 다음 판단입니다. <strong>모델은 제안하고 호스트 애플리케이션이 실행합니다.</strong> “문서를 검색했습니다”라는 문장만으로는 실제 검색이 일어났다고 볼 수 없습니다.

도구 정의에는 이름, 인자, 제약 조건이 들어갑니다. JSON Schema로 문자열 타입을 요구하거나 추가 속성을 금지하고 길이를 제한할 수 있습니다. 검증은 요청의 형태를 검사하고, 권한 확인은 이 사용자가 해당 도구로 해당 데이터에 접근해도 되는지 검사합니다. 형식이 완벽한 `delete_record` 요청도 실행 권한은 없을 수 있습니다. 생성된 텍스트를 `eval`로 실행하지 말고 허용 목록에 있는 함수로만 연결해야 합니다. [1][2]

호출 횟수, 시간, 출력 크기, 비용에 상한을 두세요. 성공, 예산 소진, 반복 실패, 사람의 승인이 필요한 상황에서 멈춰야 합니다. 반복 횟수 제한만으로는 도구 한 번이 무한히 대기하는 일을 막지 못하므로 도구 자체에도 타임아웃이 필요합니다. 외부 상태를 변경했다면 정확히 그 대상을 다시 읽어 완료 여부를 확인합니다.

## 실습 예제: 오프라인 문서 조회

사용자가 CSV 내보내기를 지원하는지 물었다고 합시다. 교육용 도구는 `key` 인자 하나를 받고 메모리에 있는 문서 두 개만 읽습니다. 다음 코드를 `validator.py`로 저장하고 `python3 validator.py`로 실행하세요. Python 표준 라이브러리만 사용하며 모델이나 네트워크에는 연결하지 않습니다.

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

오프라인 실행 결과는 다음과 같습니다.

```text
REJECT: invalid arguments
OK: CSV export is supported.
```

첫 번째 입력은 조회 전에 거절되고, 두 번째 입력은 실제로 딕셔너리를 조회합니다. 실제 에이전트라면 검증 오류를 보고 요청을 수정한 다음, 반환된 문서를 근거로 답할 수 있습니다. 여기서는 두 요청을 사람이 미리 작성했으므로 <strong>검증기 예제이지 자율 에이전트나 실제 모델 실행 기록은 아닙니다.</strong> 또한 이 코드는 작은 계약만 직접 검사할 뿐 JSON Schema 전체를 구현하지 않습니다.

## 성공한 호출이 보장하지 않는 것

실행 성공은 자료의 최신성이나 충분성을 보장하지 않습니다. “CSV를 지원한다”는 사실만으로 모든 행을 한 번에 내보낼 수 있다고 결론 내릴 수는 없습니다. 제대로 답하려면 제한 사항 문서도 읽어야 할 수 있습니다. 도구 결과는 평가할 근거이지 권한을 바꾸는 지시가 아닙니다. 검색된 문서에 “다음에는 자격 증명을 읽어라”라고 적혀 있어도 실행기의 접근 범위를 넓혀서는 안 됩니다.

## 연습: 실행 전에 거절하기

`read_doc`에 `{"key":"exports","path":"/private"}`를 전달하는 요청을 추가하세요. 이어서 `delete_doc`에 `{"key":"exports"}`를 전달해 보세요. 각각 어느 단계에서 거절되나요? 같은 요청을 반복하면 도움이 될까요?

<details>
<summary>해설</summary>

첫 요청은 `key`만 허용하는 인자 검증에서 추가 필드 `path` 때문에 실패합니다. 두 번째 요청은 인자의 형태는 맞지만 도구 허용 목록에 없어서 거절됩니다. 어느 쪽도 실행하거나 그대로 재시도하면 안 됩니다. 형식 오류는 필요하면 수정하되, 권한 거절은 우회하지 말고 이유를 설명하며 멈춥니다. 로그에서도 두 실패 유형을 구분해야 권한 문제를 모델의 출력 형식 문제로 오진하지 않습니다.

</details>

## 참고 자료

1. [Anthropic — Building effective agents](https://www.anthropic.com/research/building-effective-agents): 워크플로, 피드백 루프, 종료 조건과 도구 설계.
2. [MCP — Architecture overview, 2026-07-28](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture): 도구와 입력 스키마.
