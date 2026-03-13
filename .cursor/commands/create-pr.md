---
description: Generate commit and create a new pull request following the team convention.
---

# Create Pull Request

```bash
set -euo pipefail

BASE_BRANCH="develop"
DEFAULT_SUMMARY="작업 반영"
CURSOR_LABEL="cursor-generated"
REVIEWER_TEAM="platform-core"

# 초기 Git 상태
BASE_COMMIT=$(git rev-parse HEAD)
BASE_BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

HAS_NEW_COMMIT=false
HAS_DIFF=false
HAS_UPSTREAM=false
HAS_UNPUSHED_COMMITS=false

# 롤백 유틸리티
rollback_and_exit() {
  local reason="$1"

  echo "❗ 에러: ${reason}"
  echo "롤백: HEAD를 ${BASE_COMMIT}(으)로 되돌립니다."

  if [ "$HAS_NEW_COMMIT" = true ]; then
    git reset --hard "$BASE_COMMIT" || true
  fi

  echo "브랜치로 복귀: ${BASE_BRANCH_NAME}"
  echo "커맨드 실행을 중단합니다."
  exit 1
}

# Commit Type 감지 유틸리티
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

# Commit의 요약 텍스트만 추출
extract_commit_summary() {
  local title="$1"
  local issue_number="$2"

  if [[ "$title" =~ ^([A-Za-z]+)\(([A-Z]+-[0-9]+)\):[[:space:]]*(.*)$ ]]; then
    if [ "${BASH_REMATCH[2]}" = "$issue_number" ] && [ -n "${BASH_REMATCH[3]}" ]; then
      printf "%s" "${BASH_REMATCH[3]}"
      return
    fi
  fi

  printf "%s" "$title"
}

# 커밋들을 조합해 PR 제목용 summary 생성
build_summary_from_commits() {
  local commit_range="$1"
  local issue_number="$2"
  local summaries

  [ -z "$commit_range" ] && return 0

  summaries="$(
    git log --format=%s --reverse "$commit_range" 2>/dev/null \
      | while IFS= read -r title; do
          [ -z "$title" ] && continue
          extract_commit_summary "$title" "$issue_number"
          printf '\n'
        done \
      | awk 'NF && !seen[$0]++' \
      | head -n 3
  )"

  [ -z "$summaries" ] && return 0

  printf "%s" "$summaries" \
    | awk 'BEGIN { first = 1 } NF { if (!first) printf " / "; printf "%s", $0; first = 0 }' \
    | cut -c1-40
}


# 1) 브랜치 / 이슈 정보 감지
BRANCH_NAME=$(git branch --show-current)

# 기본값: 브랜치 마지막 세그먼트 사용 (예: feature/TEST-123 → TEST-123)
ISSUE_NUMBER="${BRANCH_NAME##*/}"

# Jira 티켓 추출
TICKET_KEY=$(printf '%s\n' "$BRANCH_NAME" | rg -o "[A-Z]+-[0-9]+" | head -n1 || true)
if [ -n "$TICKET_KEY" ]; then
  ISSUE_NUMBER="$TICKET_KEY"
fi

# Jira 이슈 링크
if printf '%s\n' "$ISSUE_NUMBER" | rg -q "^[A-Z]+-[0-9]+$"; then
  JIRA_ISSUE_URL="https://jira.mailplug.co.kr/browse/${ISSUE_NUMBER}"
else
  JIRA_ISSUE_URL=""
fi

# 2) Git 상태 확인
DIFF_FILES=$(git diff --name-only HEAD)

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

COMMIT_RANGE=""
if git rev-parse --verify "$BASE_BRANCH" >/dev/null 2>&1; then
  COMMIT_RANGE="${BASE_BRANCH}..HEAD"
elif [ "$HAS_UPSTREAM" = true ]; then
  COMMIT_RANGE="@{u}..HEAD"
fi

# 3) Commit / PR Title 생성
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
  COMMIT_FILES=""
  if [ -n "$COMMIT_RANGE" ]; then
    COMMIT_FILES=$(git diff --name-only "$COMMIT_RANGE")
  fi

  if [ -n "$COMMIT_FILES" ]; then
    COMMIT_TYPE=$(detect_commit_type "$COMMIT_FILES")
  else
    COMMIT_TYPE="Chore"
  fi

  SUMMARY_TEXT=$(build_summary_from_commits "$COMMIT_RANGE" "$ISSUE_NUMBER")

  if [ -z "$SUMMARY_TEXT" ]; then
    LAST_COMMIT_TITLE=$(git log -1 --pretty=%s || true)
    SUMMARY_TEXT="$DEFAULT_SUMMARY"

    if [[ "$LAST_COMMIT_TITLE" =~ ^([A-Za-z]+)\(([A-Z]+-[0-9]+)\):[[:space:]]*(.*)$ ]]; then
      if [ "${BASH_REMATCH[2]}" = "$ISSUE_NUMBER" ]; then
        COMMIT_TYPE="${BASH_REMATCH[1]}"
        SUMMARY_TEXT="${BASH_REMATCH[3]}"
      fi
    fi
  fi
fi

PR_TITLE="${COMMIT_TYPE}(${ISSUE_NUMBER}): ${SUMMARY_TEXT}"

# 4) Commit
if [ "$HAS_DIFF" = true ]; then
  git add -A
  if ! git commit -m "$PR_TITLE"; then
    rollback_and_exit "commit 단계 실패"
  fi
  HAS_UNPUSHED_COMMITS=true
  HAS_NEW_COMMIT=true
fi

# 5) Push
if [ "$HAS_UNPUSHED_COMMITS" = true ]; then
  if ! git push -u origin HEAD; then
    rollback_and_exit "push 단계 실패 (remote 충돌/권한/네트워크 등)"
  fi
fi

# 6) PR Body 생성
if [ -f ".github/pull_request_template.md" ]; then
  PR_BODY=$(
    cat .github/pull_request_template.md \
      | sed "s#<!---- 이슈 번호 --> RS-#${ISSUE_NUMBER}#g" \
      | sed "s#<!---- JIRA 이슈 링크 -->#${JIRA_ISSUE_URL}#g"
  )
else
  PR_BODY=$'## Summary\n\n- 작업 요약\n\n## Changes\n\n- 변경사항 반영'
fi

# 7) 기존 PR 확인
PR_NUMBER=$(gh pr list --state open --head "$BRANCH_NAME" --json number --jq '.[0].number // empty')

if [ -n "$PR_NUMBER" ]; then
  echo "이미 열린 PR이 있습니다."
  echo "PR URL:"
  gh pr view "$PR_NUMBER" --json url --jq .url
  exit 0
fi

# 8) PR 생성
PR_JSON=$(gh pr create \
  --base "$BASE_BRANCH" \
  --title "$PR_TITLE" \
  --body "$PR_BODY" \
  --team-reviewer "$REVIEWER_TEAM" \
  --json number,url)
PR_NUMBER=$(printf "%s" "$PR_JSON" | jq -r '.number')
PR_URL=$(printf "%s" "$PR_JSON" | jq -r '.url')

# 9) Label + Assignee + Reviewer
CURRENT_ASSIGNEE=$(gh api user --jq .login)

if ! gh label view "$CURSOR_LABEL" >/dev/null 2>&1; then
  gh label create "$CURSOR_LABEL" \
    --color 0e8a16 \
    --description "Created by cursor command" >/dev/null 2>&1 || true
fi

gh api repos/$(gh repo view --json nameWithOwner --jq .nameWithOwner)/issues/$PR_NUMBER/labels \
  --method POST \
  --input - <<< "{\"labels\":[\"$CURSOR_LABEL\"]}" || true

gh api repos/$(gh repo view --json nameWithOwner --jq .nameWithOwner)/issues/$PR_NUMBER/assignees \
  --method POST \
  --input - <<< "{\"assignees\":[\"$CURRENT_ASSIGNEE\"]}" || true

REVIEWER_ARGS=()

while IFS= read -r owner; do
  [ -z "$owner" ] && continue
  owner="${owner#\@}"
  if [ "$owner" = "$CURRENT_ASSIGNEE" ]; then
    continue
  fi
  REVIEWER_ARGS+=("--add-reviewer" "$owner")
done < <(
  awk '
    $1 ~ /^#/ || NF < 2 { next }
    {
      for (i = 2; i <= NF; i++) {
        sub(/#.*/, "", $i)
        if ($i != "" && $i ~ /^@/) print $i
      }
    }
  ' .github/CODEOWNERS | sort -u
)

if [ ${#REVIEWER_ARGS[@]} -gt 0 ]; then
  gh pr edit "$PR_NUMBER" "${REVIEWER_ARGS[@]}" || true
fi

# 결과 출력
echo ""
echo "PR Created"
echo "PR Title: $PR_TITLE"
echo "PR URL: $PR_URL"
echo "PR Type: $COMMIT_TYPE"
```
