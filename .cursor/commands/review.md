---
description: Review the currently open pull request and leave GitHub review comments on specific diff lines when needed.
allowed-tools: Bash(git *), Bash(gh *), Bash(jq *), Bash(sed *), Bash(awk *), Bash(rg *), Bash(brew install gh)
---

# Review Pull Request

> 이 커맨드는 PR을 생성·수정하지 않는다. 열려 있는 PR의 diff를 검토하고, 필요한 경우 GitHub PR diff의 `+` 버튼으로 다는 것과 같은 **라인 단위 리뷰 코멘트**를 남기는 용도다.

## 작업 원칙

- assignee, PR 작성자, reviewer 여부와 무관하게 **open 상태 PR** 이 있으면 리뷰를 진행한다
- 리뷰 대상은 **현재 브랜치를 head로 하는 열린 PR 1건** 이다
- 일반 댓글보다 **코드 라인에 붙는 review comment** 를 우선한다
- 칭찬이나 요약보다 **버그, 회귀, 누락된 검증, 위험한 설계** 를 우선 찾는다
- 문제가 없으면 억지로 코멘트를 만들지 않는다
- 승인/변경요청은 자동으로 하지 않는다. 기본은 **코멘트만 남기는 review**

---

## 실행 전 중단 조건

아래 상태 중 하나라도 해당하면 이유를 설명하고 즉시 멈춘다.

| 상태               | 판단 기준                                  | 안내 메시지                              |
| ------------------ | ------------------------------------------ | ---------------------------------------- |
| detached HEAD      | 현재 브랜치명이 비어 있음                  | 브랜치 체크아웃 후 재실행                |
| 열린 PR 없음       | 현재 브랜치를 head로 하는 open PR가 없음   | review 대상 PR 없음                      |
| diff 조회 불가     | PR diff 또는 changed files 조회 실패       | GitHub 인증/권한 확인 후 재실행          |
| 코멘트 위치 불명확 | 리뷰할 문제는 있으나 정확한 diff line 없음 | 파일/라인 확인 가능한 상태에서 다시 실행 |

---

## 1. 컨텍스트 파악

아래 항목을 모두 확인한다.

| 항목             | 파악 방법                                                          |
| ---------------- | ------------------------------------------------------------------ |
| 현재 브랜치명    | git에서 확인                                                       |
| 열린 PR 정보     | 현재 브랜치를 head로 하는 open PR의 number, title, url, base, head |
| PR 작성자        | PR author login 확인                                               |
| 변경 파일 목록   | PR 기준 changed files와 상태 확인                                  |
| 전체 diff        | PR diff 확인                                                       |
| 기존 리뷰 코멘트 | 이미 같은 지적이 있는지 확인                                       |

우선 확인 예시:

!`git branch --show-current`
!`gh pr list --state open --head "$(git branch --show-current)" --json number,title,url,author,baseRefName,headRefName --jq '.[0] // empty'`
!`gh pr diff <PR_NUMBER>`
!`gh api repos/{owner}/{repo}/pulls/<PR_NUMBER>/comments`

---

## 2. 리뷰 기준

다음 우선순위로 검토한다.

1. 런타임 에러 가능성
2. 기존 동작 회귀 가능성
3. 예외 처리 누락
4. 타입/계약 불일치
5. 데이터 손실, 중복 호출, 무한 루프, 성능 급락 가능성
6. 테스트 누락 또는 검증 부족
7. 가독성/스타일 이슈는 위 문제가 없을 때만

아래 항목은 코멘트를 남기지 않는다.

- 단순 취향 차이
- 현재 diff만으로 확정할 수 없는 추측
- 팀 컨벤션 근거 없이 애매한 네이밍 선호
- 이미 다른 리뷰 코멘트에서 동일하게 지적된 내용

---

## 3. 코멘트 작성 규칙

라인 코멘트는 반드시 **구체적이고 재현 가능한 문제** 여야 한다.

- 코멘트는 가능한 한 해당 코드 줄에 직접 연결한다
- 파일 전체 총평이 아니라 **왜 문제가 되는지** 를 짧게 설명한다
- 가능하면 **언제 깨지는지 / 어떤 입력에서 위험한지 / 무엇이 누락됐는지** 를 포함한다
- 해결책은 강요하지 말고, 필요하면 한 줄 정도로 제안한다
- 한국어로 작성한다
- 한 코멘트에는 한 가지 이슈만 담는다

좋은 예:

```text
여기서 `data` 가 `undefined` 인 첫 렌더를 허용하면 아래 `map` 에서 런타임 에러가 날 수 있습니다. 로딩 전 초기값 처리나 가드가 필요해 보여요.
```

피해야 할 예:

```text
이거 별로예요. 수정 부탁드립니다.
```

---

## 4. 리뷰 코멘트 남기기

이슈가 확인되면 GitHub PR의 diff line에 붙는 **review comment** 로 남긴다. 일반 PR conversation comment는 라인 단위로 달 수 없을 때만 사용한다.

우선순위:

1. `gh api` 로 review thread/comment 생성
2. 도구 한계로 line comment가 불가능하면, 파일명과 line 정보를 포함한 일반 review comment

코멘트를 남길 때는 아래 원칙을 따른다.

- 동일 파일/라인에 이미 같은 취지의 코멘트가 있으면 생략
- 확실한 이슈만 남긴다
- 사소한 의견만 있는 경우 코멘트 없이 종료할 수 있다

---

## 5. 최종 응답 규칙

사용자에게는 아래 형식으로 간단히 정리한다.

### 이슈가 있는 경우

```text
Reviewed: yes
PR      : <URL>
Comments: <개수>

- <핵심 이슈 1줄 요약>
- <핵심 이슈 1줄 요약>
```

### 이슈가 없는 경우

```text
Reviewed: yes
PR      : <URL>
Comments: 0
Result  : 남길 만한 구체적 이슈를 찾지 못함
```

---

## 실패 처리

| 시점               | 처리 방법                                             |
| ------------------ | ----------------------------------------------------- |
| 열린 PR 없음       | 현재 브랜치에는 review 대상 PR이 없다고 안내 후 중단  |
| diff 조회 실패     | 인증 또는 권한 문제 가능성을 설명하고 중단            |
| 코멘트 등록 실패   | 남기려던 이슈 요약과 실패 원인을 함께 출력            |
| 애매한 이슈만 있음 | 코멘트 없이 종료하고 확실한 문제를 찾지 못했다고 안내 |
