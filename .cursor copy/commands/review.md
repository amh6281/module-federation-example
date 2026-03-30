---
description: Review an open pull request and leave inline GitHub review comments on diff lines when needed.
allowed-tools: Bash(git *), Bash(gh *), Bash(jq *), Bash(sed *), Bash(awk *), Bash(rg *), Bash(brew install gh)
---

# Review Pull Request

> 이 커맨드는 PR을 생성·수정하지 않는다. 열려 있는 PR의 diff를 검토하고, GitHub PR diff의 `+` 버튼으로 다는 것과 같은 **라인 단위 review comment** 를 남기는 용도다.

## 작업 원칙

- assignee, PR 작성자, reviewer 지정 여부와 무관하게 **open 상태 PR** 이면 리뷰 대상이 될 수 있다
- 사용자가 PR 번호나 URL을 명시하면 그것을 우선 사용한다
- PR 번호/URL이 명시되면 현재 브랜치와 무관하게 진행한다
- 사용자가 지정하지 않으면 **현재 브랜치를 head로 하는 열린 PR 1건** 을 대상으로 한다
- 리뷰 범위는 대상 PR의 **base 대비 diff** 로 한정한다
- 리뷰는 **bug, regression, 누락된 검증, 위험한 설계** 중심으로 진행한다
- 일반 conversation comment보다 **코드 라인에 붙는 inline review comment** 를 우선한다
- 문제가 없으면 억지로 코멘트를 만들지 않는다
- 승인(`APPROVE`)이나 변경요청(`REQUEST_CHANGES`)은 자동으로 하지 않는다. 기본은 **`COMMENT` review 제출** 이다

---

## 실행 전 중단 조건

아래 상태 중 하나라도 해당하면 이유를 설명하고 즉시 멈춘다.

| 상태              | 판단 기준                                                 | 안내 메시지                            |
| ----------------- | --------------------------------------------------------- | -------------------------------------- |
| detached HEAD     | PR 번호/URL이 명시되지 않았고 현재 브랜치명이 비어 있음   | 브랜치 체크아웃 또는 PR 지정 후 재실행 |
| 리뷰 대상 PR 없음 | 지정된 PR이 없고 현재 브랜치 기준 open PR도 없음          | review 대상 PR 없음                    |
| 대상 PR 복수 매칭 | 사용자가 지정하지 않았는데 현재 브랜치 기준 PR이 2개 이상 | PR 번호 또는 URL을 지정 후 재실행      |
| diff 조회 불가    | PR files 또는 diff 조회 실패                              | GitHub 인증/권한 확인 후 재실행        |
| line 매핑 불가    | 이슈는 있으나 정확한 diff line 계산이 불가능              | 파일/라인 확인 가능한 상태에서 재실행  |

---

## 1. 컨텍스트 파악

아래 항목을 모두 확인한다.

| 항목                   | 파악 방법                                         |
| ---------------------- | ------------------------------------------------- |
| 현재 브랜치명          | PR 미지정 시 git에서 확인                         |
| 리뷰 대상 PR           | 사용자 지정 PR 또는 현재 브랜치 기준 open PR 확인 |
| PR title / URL         | 대상 PR 메타데이터 확인                           |
| base / head branch     | 대상 PR 메타데이터 확인                           |
| PR author              | 대상 PR 메타데이터 확인                           |
| latest review decision | 기존 review 상태 확인                             |
| 변경 파일 목록         | PR 기준 changed files 와 상태 확인                |
| 전체 diff              | PR diff 확인                                      |
| 기존 review comments   | 이미 같은 지적이 있는지 확인                      |
| 기존 review threads    | unresolved 또는 repeated comment 여부 확인        |
| HEAD SHA               | review comment 생성 시 사용할 최신 commit 확인    |

리뷰 대상 PR은 우선순위대로 하나를 선택한다.

1. 사용자가 자연어로 PR 번호 또는 URL을 직접 지정한 경우 → 해당 PR
2. 현재 브랜치를 head로 하는 open PR이 1개인 경우 → 해당 PR
3. 그 외 → 이유를 설명하고 중단

확인 커맨드 예시:

```
git branch --show-current
gh pr list --state open --head "$(git branch --show-current)" --json number,title,url,author,baseRefName,headRefName,reviewDecision --jq '.[0] // empty'
gh pr view <PR_NUMBER> --json number,title,url,author,baseRefName,headRefName,reviewDecision,commits
gh pr diff <PR_NUMBER>
gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments
gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/reviews
```

리뷰 근거는 반드시 **현재 PR diff** 에서 찾는다. base 브랜치 바깥 맥락이 필요하면 관련 파일을 추가로 읽되, 코멘트는 diff에 드러난 문제에 한정한다.

---

## 2. 리뷰 기준

