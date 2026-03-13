---
description: Generate commit and create a new pull request following the team convention.
allowed-tools: Bash(git *), Bash(gh *), Bash(jq *), Bash(sed *), Bash(awk *), Bash(rg *), Bash(brew install gh)
---

# Create Pull Request

순서: `상태 확인 → 기존 PR 확인 → commit → push → PR 생성 → 후처리`

단계별로 확인하면서 진행합니다. 한 번에 실행하지 않습니다.

## 작업 원칙

- base 브랜치: `develop`
- detached HEAD 또는 merge conflict 상태이면 즉시 중단
- 변경사항 있으면 커밋, 미push 커밋 있으면 push
- 기존 PR 있으면 commit/push/PR 생성 없이 URL만 출력 후 종료
- PR 본문: `.github/pull_request_template.md` 우선 사용
- PR 생성 후: `cursor-generated` 라벨 + assignee + CODEOWNERS 기반 reviewer 설정
- 커맨드 실행 시 자연어로 커밋/PR 제목 직접 지정 가능
  - ex) `/create-pr 커밋은 버튼 수정, PR은 버튼 컴포넌트 개선`

## 1. 상태 확인

!`git status --short`
!`git branch --show-current` ← 빈 값이면 detached HEAD → 중단
!`git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "(no upstream)"`
!`git log --oneline -5`
!`git diff --name-only HEAD`
!`git diff --cached --name-only`
!`git diff --name-only --diff-filter=U` ← 결과 있으면 conflict → 중단

## 2. 이슈 번호 추출

1. 브랜치명에서 `[A-Z]+-\d+` 패턴 우선 추출
2. 없으면 마지막 segment 사용
3. Jira URL: `https://jira.mailplug.co.kr/browse/<ISSUE>`

예: `feature/ABC-123` → `ABC-123` / `bugfix/build` → `build`

## 3. 변경사항 및 push 필요 여부

- 변경사항: `git diff --name-only HEAD` 결과 있거나 staged 파일 있으면 해당
- push 필요: upstream 없거나 `git rev-list --left-right --count @{u}...HEAD` ahead ≥ 1

## 4. 커밋 메시지 생성

변경사항이 있을 때만 생성합니다. **변경 파일 경로 기반**으로 결정합니다.

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
- 지정하지 않은 경우 변경 파일 최대 5개 기반, 파일명 나열 말고 무엇을 바꿨는지 문구로
- 최대 50자, 마침표·특수기호 제거, 개조식 구문
- 비어 있으면 기본값 `작업 반영`

예: `Refactor(ABC-123): 타이틀 구조 정리 텍스트 스타일 분리`

## 5. 기존 PR 확인

!`gh pr list --state open --head "$(git branch --show-current)" --json number,url --jq '.[0] // empty'`

결과 있으면 → commit/push/PR 생성 중단, URL 출력 후 종료

## 6. Commit

변경사항 있을 때만:

!`git add -A`
!`git commit -m "<COMMIT_TITLE>"`

## 7. Push

새 커밋 생성했거나, upstream보다 ahead이거나, upstream 없으면:

!`git push -u origin HEAD`

push 실패 시 PR 생성 중단

## 8. PR 제목 생성

push 완료 후 **전체 커밋 목록 기반**으로 PR 제목을 생성합니다.

!`git log --format=%s @{u}..HEAD` ← upstream 있을 때
!`git log --format=%s -20` ← upstream 없을 때

**PR 제목 생성 규칙:**

- 사용자가 자연어로 PR 제목을 지정했으면 그 값을 최우선으로 사용
- 커밋 1개: 해당 커밋 제목을 그대로 PR 제목으로 사용
- 커밋 2개 이상: 각 커밋 제목에서 summary 추출 후 합침, Type은 모두 같으면 그대로 아니면 `Chore`
- 최대 50자, 마침표·특수기호 제거
- 비어 있으면 기본값 `Chore(<ISSUE>): 작업 반영`

예:

- 커밋 1개 → `Refactor(ABC-123): 타이틀 구조 정리`
- 커밋 2개 → `Chore(ABC-123): 타이틀 구조 정리 API 연동`

## 9. PR 본문 생성

`.github/pull_request_template.md` 있으면:

1. 이슈 번호 placeholder → 현재 이슈 번호로 치환
2. Jira URL placeholder → 실제 URL로 치환 (없으면 빈 값 유지)
3. `Summary`: 변경 배경 / 핵심 변경사항 / 기대 효과 순서로 한국어 bullet 작성. 파일명 나열 금지. 리뷰어가 파일 열기 전에 의도를 파악할 수 있는 수준으로 작성
4. `Checklist`: 실제 작업 성격에 맞는 항목만 `[x]` 체크

Checklist 체크 기준:

- 새로운 기능 추가 → `Feat`
- 버그 수정 → `Fix`
- UI/CSS 변경 → `Style`
- 코드 리팩토링 → `Refactor`
- 문서/주석 → `Comment`
- 테스트 → `Test`
- 빌드/패키지 → `Chore`

템플릿 없으면:

```md
## Summary

- 작업 요약

## Changes

- 변경사항 반영
```

## 10. PR 생성

!`gh pr create --base develop --title "<PR_TITLE>" --body "<PR_BODY>"`

PR 번호와 URL 확인

## 11. 후처리

!`gh api user --jq .login` ← 현재 사용자 확인

1. `cursor-generated` 라벨 없으면 생성 후 PR에 추가
2. 현재 사용자 assignee 추가
3. `.github/CODEOWNERS` 있으면 reviewer 추출, assignee 본인 제외 후 추가 (실패해도 유지)

## 12. 결과 출력

- PR Title / PR URL / PR Type / 이슈 번호 / 커밋 생성 여부 / push 여부

## 실패 처리

| 시점                 | 처리                                  |
| -------------------- | ------------------------------------- |
| commit 전            | 현재 상태 설명 후 중단                |
| commit 후 push 전    | 실패 원인 + 브랜치 상태 설명          |
| push 후 PR 생성 실패 | push된 브랜치 + 마지막 커밋 제목 안내 |

`git reset --hard` 등 파괴적 복구는 사용자 명시 요청 없이 수행하지 않음
