---
description: Generate PR with branch-based convention, commit automatically, then create/update PR with guaranteed labels.
---

# Automatic Pull Request Creation

Run commands in one pass in this order.

```bash
set -euo pipefail

# 0) Validate changes
if git diff --quiet && git diff --cached --quiet; then
  echo "No changes detected. Nothing to commit."
  exit 0
fi

# 1) Analyze diffs and pick commit type
# - check changed files from `git diff --name-only`
# - choose one type among Feat, Fix, Refactor, Style, Comment, Test, Chore, Init, Rename, Remove
#   by team priority

# 2) Extract issue number from branch
BRANCH_NAME=$(git branch --show-current)
ISSUE_NUMBER=$(echo "$BRANCH_NAME" | rg -o "[A-Z]+-[0-9]+" | head -n 1 || true)
if [ -z "$ISSUE_NUMBER" ]; then
  echo "Branch name must include an issue number (example TK-1325)"
  exit 1
fi

# 3) Generate commit title
# format: <Type>(<IssueNumber>): <한글 요약>
# constraints: <= 50 chars, no sentence ending punctuation, no special chars such as .,!?;:/\@#$%^&*[]

# 4) Run checks before commit
npm run lint
npm run type-check

# 5) Commit
git add -A
git commit -m "<PR title>"

# 6) Push
git push -u origin HEAD

# 7) Build PR body from .github/pull_request_template.md (order: Related Issue -> Summary -> Checklist)
# fallback when template missing:
# ## Summary
# ## Changes

# 8) Create or update PR and keep PR_NUMBER / PR_URL
BRANCH=$(git branch --show-current)
PR_NUMBER=$(gh pr list --state open --head "$BRANCH" --json number --jq '.[0].number // empty')
BASE_BRANCH="develop"

if [ -n "$PR_NUMBER" ]; then
  gh pr edit "$PR_NUMBER" --title "<PR title>" --body "<PR body>" --base "$BASE_BRANCH"
else
  PR_JSON=$(gh pr create --title "<PR title>" --body "<PR body>" --base "$BASE_BRANCH" --json number,url)
  PR_NUMBER=$(echo "$PR_JSON" | jq -r '.number')
fi

PR_URL=$(gh pr view "$PR_NUMBER" --json url --jq .url)

# 9) Labels (must always run after PR_NUMBER is known)
TYPE_LABEL=""
case "<Type>" in
  Feat) TYPE_LABEL="feature" ;;
  Fix) TYPE_LABEL="bug" ;;
  Refactor) TYPE_LABEL="refactor" ;;
  Style) TYPE_LABEL="ui" ;;
  Comment) TYPE_LABEL="documentation" ;;
  Test) TYPE_LABEL="test" ;;
  Chore) TYPE_LABEL="chore" ;;
  Init) TYPE_LABEL="init" ;;
  Rename) TYPE_LABEL="refactor" ;;
  Remove) TYPE_LABEL="cleanup" ;;
  *) TYPE_LABEL="chore" ;;
esac

gh pr edit "$PR_NUMBER" --add-label "$TYPE_LABEL" --add-label "cursor-generated"

# 10) Assign to me
ASSIGNEE_LOGIN=$(gh api user --jq .login)
gh pr edit "$PR_NUMBER" --add-assignee "$ASSIGNEE_LOGIN"

echo "PR Title: <PR title>"
echo "PR URL: $PR_URL"
```

Commit type to checklist mapping:

- Feat -> `새로운 기능 추가`
- Fix -> `버그 수정`
- Style -> `CSS 등 사용자 UI 디자인 변경`
- Refactor -> `코드 리팩토링`
- Comment -> `주석 추가 및 수정`
- Test -> `테스트 추가, 테스트 리팩토링`
- Chore -> `빌드 부분 혹은 패키지 매니저 수정`
- Init -> `문서 수정`
- Rename -> `파일 혹은 폴더명 수정`
- Remove -> `파일 혹은 폴더 삭제`

Type label mapping:

- Feat -> `feature`
- Fix -> `bug`
- Refactor -> `refactor`
- Style -> `ui`
- Comment -> `documentation`
- Test -> `test`
- Chore -> `chore`
- Init -> `init`
- Rename -> `refactor`
- Remove -> `cleanup`
