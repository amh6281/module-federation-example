---
description: Commit changes and update an existing pull request.
---

# Update Pull Request

```bash
set -euo pipefail

BASE_BRANCH="develop"
DEFAULT_SUMMARY="작업 반영"

BRANCH_NAME=$(git branch --show-current)
ISSUE_NUMBER=$(echo "$BRANCH_NAME" | rg -o "[A-Z]+-[0-9]+" | head -n 1 || true)
if [ -z "$ISSUE_NUMBER" ]; then
  echo "Branch name must include an issue number (example TK-1325)"
  exit 1
fi

PR_NUMBER=$(gh pr list --state open --head "$BRANCH_NAME" --json number --jq '.[0].number // empty')
if [ -z "$PR_NUMBER" ]; then
  echo "No existing PR found for this branch."
  echo "Use /create-pr instead."
  exit 1
fi

HAS_DIFF=false
if ! (git diff --quiet && git diff --cached --quiet); then
  HAS_DIFF=true
fi

if [ "$HAS_DIFF" = true ]; then
  DIFF_RAW=$(mktemp)
  git status --porcelain=v1 > "$DIFF_RAW"

  IS_RENAME=0
  IS_REMOVE=0
  HAS_NON_DELETE=0
  HAS_TEST=0
  HAS_STYLE=0
  HAS_COMMENT=0
  HAS_CHORE=0
  HAS_FRONTEND=0
  HAS_FIX_HINT=0
  HAS_FEAT_HINT=0

  while IFS= read -r line; do
    status=${line%% *}
    path=${line#?? }

    if [[ "$status" == D* ]]; then
      IS_REMOVE=1
      continue
    fi
    HAS_NON_DELETE=1

    if [[ "$status" == R* ]]; then
      IS_RENAME=1
    fi

    case "$path" in
      *test*|*tests*|*spec*|*_test.*|*.spec.*)
        HAS_TEST=1 ;;
      *.css|*.scss|*.sass|*.less|*.styl|*style*)
        HAS_STYLE=1 ;;
      *.md|*.mdx|*docs/*|*.markdown)
        HAS_COMMENT=1 ;;
      package.json|pnpm-lock.yaml|package-lock.json|yarn.lock|.github/workflows/*|Dockerfile|docker-compose.yml|tsconfig*.json|.editorconfig|.eslintrc*|.prettierrc*)
        HAS_CHORE=1 ;;
      src/*|app/*|components/*|pages/*|hooks/*|lib/*|api/*|server/*|client/*|public/*|views/*)
        HAS_FRONTEND=1 ;;
      *.js|*.jsx|*.ts|*.tsx|*.vue|*.svelte|*.json|*.yml|*.yaml|*.rb|*.py|*.go|*.java)
        HAS_FIX_HINT=1 ;;
    esac

    if rg -qE "TODO|FIXME|BUG|typo|오타|버그" "$path" 2>/dev/null; then
      HAS_FIX_HINT=1
    fi

    if rg -qE "feat|feature|기능" "$path" 2>/dev/null; then
      HAS_FEAT_HINT=1
    fi
  done < "$DIFF_RAW"
  rm -f "$DIFF_RAW"

  if [ "$IS_REMOVE" -eq 1 ] && [ "$HAS_NON_DELETE" -eq 0 ]; then
    COMMIT_TYPE="Remove"
  elif [ "$IS_RENAME" -eq 1 ]; then
    COMMIT_TYPE="Rename"
  elif [ "$HAS_TEST" -eq 1 ]; then
    COMMIT_TYPE="Test"
  elif [ "$HAS_STYLE" -eq 1 ]; then
    COMMIT_TYPE="Style"
  elif [ "$HAS_COMMENT" -eq 1 ]; then
    COMMIT_TYPE="Comment"
  elif [ "$HAS_CHORE" -eq 1 ]; then
    COMMIT_TYPE="Chore"
  elif [ "$HAS_FIX_HINT" -eq 1 ]; then
    COMMIT_TYPE="Fix"
  elif [ "$HAS_FEAT_HINT" -eq 1 ] || printf '%s\n' "$BRANCH_NAME" | rg -q '^feat|^feature|/feat'; then
    COMMIT_TYPE="Feat"
  elif [ "$HAS_FRONTEND" -eq 1 ]; then
    COMMIT_TYPE="Refactor"
  else
    COMMIT_TYPE="Chore"
  fi

  SUMMARY_TEXT="$DEFAULT_SUMMARY"
  RAW_SUMMARY=$(git diff --name-only | sed 's#^# #;/^$/d' | head -n 5 | tr '\n' ' ' | sed 's/^[[:space:]]*//')
  if [ -n "$RAW_SUMMARY" ]; then
    SUMMARY_TEXT="$RAW_SUMMARY"
  fi
  SUMMARY_TEXT=$(printf "%s" "$SUMMARY_TEXT" | tr -d '[:punct:]' | sed 's/[[:space:]]\+/ /g' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | cut -c1-40)
  if [ -z "$SUMMARY_TEXT" ]; then
    SUMMARY_TEXT="변경사항 반영"
  fi
else
  COMMIT_TYPE="Chore"
  SUMMARY_TEXT="변경사항 없음"
fi

PR_TITLE="${COMMIT_TYPE}(${ISSUE_NUMBER}): ${SUMMARY_TEXT}"
if [ ${#PR_TITLE} -gt 50 ]; then
  PR_TITLE="${COMMIT_TYPE}(${ISSUE_NUMBER}): ${SUMMARY_TEXT:0:$((50-${#COMMIT_TYPE}-${#ISSUE_NUMBER}-3))}"
fi

if [ "$HAS_DIFF" = true ]; then
  npm run lint
  npm run type-check

  git add -A
  git commit -m "$PR_TITLE"

  PUSH_NEEDED=true
  if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
    read -r BEHIND AHEAD < <(git rev-list --left-right --count @{u}...HEAD)
    if [ "$AHEAD" -eq 0 ]; then
      PUSH_NEEDED=false
    fi
  fi
  if [ "$PUSH_NEEDED" = true ]; then
    git push
  fi
fi

if [ -f ".github/pull_request_template.md" ]; then
  TEMPLATE=$(cat .github/pull_request_template.md)
  if printf '%s' "$TEMPLATE" | rg -q "Related Issue|Summary|Checklist"; then
    PR_BODY=$(printf "## Related Issue\n\n%s\n\n%s" "$ISSUE_NUMBER" "$TEMPLATE")
  else
    PR_BODY="$TEMPLATE"
  fi
else
  PR_BODY=$'## Summary\n\n- 작업 요약\n\n## Changes\n\n- 변경사항 반영'
fi

gh pr edit "$PR_NUMBER" --base "$BASE_BRANCH" --title "$PR_TITLE" --body "$PR_BODY"

case "$COMMIT_TYPE" in
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

if ! gh label view "$TYPE_LABEL" >/dev/null 2>&1; then
  gh label create "$TYPE_LABEL" --color 0e8a16 --description "Auto-created by script" >/dev/null 2>&1 || true
fi

gh pr edit "$PR_NUMBER" --add-label "$TYPE_LABEL" --add-label "cursor-generated"
gh pr edit "$PR_NUMBER" --add-assignee "$(gh api user --jq .login)"

echo "PR updated"
echo "PR Title: $PR_TITLE"
echo "PR URL: $(gh pr view "$PR_NUMBER" --json url --jq .url)"
```

Commit type to checklist mapping:

- Feat -> `새로운 기능 추가`
- Fix -> `버그 수정 또는 typo`
- Refactor -> `코드 리팩토링(코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우 포함)`
- Style -> `CSS 등 사용자 UI 디자인 변경`
- Comment -> `필요한 주석 추가 및 변경`
- Test -> `테스트(테스트 코드 추가, 수정, 삭제, 비즈니스 로직에 변경이 없는 경우)`
- Chore -> `위에 걸리지 않는 기타 변경사항(빌드 스크립트 수정, assets image, 패키지 매니저 등)`
- Init -> `프로젝트 초기 생성`
- Rename -> `파일 혹은 폴더명 수정하거나 옮기는 경우`
- Remove -> `파일을 삭제하는 작업만 수행하는 경우`

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
