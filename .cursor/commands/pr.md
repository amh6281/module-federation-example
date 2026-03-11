---
description: Analyze git changes, generate a commit and pull request following the team commit convention, and create or update the PR automatically.
---

# Automatic Pull Request Creation

## Important Note (Cursor Security)

Cursor may require a manual **Run** approval for commands that modify the repository or access the network (ex. `git push`, `gh pr create`).

This command will:

- Analyze changed files
- Generate a commit title and PR body
- Commit and push changes
- Create PR if missing, otherwise update existing PR for the current branch
- Add one type-based label
- Output the final PR URL

## Step 1 — Validate Changes

Check whether there is anything to commit.

Run:

`git diff --quiet && git diff --cached --quiet`

If both commands exit with code `0`, stop and output:

`No changes detected. Nothing to commit.`

## Step 2 — Analyze Changes

Analyze `git diff` to identify:

- Changed files and impacted area
- Functional impact
- Most representative commit type

## Step 3 — Extract Issue Number

Extract issue key from current branch name.

Examples:

- `feature/TK-1325-card-delete`
- `fix/TK-210-login-error`

Preferred result: `TK-1325`

Rules:

- Pattern must match `[A-Z]+-\d+`
- If not found, stop with:

`Branch name must include an issue number (example TK-1325)`

## Step 4 — Determine Commit Type

Use the highest priority match.

Allowed types:

- Feat: 새로운 기능 추가
- Fix: 버그 수정 또는 typo
- Refactor: 리팩토링 코드 구조 개선 기능 변경 없음
- Style: CSS 등 사용자 UI 디자인 변경
- Comment: 주석 추가 또는 변경
- Test: 테스트 코드 추가 수정 삭제
- Chore: 빌드 설정 패키지 assets 변경
- Init: 프로젝트 초기 생성
- Rename: 파일 또는 폴더 이름 변경
- Remove: 파일 삭제 작업

Priority:

1. New feature → Feat
2. Bug fix → Fix
3. Refactor only → Refactor
4. UI change only → Style
5. Comment only → Comment
6. Test only → Test
7. Build/tooling change → Chore
8. File rename → Rename
9. File deletion → Remove

## Step 5 — Generate Commit Title

Format:

`<Type>(<IssueNumber>): <한글 요약>`

Constraints:

- 최대 50자
- 마침표 금지
- 특수문자 금지(`.`, `,`, `!`, `?`, `;`, `:`, `/`, `\\`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `[`, `]`)
- 한글 개조식
- Commit message = PR title
- If invalid, regenerate

Example:

- `Feat(TK-1325): 카드 삭제 버튼 추가`
- `Fix(TK-210): 로그인 토큰 갱신 오류 수정`
- `Refactor(TK-98): Zustand store 구조 정리`
- `Chore(TK-450): Cursor rules skills 구조 추가`

## Step 6 — Generate PR Body

Use `.github/pull_request_template.md` as the source.

Rules:

- Keep section order exactly: `Related Issue`, `Summary`, `Checklist`
- Fill placeholders with analyzed diff results and issue number
- If template file is missing, fallback to:

```md
## Summary

## Changes
```

## Step 7 — Populate Checklist

From the template checklist, check exactly one item matching commit type.

Mapping:

- Feat → 새로운 기능 추가
- Fix → 버그 수정
- Style → CSS 등 사용자 UI 디자인 변경
- Refactor → 코드 리팩토링
- Comment → 주석 추가 및 수정
- Test → 테스트 추가, 테스트 리팩토링
- Chore → 빌드 부분 혹은 패키지 매니저 수정
- Rename → 파일 혹은 폴더명 수정
- Remove → 파일 혹은 폴더 삭제
- Init → 문서 수정

## Step 8 — Run Quality Checks

Before commit:

- `npm run lint`
- `npm run type-check`

If either fails, stop and show the exact failure output.

## Step 9 — Commit Changes

Execute in order:

1. `git add -A`
2. `git commit -m "<PR title>"`

## Step 10 — Push Branch

Execute:

`git push -u origin HEAD`

## Step 11 — Create or Update PR

Use the following sequence:

1. `BRANCH=$(git branch --show-current)`
2. `EXISTING_PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number // empty')`
3. If `EXISTING_PR_NUMBER` exists:
   - `gh pr edit "$EXISTING_PR_NUMBER" --title "<PR title>" --body "<PR body>" --json url --jq .url`
4. If not exists:
   - `gh pr create --title "<PR title>" --body "<PR body>" --json url --jq .url`

Store result in `PR_URL` and keep it for Step 12 and Step 13.

Failure rule: stop immediately if any command fails.

## Step 12 — Add Type Label

## Step 12 — Add Labels

Add labels automatically:

Type label:

- Feat → feature
- Fix → bug
- Refactor → refactor
- Style → ui
- Comment → documentation
- Test → test
- Chore → chore
- Init → init
- Rename → refactor
- Remove → cleanup

Area label (based on file path):

- src/modules/api/\*\* → area:api
- src/components/\*\* → area:ui
- src/store/\*\* → area:store

Size label (based on diff lines):

- 0-50 → size:XS
- 50-200 → size:S
- 200-500 → size:M
- 500+ → size:L

Run:

`gh pr edit "$EXISTING_PR_NUMBER" --add-label "<label>"`

## Step 13 — Output Result

Print:

- `PR Title: <PR title>`
- `PR URL: <PR_URL>`
