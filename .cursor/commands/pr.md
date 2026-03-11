---
description: Analyze git changes, generate a commit and pull request following the team commit convention, and create or update the PR automatically.
---

# Automatic Pull Request Creation

## Important Note (Cursor Security)

Cursor may require a manual **Run** approval for commands that modify the repository or access the network (e.g. `git push`, `gh pr create`).  
This command will:

- Generate the commit title and PR body
- Execute git and GitHub CLI commands automatically (may require approval)

---

# Step 1 — Validate Changes

Before doing anything, verify that there are changes to commit.

Run:

git diff --quiet && git diff --staged --quiet

If both return success, stop and output:

No changes detected. Nothing to commit.

---

# Step 2 — Analyze Changes

Analyze the git diff to determine:

- What files changed
- What functionality changed
- The most appropriate commit type

---

# Step 3 — Extract Issue Number

Extract the issue number from the current branch name.

Examples:

feature/TK-1325-card-delete  
fix/TK-210-login-error

Issue number = TK-1325

Rules:

- Issue number **must exist**
- If missing, stop and output:

Branch name must include an issue number (example TK-1325)

---

# Step 4 — Determine Commit Type

Select the most appropriate type.

Allowed types:

Feat: 새로운 기능 추가  
Fix: 버그 수정 또는 typo  
Refactor: 리팩토링 코드 구조 개선 기능 변경 없음  
Style: CSS 등 사용자 UI 디자인 변경  
Comment: 주석 추가 또는 변경  
Test: 테스트 코드 추가 수정 삭제  
Chore: 빌드 설정 패키지 assets 변경  
Init: 프로젝트 초기 생성  
Rename: 파일 또는 폴더 이름 변경  
Remove: 파일 삭제 작업

Type selection priority:

1. New feature → Feat
2. Bug fix → Fix
3. Code restructuring only → Refactor
4. UI appearance change → Style
5. Comments only → Comment
6. Tests only → Test
7. Config / tooling change → Chore
8. File rename → Rename
9. File deletion → Remove

---

# Step 5 — Generate Commit Title

Format:

<Type>(<IssueNumber>): <한글 요약>

Rules:

- 최대 **50자**
- **마침표 사용 금지**
- **특수문자 사용 금지**
- **개조식 구문**
- **한글 작성**
- commit message = PR title

Forbidden characters:

. , ! ? ; : / \ @ # $ % ^ & \* [ ]

If detected, regenerate the title.

If length exceeds 50 characters, shorten the summary.

Example titles:

Feat(TK-1325): 카드 삭제 버튼 추가  
Fix(TK-210): 로그인 토큰 갱신 오류 수정  
Refactor(TK-98): Zustand store 구조 정리  
Chore(TK-450): Cursor rules skills 구조 추가

---

# Step 6 — Load PR Template

Use `.github/pull_request_template.md`.

Rules:

- Keep the same section layout
- Fill values using diff analysis
- Insert the extracted issue number

If the template does not exist, fallback to:

## Summary

## Changes

---

# Step 7 — Populate Checklist

Check exactly one item in the template checklist.

Mapping:

Feat → 새로운 기능 추가  
Fix → 버그 수정  
Style → CSS 등 사용자 UI 디자인 변경  
Refactor → 코드 리팩토링  
Comment → 주석 추가 및 수정  
Test → 테스트 추가, 테스트 리팩토링  
Chore → 빌드 부분 혹은 패키지 매니저 수정  
Rename → 파일 혹은 폴더명 수정  
Remove → 파일 혹은 폴더 삭제

---

# Step 8 — Run Quality Checks

Before committing, run:

npm run lint
npm run type-check

If either fails, stop and display the error.

---

# Step 9 — Commit Changes

Run:

git add -A
git commit -m "<PR title>"

---

# Step 10 — Push Branch

Run:

git push -u origin HEAD

---

# Step 11 — Create or Update PR

Run:

BRANCH=$(git branch --show-current)

EXISTING_PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number // empty')

if [ -n "$EXISTING_PR_NUMBER" ]; then
gh pr edit "$EXISTING_PR_NUMBER" --title "<PR title>" --body "<PR body>"
gh pr view "$EXISTING_PR_NUMBER" --json url --jq .url
else
gh pr create --title "<PR title>" --body "<PR body>"
fi

---

# Step 12 — Add Labels Automatically

Add label based on commit type.

Mapping:

Feat → feature  
Fix → bug  
Refactor → refactor  
Style → ui  
Comment → documentation  
Test → test  
Chore → chore  
Rename → refactor  
Remove → cleanup

Run:

gh pr edit "$EXISTING_PR_NUMBER" --add-label "<label>"

---

# Step 13 — Output Result

Print:

PR Title:
<PR title>

PR URL:
<generated url>
