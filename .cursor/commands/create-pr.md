---
description: Analyze git changes, generate a commit and pull request following the team commit convention, and create the PR automatically.
---

# Automatic Pull Request Creation

## Important Note (Cursor Security)

Cursor may require a manual **Run** approval for commands that modify the repo or access the network (e.g. `git push`, `gh pr create`). This command will therefore:

- Generate the commit title + PR body
- Execute the git/gh commands automatically (may still prompt for approval)

This aims to minimize manual work while staying within the security model.

## Step 1 — Analyze Changes

Analyze the current git diff to understand:

- What files changed
- What functionality changed
- Whether the change is a feature, fix, refactor, style, etc.

---

## Step 2 — Extract Issue Number

Extract the issue number from the current branch name.

Examples:

feature/TK-1325-card-delete  
fix/TK-210-login-error

→ Issue number = TK-1325

Rules:

- Issue number **must exist**
- If not found, stop and output:

Branch name must include an issue number (example TK-1325)

---

## Step 3 — Determine Commit Type

Select one of the following commit types.

Feat: 새로운 기능 추가  
Fix: 버그 수정 또는 typo  
Refactor: 리팩토링 코드 구조 개선 기능 변경 없음  
Style: CSS 등 UI 디자인 변경  
Comment: 주석 추가 또는 변경  
Test: 테스트 코드 추가 수정 삭제  
Chore: 빌드 설정 패키지 assets 변경  
Init: 프로젝트 초기 생성  
Rename: 파일 또는 폴더 이름 변경  
Remove: 파일 삭제 작업

Choose the **most representative type**.

---

## Step 4 — Generate Commit Title

Format:

<Type>(<IssueNumber>): <한글 요약>

Rules:

- 최대 **50자**
- **마침표 사용 금지**
- **특수문자 사용 금지**
- **개조식 구문**
- **한글 작성**

Example:

Feat(TK-1325): 카드 삭제 버튼 추가  
Fix(TK-210): 로그인 토큰 갱신 오류 수정  
Refactor(TK-98): Zustand store 구조 정리  
Chore(TK-450): Cursor rules skills 구조 추가

---

## Step 5 — Generate PR Description

Format exactly as below.

---

## Step 6 — Execute Commands Automatically

After generating the PR title and body, run the following commands sequentially:

1. `git add -A`
2. `git commit -m "<PR title>"`
3. `git push -u origin HEAD`
4. `gh pr create --title "<PR title>" --body "<PR body>"`

Rules:

- Execute in order and stop on failure.
- Do not use interactive git flags.
- Do not force push.
- At the end, print the created PR URL.