아래 우선순위 티어 순서대로 **각 항목을 빠짐없이** 검토한다. 낮은 티어 항목은 높은 티어 이슈가 없을 때만 코멘트한다.
단, **상위 티어 이슈가 없더라도 Low가 구체적이고 diff에서 재현 가능하면 코멘트를 남긴다.**
즉 `Critical–Medium 없음 + Low 있음` 은 `Type: none` 이 아니라 **`Type: comment` 대상** 이다.

### Critical — 즉시 차단 수준

- **런타임 크래시**: null/undefined 역참조, 배열 범위 초과, 잘못된 타입 연산
- **보안 취약점**: SQL/Command injection, XSS(사용자 입력이 DOM에 직접 삽입), 민감정보(토큰·비밀번호·PII) 로그 출력 또는 클라이언트 노출, 인증·인가 우회
- **데이터 손실**: 덮어쓰기, 삭제 후 복구 불가, 트랜잭션 누락

### High — 높은 위험

- **기존 동작 회귀**: 변경 전 정상이던 경로가 깨질 가능성
- **동시성·비동기 문제**: race condition, 공유 상태 비원자적 수정, `catch` 없는 `.then` 또는 unhandled rejection, 불필요한 직렬 await로 인한 성능 저하
- **무한 루프 또는 재귀 탈출 조건 누락**
- **중복 호출·중복 실행**: 동일 API 다중 호출, 이벤트 리스너 누적 등록

### Medium — 중간 위험

- **예외 처리 누락**: 외부 I/O(API, DB, 파일)에서 에러를 전파하지 않거나 무시
- **타입·계약 불일치**: 함수 시그니처와 실제 전달값 불일치, 암묵적 타입 강제 변환
- **사이드이펙트 범위 초과**: 함수가 의도하지 않은 전역 상태·외부 리소스를 변경
- **의존성 문제**: 순환 의존, 사용하지 않는 import, 버전 고정 누락

### Low — 낮은 위험 (Critical–Medium 이슈 없을 때만)

- **테스트 누락**: 변경된 로직에 대한 단위/통합 테스트가 전혀 없는 경우
- **검증 부족**: 입력값 범위·형식 검증 없이 바로 사용
- **성능 급락**: O(n²) 이상 알고리즘, 반복문 내 무거운 I/O
- **가독성·스타일**: 명백히 혼란을 유발하는 경우에 한정

Low 코멘트는 아래 조건을 모두 만족할 때 남긴다.

- 현재 diff의 변경과 직접 연결된다
- 취향 차이가 아니라 **유지보수성, 검증 공백, 성능 저하 가능성** 중 하나로 설명 가능하다
- 왜 문제가 되는지 한두 문장으로 구체화할 수 있다

### 코멘트를 남기지 않는 경우

- 단순 취향 차이 (포매팅 스타일, 변수명 선호 등)
- 현재 diff만으로 확정할 수 없는 추측
- 팀 컨벤션 근거 없이 애매한 네이밍 선호
- 이미 다른 리뷰 코멘트에서 동일하게 지적된 내용
- 리뷰어가 바로 고칠 수 없는 넓은 리팩터링 제안

---

## 3. 코멘트 작성 규칙

라인 코멘트는 반드시 **구체적이고 재현 가능한 문제** 여야 한다.

- 가능한 한 해당 코드 줄에 직접 연결한다
- 파일 전체 총평이 아니라 **왜 문제가 되는지** 를 짧고 명확하게 설명한다
- **언제 깨지는지 / 어떤 입력에서 위험한지 / 무엇이 누락됐는지** 를 반드시 포함한다
- Low라면 **어떤 유지보수 비용, 검증 공백, 성능 문제** 가 생기는지 구체적으로 적는다
- 해결책은 강요하지 말고, 필요하면 한 줄 정도로 제안한다
- 한국어로 일관되게 작성한다
- 한 코멘트에는 한 가지 이슈만 담는다
- 칭찬성 코멘트나 스타일 선호는 기본적으로 남기지 않는다
- 심각도 레이블을 앞에 붙인다: `[Critical]`, `[High]`, `[Medium]`, `[Low]`

좋은 예:

```text
[Critical] `data`가 undefined인 첫 렌더에서 아래 `.map()` 호출 시 런타임 에러가 발생합니다.
로딩 전 초기값(`[]`) 또는 옵셔널 체이닝(`data?.map(...)`)으로 가드가 필요해 보입니다.
```

```text
[High] 이 함수는 `catch` 없이 `.then`만 체이닝하고 있어 unhandled rejection이 발생할 수 있습니다.
`.catch(err => ...)` 또는 `try/await` 블록으로 감싸는 게 안전합니다.
```

피해야 할 예:

```text
이거 별로예요. 수정 부탁드립니다.
```

---

## 4. 리뷰 계획 검증 (제출 전 승인)

이슈 분석이 끝나면 **GitHub에 실제로 올리기 전에** 아래 형식으로 계획을 사용자에게 먼저 보여주고 승인을 기다린다.

