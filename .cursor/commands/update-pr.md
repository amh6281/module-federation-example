---
description: Commit additional work and update the existing pull request following the team convention.
---

# Update Pull Request

```bash
set -euo pipefail

DEFAULT_SUMMARY="추가 작업 반영"

BRANCH_NAME=$(git branch --show-current)
REPO_NAME_WITH_OWNER=$(gh repo view --json nameWithOwner --jq .nameWithOwner)

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

# PR 제목에서 이슈 번호 뒤 summary만 추출
extract_pr_summary() {
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

# 기존 PR summary와 이번 변경 summary를 합쳐 새 제목용 summary를 만든다.
build_updated_summary() {
  local previous_summary="$1"
  local next_summary="$2"

  printf "%s\n%s\n" "$previous_summary" "$next_summary" \
    | awk 'NF && !seen[$0]++' \
    | head -n 3 \
    | awk 'BEGIN { first = 1 } NF { if (!first) printf " / "; printf "%s", $0; first = 0 }' \
    | cut -c1-40
}

# 1) 브랜치 / 이슈 정보 감지
ISSUE_NUMBER=$(printf '%s\n' "$BRANCH_NAME" | rg -o "[A-Z]+-[0-9]+" | head -n1 || true)

if [ -z "$ISSUE_NUMBER" ]; then
  echo "브랜치 이름에 이슈 번호가 필요합니다. 예: TE-11"
  exit 1
fi

# 2) 기존 PR 확인
PR_JSON=$(gh pr list --state open --head "$BRANCH_NAME" --json number,url,title --jq '.[0]')
PR_NUMBER=$(printf "%s" "$PR_JSON" | jq -r '.number // empty')
PR_URL=$(printf "%s" "$PR_JSON" | jq -r '.url // empty')
CURRENT_PR_TITLE=$(printf "%s" "$PR_JSON" | jq -r '.title // empty')

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

PREVIOUS_SUMMARY=$(extract_pr_summary "$CURRENT_PR_TITLE" "$ISSUE_NUMBER")
MERGED_SUMMARY=$(build_updated_summary "$PREVIOUS_SUMMARY" "$SUMMARY_TEXT")
[ -n "$MERGED_SUMMARY" ] && SUMMARY_TEXT="$MERGED_SUMMARY"

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

# 7) PR Title 수정
gh api "repos/${REPO_NAME_WITH_OWNER}/pulls/${PR_NUMBER}" \
  --method PATCH \
  -f title="$PR_TITLE" >/dev/null

# 결과 출력
echo ""
echo "PR Updated"
echo "PR Number: $PR_NUMBER"
echo "PR Title: $PR_TITLE"
echo "PR URL: $PR_URL"
echo "PR Type: $COMMIT_TYPE"
```
