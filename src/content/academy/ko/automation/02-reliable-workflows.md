---
title: "재시도해도 안전한 워크플로"
description: "재시도 예산과 체크포인트, 중복 방지를 설계하고 정확히 한 번 실행된다는 과장을 피합니다."
order: 2
course: automation
lang: ko
duration: "22분"
---

## 신뢰성은 피해를 늘리지 않고 복구하는 능력

<strong>신뢰할 수 있는 워크플로</strong>는 예상 가능한 실패가 있어도 허용되는 결과에 도달하거나, 운영자가 이해하고 복구할 수 있는 상태에서 멈춥니다. 신뢰성은 “성공할 때까지 무한 반복하기”가 아닙니다. 같은 기사를 여러 번 발행한다면 HTTP 요청이 결국 성공하더라도 신뢰할 수 있는 뉴스 파이프라인이 아닙니다.

<strong>재시도</strong>는 한 번 더 시도하는 것이고, <strong>멱등성</strong>은 같은 논리적 작업을 반복해도 의도한 효과가 추가로 발생하지 않는 성질입니다. <strong>중복 제거</strong>는 반복 입력을 식별하며, <strong>체크포인트</strong>는 완료한 단계를 보존해 처음부터 다시 시작하지 않도록 합니다. 이 개념들은 함께 작동하지만 어느 하나만으로 독립적인 여러 시스템에서 정확히 한 번 실행된다는 보장이 생기지는 않습니다 [1][2].

## 재시도 예산에 상한 두기

일시적인 연결 실패, 일부 서버 오류, 요청 제한은 서비스 계약이 허용할 때 재시도할 수 있습니다. 잘못된 입력, 권한 부족, 안전 검증 거부를 무조건 재시도하지 마세요. 타임아웃도 실패가 확정되었다는 뜻은 아닙니다. 서버가 쓰기를 완료한 뒤 응답만 사라졌을 수 있습니다.

연결 및 요청 타임아웃, 최대 시도 횟수, 전체 마감 시간, 비용 상한을 함께 둡니다. 지수 백오프는 실패할수록 대기 시간을 늘리고, 지터는 클라이언트가 동시에 재시도하지 않도록 대기 시간을 분산합니다 [1]. 예를 들어 총 네 번 시도하고, 재시도 번호가 0부터 2일 때 0초와 `min(8, 2 ** retry_index)`초 사이에서 대기 시간을 무작위로 뽑을 수 있습니다. 각 상한은 1초, 2초, 4초입니다. 이 값이 제한하는 것은 대기 시간이지 통신 시간은 아닙니다. 각 요청의 타임아웃과 전체 작업의 마감 시간이 여전히 필요합니다.

유효한 `Retry-After`는 남은 예산 안에서 따르세요. 그 값이 마감 시간을 넘는다면 무시하고 즉시 재시도하기보다 작업을 연기하거나 실패로 처리합니다. 재시도를 책임지는 계층도 하나로 정하세요. SDK, 워커, 큐가 각각 재시도하면 트래픽과 비용이 곱절로 늘어날 수 있습니다. 단순히 “실패”라고 남기지 말고 시도 횟수와 최종 중단 이유를 기록합니다.

## 로컬 중복 제거를 원자적으로 만들기

표식 파일이 있는지 확인한 다음 만드는 방식은 동시 실행에 안전하지 않습니다. 두 워커 모두 확인을 통과할 수 있기 때문입니다. 데이터베이스의 고유성 제약은 작업 선점을 원자적으로 처리합니다. 다음 오프라인 예제는 임시 디스크의 SQLite를 사용합니다. 원격 발행이 아닌 로컬 상태 관리의 예제입니다.

```python
import sqlite3
from tempfile import TemporaryDirectory
from pathlib import Path

with TemporaryDirectory() as folder:
    path = Path(folder) / "jobs.sqlite"
    db = sqlite3.connect(path)
    db.execute("CREATE TABLE jobs (id TEXT PRIMARY KEY, state TEXT NOT NULL)")
    key = "weekly:2026-11-08:en-ko:v1"
    def claim():
        with db:
            return db.execute(
                "INSERT OR IGNORE INTO jobs VALUES (?, 'pending')", (key,)
            ).rowcount == 1
    assert claim() is True
    assert claim() is False
    with db:
        db.execute("UPDATE jobs SET state='drafted' WHERE id=?", (key,))
    db.close()
    db = sqlite3.connect(path)
    assert db.execute("SELECT state FROM jobs").fetchone() == ("drafted",)
    print("one claim; checkpoint survives reconnect")
    db.close()
```

운영에서는 영속 데이터베이스 경로, 백업, 상태 머신이 필요합니다. 대기, 초안 작성, 승인, 발행 중, 발행 완료, 차단 상태를 구분하세요. 상태와 함께 산출물 해시, 출처 식별자, 발행 대상 ID, 오류도 저장합니다. 멱등성 키는 하나의 의도에 묶어야 합니다. 내용이 달라졌다면 예전 키를 조용히 재사용하지 말고 명시적인 개정으로 처리합니다.

## 원격 쓰기와 로컬 기록 사이의 틈

원격 발행 후 로컬에 완료 상태를 저장하기 전에 프로세스가 죽으면 결과가 불확실해집니다. 로컬 표식만으로는 이 틈을 해결할 수 없습니다. 대상 서비스가 지원하는 멱등성 키를 사용하고 안정적인 식별자로 결과를 다시 읽어 확인하세요 [2]. 둘 다 지원되지 않는다면 재발행 전에 대조 확인이나 사람의 검토가 필요합니다.

워커 소유권 규칙도 필요합니다. 트랜잭션 기반 선점이나, 필요에 따라 만료 및 이전 소유자의 쓰기를 차단하는 펜싱을 갖춘 임대 방식을 사용합니다. 오래된 대기 작업이라는 이유만으로 초기화하면 첫 워커가 아직 발행할 수 있습니다. 체크포인트는 검증된 산출물에서 재개하기 위한 장치이지, 바뀐 초안의 검증을 생략하기 위한 장치가 아닙니다.

## 연습: 응답이 사라졌을 때

<strong>연습:</strong> 발행 요청이 타임아웃으로 끝났고 로컬 상태는 `publishing`입니다. 행을 삭제하고 처음부터 다시 실행할까요?

<details>
<summary>정답</summary>

아닙니다. 의도와 키를 보존하고 대상 서비스를 조회해 결과를 대조합니다. 대상이 멱등성 키를 지원한다면 해당 계약에 따라 같은 키로 재시도합니다. 결과를 안전하게 판단할 수 없다면 검토가 필요한 차단 상태로 둡니다. 행을 삭제하면 증거가 사라지고 중복 발행이 생길 수 있습니다. 자료 수집 재시도와 발행 재시도를 분리해야 단순한 조회 실패가 완료된 쓰기를 반복하지 않습니다.

</details>

## 참고 자료

1. [AWS Builders' Library: 타임아웃, 재시도, 백오프와 지터](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
2. [AWS Builders' Library: 멱등 API로 재시도 안전하게 만들기](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