```
Review plan — #<PR_NUMBER>

  1. [Critical] <파일명>:<라인번호> — <이슈 한 줄 요약>
  2. [High]     <파일명>:<라인번호> — <이슈 한 줄 요약>
  3. [Medium]   <파일명>:<라인번호> — <이슈 한 줄 요약>
  4. [Low]      <파일명>:<라인번호> — <이슈 한 줄 요약>

Submit? y / n / 번호 지정 (예: "2, 3만")
```

사용자 응답에 따라 동작한다.

| 응답                       | 동작                                     |
| -------------------------- | ---------------------------------------- |
| `y` 또는 "전부 올려"       | 전체 제출                                |
| 번호 지정 ("2, 3만" 등)    | 해당 항목만 제출, 나머지 생략            |
| `n` 또는 "취소"            | 제출 없이 종료                           |
| 특정 코멘트 내용 수정 요청 | 수정 후 계획을 다시 보여주고 재승인 대기 |

- 승인 없이 GitHub에 코멘트를 제출하지 않는다
- 이슈가 없을 때는 계획 단계 없이 바로 "문제 발견 없음"을 출력하고 종료한다

---

## 5. Inline Review Comment 생성

이슈가 확인되면 GitHub PR diff line에 붙는 **inline review comment** 로 남긴다.

여러 줄이 함께 있어야 의미가 생기는 경우, `start_line` + `line` 파라미터로 **멀티라인 review comment** 를 남긴다.
단, diff에서 두 라인 번호를 모두 확정할 수 없으면 단일 라인 코멘트로 대체한다.

코멘트 생성 전 반드시 아래 정보를 확정한다.

- `path`
- `commit_id`
- `side`
- `line` (단일) 또는 `start_line` + `line` (멀티라인)

원칙:

1. **추가된 라인 또는 변경된 라인에 직접 매핑 가능할 때만** inline comment를 남긴다
2. 조건문, 함수 호출, JSX 블록처럼 **여러 줄을 함께 봐야 문제가 설명되는 경우** 멀티라인 코멘트를 사용한다
3. 동일 파일/라인에 이미 같은 취지의 코멘트가 있으면 생략한다
4. 여러 이슈가 있으면 가능한 한 **하나의 review** 안에 `comments` 배열로 묶어 제출한다
5. line 매핑이 불가능하면 파일명과 문맥을 포함한 일반 review comment로 대체한다

기본 제출 방식:

- `gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/reviews` 로 `event=COMMENT` review 생성
- 각 코멘트는 `comments` 배열로 함께 제출

개별 코멘트만 가능할 때:

- `gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments` 사용
- 단, 여러 코멘트를 흩뿌리지 말고 한 번의 review 제출을 우선한다

---

## 6. 코멘트가 없을 때 처리

남길 만한 구체적 이슈를 찾지 못하면 리뷰 코멘트를 생성하지 않는다.
여기서 "구체적 이슈"에는 **Low: 테스트 누락 / 검증 부족 / 성능 문제 / 혼란을 유발하는 가독성 문제** 도 포함된다.
따라서 **Critical–Medium이 없다는 이유만으로 Low 코멘트를 생략하면 안 된다.**

- `LGTM` 같은 짧은 코멘트를 억지로 남기지 않는다
- 승인도 자동으로 하지 않는다
- 사용자는 **모든 티어(Critical–Low)에서 코멘트할 만한 구체적 이슈가 하나도 없을 때만** "문제 발견 없음" 상태를 전달받는다

---

## 7. 최종 응답 규칙

사용자에게는 아래 형식으로 간단히 정리한다.

### 이슈가 있는 경우

```
Reviewed : yes
PR       : <URL>
Number   : #<번호>
Type     : comment
Comments : <제출된 개수>

[Critical] <핵심 이슈 1줄 요약>
[High]     <핵심 이슈 1줄 요약>
[Medium]   <핵심 이슈 1줄 요약>
[Low]      <핵심 이슈 1줄 요약>
```

### 이슈가 없는 경우

```
Reviewed : yes
PR       : <URL>
Number   : #<번호>
Type     : none
Comments : 0
Result   : No actionable issues found.
```

---

## 실패 처리

| 시점               | 처리 방법                                                       |
| ------------------ | --------------------------------------------------------------- |
| 리뷰 대상 PR 없음  | 지정된 PR이 없고 현재 브랜치 기준 open PR도 없다고 안내 후 중단 |
| 대상 PR 복수 매칭  | PR 번호 또는 URL 지정이 필요하다고 안내 후 중단                 |
| diff 조회 실패     | 인증 또는 권한 문제 가능성을 설명하고 중단                      |
| line 매핑 실패     | 발견한 이슈 요약과 inline comment 불가 이유를 함께 출력         |
| 코멘트 등록 실패   | 남기려던 이슈 요약과 실패 원인을 함께 출력                      |
| 애매한 이슈만 있음 | 코멘트 없이 종료하고 확실한 문제를 찾지 못했다고 안내           |
