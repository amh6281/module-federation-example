---
description: Generate commit and create a new pull request following the team convention.
---

# Create Pull Request

```bash
set -euo pipefail

BASE_BRANCH="develop"
DEFAULT_SUMMARY="작업 반영"
CURSOR_LABEL="cursor-generated"

# 1) 브랜치 / 이슈 번호
BRANCH_NAME=$(git branch --show-current)

# 기본값: 브랜치 마지막 segment (feature/test → test)
ISSUE_NUMBER="${BRANCH_NAME##*/}"

# 브랜치에 Jira 티켓 패턴이 있으면 우선 사용
TICKET_KEY=$(printf '%s\n' "$BRANCH_NAME" | rg -o "[A-Z]+-[0-9]+" | head -n1 || true)
if [ -n "$TICKET_KEY" ]; then
  ISSUE_NUMBER="$TICKET_KEY"
fi

# Jira URL 생성 (유효한 티켓일 때만)
if printf '%s\n' "$ISSUE_NUMBER" | rg -q "^[A-Z]+-[0-9]+$"; then
  JIRA_ISSUE_URL="https://jira.mailplug.co.kr/browse/${ISSUE_NUMBER}"
else
  JIRA_ISSUE_URL=""
fi

# 2) Git 상태
HAS_DIFF=false
HAS_UPSTREAM=false
HAS_UNPUSHED_COMMITS=false
DIFF_FILES=$(git diff --name-only)

if [ -n "$DIFF_FILES" ] || ! git diff --cached --quiet; then
  HAS_DIFF=true
fi

if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
  HAS_UPSTREAM=true
fi

if [ "$HAS_UPSTREAM" = true ]; then
  read -r BEHIND AHEAD < <(git rev-list --left-right --count @{u}...HEAD)
  if [ "${AHEAD:-0}" -gt 0 ]; then
    HAS_UNPUSHED_COMMITS=true
  fi
else
  HAS_UNPUSHED_COMMITS=true
fi

# 3) Commit Type 분석
detect_commit_type() {
  local files="$1"
  local type="Chore"

  if printf "%s\n" "$files" | rg -q "test|tests|spec"; then
    type="Test"
  elif printf "%s\n" "$files" | rg -q "\\.css|\\.scss|style"; then
    type="Style"
  elif printf "%s\n" "$files" | rg -q "\\.md|docs"; then
    type="Comment"
  elif printf "%s\n" "$files" | rg -q "package.json|lock|Dockerfile|workflow"; then
    type="Chore"
  elif printf "%s\n" "$files" | rg -q "src|app|components|pages|hooks"; then
    type="Refactor"
  fi

  echo "$type"
}

# 4) Commit / PR Title 생성
if [ "$HAS_DIFF" = true ]; then
  COMMIT_TYPE=$(detect_commit_type "$DIFF_FILES")
  SUMMARY_TEXT="$(
    printf "%s\n" "$DIFF_FILES" \
      | head -n 5 \
      | tr '\n' ' ' \
      | sed 's/[[:punct:]]//g' \
      | sed 's/[[:space:]]\+/ /g' \
      | cut -c1-40
  )"
  [ -z "$SUMMARY_TEXT" ] && SUMMARY_TEXT="$DEFAULT_SUMMARY"
else
  LAST_COMMIT_TITLE=$(git log -1 --pretty=%s || true)
  COMMIT_TYPE="Chore"
  SUMMARY_TEXT="$DEFAULT_SUMMARY"

  if [[ "$LAST_COMMIT_TITLE" =~ ^([A-Za-z]+)\(([A-Z]+-[0-9]+)\):[[:space:]]*(.*)$ ]]; then
    if [ "${BASH_REMATCH[2]}" = "$ISSUE_NUMBER" ]; then
      COMMIT_TYPE="${BASH_REMATCH[1]}"
      SUMMARY_TEXT="${BASH_REMATCH[3]}"
    fi
  fi
fi

PR_TITLE="${COMMIT_TYPE}(${ISSUE_NUMBER}): ${SUMMARY_TEXT}"

# 5) Commit
if [ "$HAS_DIFF" = true ]; then
  npm run lint
  npm run type-check

  git add -A
  git commit -m "$PR_TITLE"
  HAS_UNPUSHED_COMMITS=true
fi

# 6) Push
if [ "$HAS_UNPUSHED_COMMITS" = true ]; then
  git push -u origin HEAD
fi

# 7) PR Body 생성
if [ -f ".github/pull_request_template.md" ]; then
  PR_BODY=$(
    cat .github/pull_request_template.md \
      | sed "s#<!---- 이슈 번호 --> RS-#${ISSUE_NUMBER}#g" \
      | sed "s#<!---- JIRA 이슈 링크 -->#${JIRA_ISSUE_URL}#g"
  )
else
  PR_BODY=$'## Summary\n\n- 작업 요약\n\n## Changes\n\n- 변경사항 반영'
fi

# 8) 기존 PR 확인
PR_NUMBER=$(gh pr list --state open --head "$BRANCH_NAME" --json number --jq '.[0].number // empty')

if [ -n "$PR_NUMBER" ]; then
  PR_URL=$(gh pr view "$PR_NUMBER" --json url --jq .url)
  echo "이미 열린 PR이 있습니다."
  echo "PR URL: $PR_URL"
  echo "PR Title: $PR_TITLE"
  exit 0
fi

# 9) PR 생성
PR_JSON=$(gh pr create \
  --base "$BASE_BRANCH" \
  --title "$PR_TITLE" \
  --body "$PR_BODY" \
  --json number,url)
PR_NUMBER=$(printf "%s" "$PR_JSON" | jq -r '.number')
PR_URL=$(printf "%s" "$PR_JSON" | jq -r '.url')

# 10) Label + Assignee + Reviewer
CURRENT_ASSIGNEE=$(gh api user --jq .login)
REPO_OWNER=$(gh repo view --json owner --jq '.owner.login')
REPO_NAME=$(gh repo view --json name --jq '.name')

if ! gh label view "$CURSOR_LABEL" >/dev/null 2>&1; then
  gh label create "$CURSOR_LABEL" \
    --color 0e8a16 \
    --description "Created by cursor command" >/dev/null 2>&1 || true
fi

gh api "repos/$REPO_OWNER/$REPO_NAME/issues/$PR_NUMBER/labels" \
  --method POST \
  --input - <<< "{\"labels\":[\"$CURSOR_LABEL\"]}" || true

gh api "repos/$REPO_OWNER/$REPO_NAME/issues/$PR_NUMBER/assignees" \
  --method POST \
  --input - <<< "{\"assignees\":[\"$CURRENT_ASSIGNEE\"]}" || true

# REVIEWER_ARGS=()

# while IFS= read -r owner; do
#   [ -z "$owner" ] && continue
#   owner="${owner#\@}"
#   if [ "$owner" = "$CURRENT_ASSIGNEE" ]; then
#     continue
#   fi
#   REVIEWER_ARGS+=("--add-reviewer" "$owner")
# done < <(
#   awk '
#     $1 ~ /^#/ || NF < 2 { next }
#     {
#       for (i = 2; i <= NF; i++) {
#         sub(/#.*/, "", $i)
#         if ($i != "" && $i ~ /^@/) print $i
#       }
#     }
#   ' .github/CODEOWNERS | sort -u
# )

# if [ ${#REVIEWER_ARGS[@]} -gt 0 ]; then
#   gh pr edit "$PR_NUMBER" "${REVIEWER_ARGS[@]}" || true
# fi

# 결과 출력
echo ""
echo "PR Created"
echo "PR Title: $PR_TITLE"
echo "PR URL: $PR_URL"
echo "PR Type: $COMMIT_TYPE"
```
