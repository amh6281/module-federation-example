---
description: Generate a commit message from staged changes, commit, and confirm before pushing.
allowed-tools: Bash(git *), Bash(sed *), Bash(awk *), Bash(rg *)
---

# Commit Changes

순서: `상태 확인 → 이슈 번호 추출 → staged changes 분석 → 커밋 메시지 생성 → commit → push 여부 확인 → push`

커밋은 **staged changes 기준**으로만 판단합니다. unstaged 변경사항은 커밋 메시지 생성 근거에 포함하지 않습니다.

## 작업 원칙

- detached HEAD 또는 merge conflict 상태이면 즉시 중단
- staged 변경사항이 없으면 중단
- 커밋 메시지는 staged 파일 경로 기준으로 생성
- 커맨드 실행 시 자연어로 커밋 제목 직접 지정 가능
  - ex) `/commit 커밋 제목은 버튼 스타일 정리`
- 커밋 후에는 바로 push 하지 않고, 생성된 `Type` / `Summary` / push 대상을 보여준 뒤 사용자 확인을 받음
- 사용자가 `accept` 또는 `run`으로 확인한 경우에만 push 진행

## 1. 상태 확인

!`git status --short`
!`git branch --show-current` ← 빈 값이면 detached HEAD → 중단
!`git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "(no upstream)"`
!`git log --oneline -5`
!`git diff --name-only --cached`
!`git diff --cached --diff-filter=U` ← 결과 있으면 conflict → 중단

## 2. 이슈 번호 추출

1. 브랜치명에서 `[A-Z]+-\d+` 패턴 우선 추출
2. 없으면 마지막 segment 사용
3. issue가 비어 있으면 `NO-ISSUE` 사용

예: `feature/ABC-123` → `ABC-123` / `bugfix/build` → `build`

## 3. 커밋 메시지 생성

**형식:** `<Type>(<ISSUE>): <Summary>`

**Commit Type 우선순위:**

| 우선순위 | 조건                                                    | Type       |
| -------- | ------------------------------------------------------- | ---------- |
| 1        | 파일 추가만, 초기 생성 성격                             | `Init`     |
| 2        | 파일 삭제만                                             | `Remove`   |
| 3        | 파일/폴더 이동·이름 변경 중심                           | `Rename`   |
| 4        | `test` `tests` `spec` 포함, 비즈니스 로직 변경 없음     | `Test`     |
| 5        | `.css` `.scss` `style` 포함                             | `Style`    |
| 6        | `.md` `docs` 또는 주석 중심                             | `Comment`  |
| 7        | 신규 기능·화면·API 연동                                 | `Feat`     |
| 8        | 버그·예외처리·typo 수정                                 | `Fix`      |
| 9        | `src` `app` `components` `pages` `hooks` 또는 구조 개선 | `Refactor` |
| 10       | `package.json` lock파일 `Dockerfile` `workflow` asset   | `Chore`    |
| 11       | 그 외                                                   | `Chore`    |

**Summary 규칙:**

- 사용자가 자연어로 커밋 제목을 지정했으면 그 값을 최우선으로 사용
- 지정하지 않은 경우 staged 파일 최대 5개 기반, 파일명 나열 말고 무엇을 바꿨는지 문구로
- 최대 50자, 마침표·특수기호 제거, 개조식 구문
- 비어 있으면 기본값 `작업 반영`

예: `Refactor(ABC-123): 타이틀 구조 정리 텍스트 스타일 분리`

## 4. Commit

staged 변경사항만 커밋합니다.

!`git commit -m "<COMMIT_TITLE>"`

## 5. Push 여부 확인

커밋 후 아래 정보를 먼저 정리해서 사용자에게 보여줍니다.

!`git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "(no upstream)"`
!`git log --oneline -1`

확인 시 반드시 아래를 포함합니다.

- 생성된 `Commit Type`
- 생성된 `Commit Summary`
- 최종 커밋 제목
- push 대상 브랜치
- upstream 유무

그리고 아래처럼 확인을 받습니다.

```md
커밋을 생성했습니다.

- Type: <TYPE>
- Summary: <SUMMARY>
- Commit: <COMMIT_TITLE>
- Branch: <BRANCH>
- Upstream: <UPSTREAM 또는 (no upstream)>

이 커밋을 원격에 push 할까요? `accept` 또는 `run`이면 진행합니다.
```

사용자가 `accept` 또는 `run`으로 확인하기 전에는 push 하지 않습니다.

## 6. Push

사용자 확인 후에만 실행:

!`git push -u origin HEAD`

upstream이 이미 있으면 일반 push로 진행:

!`git push`

## 7. 결과 출력

- Commit Title
- Commit SHA
- Push 여부
- Push된 브랜치

## 실패 처리

| 시점              | 처리                         |
| ----------------- | ---------------------------- |
| commit 전         | 현재 상태 설명 후 중단       |
| commit 실패       | 실패 원인 + staged 상태 안내 |
| push 전 사용자 미확인 | push 없이 커밋 결과만 출력 |
| push 실패         | 실패 원인 + 브랜치 상태 안내 |

`git reset --hard` 등 파괴적 복구는 사용자 명시 요청 없이 수행하지 않음
