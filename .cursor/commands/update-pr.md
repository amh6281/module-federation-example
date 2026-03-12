---
description: Commit additional work and update the existing pull request following the team convention.
---

# Update Pull Request

```bash
set -euo pipefail

BASE_BRANCH="develop"
DEFAULT_SUMMARY="추가 작업 반영"

BRANCH_NAME=$(git branch --show-current)
REPO_NAME_WITH_OWNER=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

detect_commit_type() {
  local files="$1"
  local type="Chore"

  if printf "%s\n" "$files" | grep -qE "test|tests|spec"; then
    type="Test"
  elif printf "%s\n" "$files" | grep -qE "\\.css|\\.scss|style"; then
    type="Style"
  elif printf "%s\n" "$files" | grep -qE "\\.md|docs"; then
    type="Comment"
  elif printf "%s\n" "$files" | grep -qE "package.json|lock|Dockerfile|workflow"; then
    type="Chore"
  elif printf "%s\n" "$files" | grep -qE "src|app|components|pages|hooks"; then
    type="Refactor"
  fi

  echo "$type"
}

# Commit / PR 제목에서 이슈 번호 뒤 summary만 추출
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

# base 브랜치 또는 upstream 기준으로 현재 브랜치의 커밋 범위를 계산한다.
detect_commit_range() {
  if git rev-parse --verify "$BASE_BRANCH" >/dev/null 2>&1; then
    printf "%s" "${BASE_BRANCH}..HEAD"
    return
  fi

  if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
    printf "%s" "@{u}..HEAD"
  fi
}

# 누적 커밋 제목을 조합해 PR 제목용 summary를 만든다.
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

# 누적 커밋 제목을 PR 본문 Summary 섹션용 bullet 목록으로 만든다.
build_body_summary_lines() {
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
      | head -n 8
  )"

  [ -z "$summaries" ] && return 0

  printf "%s" "$summaries" | awk 'NF { printf "- %s\n", $0 }'
}

# 1) 브랜치 / 이슈 정보 감지
ISSUE_NUMBER=$(printf '%s\n' "$BRANCH_NAME" | grep -oE "[A-Z]+-[0-9]+" | head -n1 || true)

if [ -z "$ISSUE_NUMBER" ]; then
  echo "브랜치 이름에 이슈 번호가 필요합니다. 예: TE-11"
  exit 1
fi

# 2) 기존 PR 확인
PR_JSON=$(gh pr list --state open --head "$BRANCH_NAME" --json number,url,title --jq '.[0]')
PR_NUMBER=$(printf "%s" "$PR_JSON" | jq -r '.number // empty')
PR_URL=$(printf "%s" "$PR_JSON" | jq -r '.url // empty')

if [ -z "$PR_NUMBER" ] || [ -z "$PR_URL" ]; then
  echo "열린 PR이 없습니다. 먼저 create-pr를 실행하세요."
  exit 1
fi

# 3) 변경사항 확인
DIFF_FILES=$(git diff --name-only HEAD)
STAGED_FILES=$(git diff --name-only --cached)
ALL_FILES=$(printf "%s\n%s" "$DIFF_FILES" "$STAGED_FILES" | sort -u)

if [ -z "$ALL_FILES" ]; then
  echo "추가 변경사항이 없습니다."
  echo "PR URL: $PR_URL"
  exit 0
fi

# 4) Commit / PR Title 생성
COMMIT_TYPE=$(detect_commit_type "$ALL_FILES")
SUMMARY_TEXT="$(
  printf "%s\n" "$ALL_FILES" \
    | head -n 5 \
    | tr '\n' ' ' \
    | sed 's/[[:punct:]]//g' \
    | sed 's/[[:space:]]\+/ /g' \
    | cut -c1-40
)"
[ -z "$SUMMARY_TEXT" ] && SUMMARY_TEXT="$DEFAULT_SUMMARY"

PR_TITLE="${COMMIT_TYPE}(${ISSUE_NUMBER}): ${SUMMARY_TEXT}"

# 5) Commit
git add -A

if git diff --cached --quiet; then
  echo "커밋할 staged 변경사항이 없습니다."
else
  git commit -m "$PR_TITLE"
fi

# 6) Push
git push -u origin HEAD

# 7) 누적 커밋 기준 PR Title / Body 재생성
COMMIT_RANGE=$(detect_commit_range)
TITLE_SUMMARY=$(build_summary_from_commits "$COMMIT_RANGE" "$ISSUE_NUMBER")
[ -n "$TITLE_SUMMARY" ] && PR_TITLE="${COMMIT_TYPE}(${ISSUE_NUMBER}): ${TITLE_SUMMARY}"

BODY_SUMMARY_LINES=$(build_body_summary_lines "$COMMIT_RANGE" "$ISSUE_NUMBER")
[ -z "$BODY_SUMMARY_LINES" ] && BODY_SUMMARY_LINES="- $SUMMARY_TEXT"

if [ -f ".github/pull_request_template.md" ]; then
  JIRA_ISSUE_URL="https://jira.mailplug.co.kr/browse/${ISSUE_NUMBER}"
  PR_BODY=$(
    sed "s#<!---- 이슈 번호 --> RS-#${ISSUE_NUMBER}#g" .github/pull_request_template.md \
      | sed "s#<!---- JIRA 이슈 링크 -->#${JIRA_ISSUE_URL}#g" \
      | awk -v summary_lines="$BODY_SUMMARY_LINES" '
          /<!---- 변경 사항 및 관련 이슈에 대해 간단하게 작성해주세요\. 어떻게보다 무엇을 왜 수정했는지 설명해주세요\. -->/ {
            print
            print ""
            print summary_lines
            skip_next_dash = 1
            next
          }
          skip_next_dash && $0 == "-" {
            skip_next_dash = 0
            next
          }
          {
            print
          }
        '
  )
else
  PR_BODY=$'## Summary\n\n'"$BODY_SUMMARY_LINES"
fi

# 8) PR Title / Body 수정
gh api "repos/${REPO_NAME_WITH_OWNER}/pulls/${PR_NUMBER}" \
  --method PATCH \
  --input - <<< "$(jq -n \
    --arg title "$PR_TITLE" \
    --arg body "$PR_BODY" \
    '{title: $title, body: $body}'
  )" >/dev/null

# 결과 출력
echo ""
echo "PR Updated"
echo "PR Number: $PR_NUMBER"
echo "PR Title: $PR_TITLE"
echo "PR URL: $PR_URL"
echo "PR Type: $COMMIT_TYPE"
```
