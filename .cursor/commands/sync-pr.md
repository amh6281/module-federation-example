---
description: Create a pull request for the current branch or update the existing pull request body from the latest pushed commits.
allowed-tools: Bash(git *), Bash(gh *), Bash(jq *), Bash(sed *), Bash(awk *), Bash(rg *), Bash(brew install gh)
---

# Sync Pull Request

순서: `상태 확인 → 이슈 번호 추출 → push 상태 확인 → 기존 PR 확인 → PR 제목 생성 → PR 본문 생성 → PR 생성 또는 업데이트 → 후처리`

이 커맨드는 **커밋을 만들지 않습니다**. 필요한 경우 먼저 `/commit`으로 커밋과 push를 완료한 뒤 사용합니다.

## 작업 원칙

- detached HEAD 또는 merge conflict 상태이면 즉시 중단
- base 브랜치는 `develop`
- 현재 브랜치의 최신 push 상태를 기준으로 PR을 동기화
- 열린 PR이 없으면 새 PR 생성
- 열린 PR이 있으면 최신 커밋 내용을 반영해 기존 PR 본문을 업데이트
- 기존 PR이 있을 때는 제목은 유지하고 본문만 업데이트
- PR 본문은 `.github/pull_request_template.md`를 우선 사용
- 커맨드 실행 시 자연어로 PR 제목 직접 지정 가능
  - ex) `/sync-pr PR 제목은 버튼 상태 개선`

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
4. Jira URL: `https://jira.mailplug.co.kr/browse/<ISSUE>`

예: `feature/ABC-123` → `ABC-123` / `bugfix/build` → `build`

## 3. Push 상태 확인

현재 브랜치가 원격과 동기화되어 있는지 먼저 확인합니다.

!`git rev-list --left-right --count @{u}...HEAD 2>/dev/null || echo "(no upstream)"`

- upstream이 없으면 PR 동기화 전에 먼저 push 필요 → 중단
- ahead 커밋이 있으면 최신 커밋이 아직 원격에 없으므로 `/commit` 또는 `git push` 안내 후 중단
- sync 상태이거나 원격에 반영된 커밋 기준으로만 PR을 생성/업데이트

## 4. 기존 PR 확인

현재 브랜치 기준 열린 PR 확인:

!`gh pr list --state open --head "$(git branch --show-current)" --json number,title,url,body,baseRefName --jq '.[0] // empty'`

- 결과가 없으면 새 PR 생성
- 결과가 있으면 해당 PR을 업데이트

## 5. PR 제목 생성

PR이 없을 때만 제목을 생성합니다.

!`git log --format=%s origin/develop..HEAD`

대상 커밋이 비어 있으면:

!`git log --format=%s -20`

**PR 제목 생성 규칙:**

- 사용자가 자연어로 PR 제목을 지정했으면 그 값을 최우선으로 사용
- 커밋 1개: 해당 커밋 제목을 그대로 PR 제목으로 사용
- 커밋 2개 이상: 각 커밋 제목에서 summary 추출 후 합침, Type은 모두 같으면 그대로 아니면 `Chore`
- 최대 50자, 마침표·특수기호 제거
- 비어 있으면 기본값 `Chore(<ISSUE>): 작업 반영`

## 6. PR 본문 생성

최신 push 완료된 커밋 내용을 바탕으로 PR 본문을 생성합니다.

!`git log --format=%s%n%b origin/develop..HEAD`

대상 커밋이 비어 있으면:

!`git log --format=%s%n%b -20`

`.github/pull_request_template.md` 있으면:

1. 이슈 번호 placeholder → 현재 이슈 번호로 치환
2. Jira URL placeholder → 실제 URL로 치환
3. `Summary`: 변경 배경 / 핵심 변경사항 / 기대 효과 순서로 한국어 bullet 작성
4. 최신 커밋들의 요지를 반영해 파일명 나열 없이 리뷰 포인트 중심으로 정리
5. `Checklist`: 실제 작업 성격에 맞는 항목만 `[x]` 체크

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

- 변경 배경
- 핵심 변경사항
- 기대 효과
```

## 7. PR 생성 또는 업데이트

PR 본문은 직접 문자열로 넘기지 말고 임시 파일로 저장해서 사용합니다.

열린 PR이 없으면:

!`gh pr create --base develop --title "<PR_TITLE>" --body-file "<PR_BODY_FILE>"`

열린 PR이 있으면 1차 시도:

!`gh pr edit <PR_NUMBER> --body-file "<PR_BODY_FILE>"`

GraphQL 경고가 있거나 본문 반영이 확인되지 않으면 fallback:

1. 저장소 정보 확인

!`gh repo view --json nameWithOwner --jq .nameWithOwner`

2. REST API로 본문 직접 업데이트

!`gh api repos/<OWNER>/<REPO>/pulls/<PR_NUMBER> --method PATCH --field body@"<PR_BODY_FILE>"`

3. 업데이트 후 본문 검증

!`gh pr view <PR_NUMBER> --json body --jq .body`

기존 PR이 있을 때는 제목은 유지하고 본문만 최신 커밋 기준으로 업데이트합니다.

## 8. 후처리

!`gh api user --jq .login` ← 현재 사용자 확인
!`gh repo view --json nameWithOwner --jq .nameWithOwner` ← 저장소 정보 확인

1. `cursor-generated` 라벨 존재 확인

!`gh api repos/<OWNER>/<REPO>/labels/cursor-generated`

2. 없으면 라벨 생성

!`gh api repos/<OWNER>/<REPO>/labels --method POST --field name='cursor-generated' --field color='0e8a16' --field description='Generated or updated via Cursor command'`

3. PR에 라벨 추가

!`gh api repos/<OWNER>/<REPO>/issues/<PR_NUMBER>/labels --method POST --raw-field labels[]='cursor-generated'`

4. 현재 사용자 assignee 추가

!`gh api repos/<OWNER>/<REPO>/issues/<PR_NUMBER>/assignees --method POST --raw-field assignees[]='<LOGIN>'`

5. `.github/CODEOWNERS`가 있을 때만 reviewer 추출 후 추가

!`test -f .github/CODEOWNERS && sed -n '1,200p' .github/CODEOWNERS`

reviewer 추가 예:

!`gh api repos/<OWNER>/<REPO>/pulls/<PR_NUMBER>/requested_reviewers --method POST --raw-field reviewers[]='<REVIEWER>'`

규칙:

- 라벨 생성이 이미 되어 있으면 에러로 취급하지 않고 계속 진행
- assignee 추가는 `issues` API를 사용
- reviewer는 `.github/CODEOWNERS`가 없으면 건너뜀
- reviewer 추가 실패는 전체 실패로 보지 않고 유지

## 9. 결과 출력

- Action: `created` 또는 `updated`
- Branch
- PR URL
- PR Number
- PR Title
- PR 본문 업데이트 여부

## 실패 처리

| 시점               | 처리                                      |
| ------------------ | ----------------------------------------- |
| 시작 전            | 현재 상태 설명 후 중단                    |
| upstream 없음      | 먼저 push 필요 안내 후 중단               |
| ahead 커밋 존재    | 먼저 push 필요 안내 후 중단               |
| PR 생성 실패       | 현재 브랜치 + 마지막 커밋 제목 안내       |
| PR 업데이트 실패   | 기존 PR 번호/URL + 실패 원인 안내         |
| 본문 검증 실패     | API 재시도 여부와 마지막 확인 결과 안내   |
| 라벨/assignee 실패 | 어떤 후처리가 실패했는지 구체적으로 안내  |

`git reset --hard` 등 파괴적 복구는 사용자 명시 요청 없이 수행하지 않음
