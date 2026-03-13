---
description: Generate commit and create a new pull request following the team convention.
allowed-tools: Bash(git *), Bash(gh *), Bash(jq *), Bash(sed *), Bash(awk *), Bash(rg *), Bash(brew install gh)
argument-hint: [summary]
---

# Create Pull Request

현재 작업 내용을 기준으로 `commit -> push -> pull request 생성` 순서로 진행합니다.

스크립트를 한 번에 실행하지 말고, 아래 순서대로 상태를 확인하면서 진행합니다.

## 작업 원칙

- 기본 대상 브랜치는 항상 `develop`입니다.
- PR 생성 전 현재 변경사항과 브랜치 상태를 반드시 확인합니다.
- 변경사항이 있으면 먼저 커밋합니다.
- 원격 업스트림이 없거나 아직 push되지 않은 커밋이 있으면 push합니다.
- 같은 브랜치에 이미 열린 PR이 있으면 새로 만들지 않고 기존 PR URL만 확인합니다.
- PR 본문은 가능하면 `.github/pull_request_template.md`를 사용합니다.
- PR 생성 후 `cursor-generated` 라벨, 현재 사용자 assignee, `platform-core` 팀 reviewer를 설정합니다.

## 1. 현재 상태 확인

다음 항목을 먼저 확인합니다.

- Current git status: !`git status --short`
- Current branch: !`git branch --show-current`
- Upstream branch: !`git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "(no upstream)"`
- Recent commits: !`git log --oneline -5`
- Unstaged diff files: !`git diff --name-only HEAD`
- Staged diff files: !`git diff --cached --name-only`

## 2. 브랜치와 이슈 번호 확인

현재 브랜치에서 이슈 번호를 추출합니다.

1. 현재 브랜치명을 확인합니다.
2. 브랜치 마지막 세그먼트를 기본 이슈 번호로 사용합니다.
   예시: `feature/RS-123` -> `RS-123`
3. 브랜치명 안에 `ABC-123` 형식의 Jira 티켓 키가 있으면 그것을 우선 사용합니다.
4. Jira 티켓 키가 확인되면 Jira URL은 `https://jira.mailplug.co.kr/browse/<TICKET>` 형식으로 구성합니다.
5. Jira 티켓 키를 찾지 못하면 마지막 세그먼트를 이슈 번호로 사용하되, PR 제목도 같은 값을 사용합니다.

예시:

- `feature/RS-123` -> 이슈 번호 `RS-123`
- `bugfix/mail-issue` -> 이슈 번호 `mail-issue`

## 3. 변경사항 여부와 push 필요 여부 확인

다음 기준으로 상태를 판단합니다.

1. `git diff --name-only HEAD` 결과가 있거나 `git diff --cached --quiet`가 실패하면 현재 변경사항이 있는 상태입니다.
2. 업스트림 브랜치가 있으면 `git rev-list --left-right --count @{u}...HEAD`로 ahead 수를 확인합니다.
3. ahead가 1 이상이면 아직 push되지 않은 커밋이 있는 상태입니다.
4. 업스트림이 없으면 push가 필요하다고 판단합니다.

## 4. Commit Type과 제목 요약 생성

변경사항이 있는 경우, 수정 파일 경로를 바탕으로 Commit Type을 결정합니다.

우선순위:

1. 경로에 `test`, `tests`, `spec`가 포함되면 `Test`
2. 경로에 `.css`, `.scss`, `style`이 포함되면 `Style`
3. 경로에 `.md`, `docs`가 포함되면 `Comment`
4. 경로에 `package.json`, lock 파일, `Dockerfile`, `workflow`가 포함되면 `Chore`
5. 경로에 `src`, `app`, `components`, `pages`, `hooks`가 포함되면 `Refactor`
6. 그 외에는 `Chore`

요약 텍스트는 다음 순서로 생성합니다.

1. 변경 파일 목록에서 앞의 최대 5개 파일만 사용합니다.
2. 줄바꿈은 공백으로 합칩니다.
3. 문장부호는 제거합니다.
4. 연속 공백은 하나로 정리합니다.
5. 40자까지만 사용합니다.
6. 비어 있으면 기본값 `작업 반영`을 사용합니다.

변경사항이 없는 경우:

1. 마지막 커밋 제목을 확인합니다.
2. 마지막 커밋 제목이 `Type(ISSUE): summary` 형식이고 ISSUE가 현재 이슈 번호와 같으면:
   `Type`과 `summary`를 그대로 재사용합니다.
3. 아니면 `Chore(<ISSUE>): 작업 반영` 규칙을 사용합니다.

최종 제목 형식:

`<CommitType>(<ISSUE>): <Summary>`

예시:

- `Refactor(RS-123): src Apptsx host Texttsx`
- `Chore(mail-issue): 작업 반영`

## 5. 커밋 수행

변경사항이 있을 때만 커밋합니다.

1. 전체 변경사항을 스테이징합니다: !`git add -A`
2. 위에서 생성한 PR 제목과 동일한 문자열로 커밋합니다: !`git commit -m "<PR_TITLE>"`
3. 커밋 실패 시 중단합니다.

중요:

- 변경사항이 없으면 새 커밋을 만들지 않습니다.

## 6. Push 수행

다음 경우에는 push합니다.

- 방금 새 커밋을 만든 경우
- 로컬 커밋이 업스트림보다 앞서 있는 경우
- 업스트림이 아직 없는 경우

실행 규칙:

1. 현재 HEAD를 origin에 push합니다: !`git push -u origin HEAD`
2. push 실패 시 PR 생성은 진행하지 않습니다.

## 7. PR 본문 생성

`.github/pull_request_template.md`가 있으면 그 파일을 기반으로 PR 본문을 만듭니다.

치환 규칙:

1. `[<!---- 이슈 번호 --> RS-](<!---- JIRA 이슈 링크 -->)` 부분의 이슈 번호 placeholder를 현재 이슈 번호로 치환합니다.
2. Jira URL이 있으면 링크 placeholder를 실제 Jira URL로 치환합니다.
3. Jira URL이 없으면 링크는 비워두되 템플릿 구조는 유지합니다.
4. `Summary` 섹션은 비워두지 말고, 이번 변경의 목적과 핵심 변경사항을 한국어 bullet 1~3개로 구체적으로 작성합니다.
5. `Checklist`는 실제 작업 성격에 맞는 항목만 `[x]`로 체크하고, 해당 없는 항목은 `[ ]`로 둡니다.

PR body 작성 규칙:

- `Summary`에는 "무엇을 왜 바꿨는지"를 적습니다. 구현 방식 설명보다 사용자 영향이나 기능 변화 중심으로 씁니다.
- `Summary`는 가능한 한 자세하게 작성합니다. 한두 줄로 끝내지 말고, 변경 배경, 사용자 영향, 주요 구현 포인트가 드러나도록 충분히 설명합니다.
- `Summary`는 읽기 쉽게 구성합니다. 긴 문단 하나로 쓰지 말고, 의미 단위별로 bullet 또는 짧은 문단으로 나눕니다.
- 파일명 나열만 적지 말고 변경 의도를 문장으로 정리합니다.
- 가능하면 아래 순서로 정리합니다.
- 변경 배경: 왜 이 작업이 필요했는지
- 핵심 변경사항: 무엇이 달라졌는지
- 기대 효과: 사용자 경험, 유지보수성, 성능, 안정성 등 어떤 점이 좋아지는지
- 중요한 코드 변경이 있으면 코드 블록을 사용합니다.
- 코드 블록은 전체 코드를 길게 붙이지 말고, 리뷰에 필요한 핵심 부분만 발췌합니다.
- 코드 블록 위아래로 한두 문장 설명을 덧붙여서 "무엇을 봐야 하는지"가 바로 보이게 작성합니다.
- UI 변경이 큰 경우에는 화면 구조, 상태 흐름, 조건 분기 변화가 드러나게 설명합니다.
- 로직 변경이 큰 경우에는 입력값, 처리 방식, 예외 케이스가 어떻게 달라졌는지 설명합니다.
- 리뷰어가 파일을 열기 전에 PR 본문만 읽어도 변경 의도를 이해할 수 있는 수준으로 작성합니다.
- `Checklist`는 아래 기준으로 체크합니다.
- 새로운 기능 추가: 새 기능, 새 화면, 새 API 연결
- 버그 수정: 잘못된 동작 수정, 예외 처리 보완
- CSS 등 사용자 UI 디자인 변경: 스타일, 레이아웃, 문구 노출 변화
- 코드 리팩토링: 동작 변화 없이 구조 개선
- 문서 수정: md, 가이드, 주석 중심 변경
- 테스트 추가, 테스트 리팩토링: 테스트 코드 추가 또는 정비
- 빌드 부분 혹은 패키지 매니저 수정: 의존성, 설정, workflow 변경

템플릿 파일이 없으면 아래 기본 본문을 사용합니다.

```md
## Summary

- 작업 요약

## Changes

- 변경사항 반영
```

예시:

```md
## Related Issue 🔗

[RS-123](https://jira.mailplug.co.kr/browse/RS-123)

<br>

## Summary ✏️

- 기존에는 화면 타이틀과 본문 텍스트가 동일한 스타일 계층에 있어, 정보 우선순위가 명확하지 않았습니다.
- 이번 변경에서는 타이틀과 본문 역할을 컴포넌트 수준에서 분리해 화면 가독성을 개선했고, 이후 유사 화면에서도 같은 패턴을 재사용할 수 있도록 구조를 정리했습니다.
- `Text` 컴포넌트의 props를 단순화해 타입 추론이 더 명확해지도록 수정했고, 스타일 책임도 `Title`과 일반 텍스트로 분리했습니다.

핵심 변경 코드는 아래와 같습니다.

```tsx
<Title level={2}>호스트 홈</Title>
<Text tone="secondary">설명 문구를 더 안정적으로 재사용할 수 있도록 분리했습니다.</Text>
```

이 변경으로 화면에서 제목과 설명의 시각적 위계가 분명해지고, 이후 텍스트 컴포넌트 확장 시에도 스타일 충돌 가능성을 줄일 수 있습니다.

<br>

## Checklist ✅

- [ ] 새로운 기능 추가
- [ ] 버그 수정
- [x] CSS 등 사용자 UI 디자인 변경
- [x] 코드 리팩토링
- [ ] 주석 추가 및 수정
- [ ] 문서 수정
- [ ] 테스트 추가, 테스트 리팩토링
- [ ] 빌드 부분 혹은 패키지 매니저 수정
- [ ] 파일 혹은 폴더명 수정
- [ ] 파일 혹은 폴더 삭제
```

## 8. 기존 PR 확인

같은 브랜치에 이미 열린 PR이 있는지 먼저 확인합니다.

- Open PR lookup: !`gh pr list --state open --head "$(git branch --show-current)" --json number,url --jq '.[0] // empty'`

처리 규칙:

1. 이미 열린 PR이 있으면 새 PR을 만들지 않습니다.
2. 해당 PR URL을 사용자에게 보여주고 작업을 종료합니다.

## 9. PR 생성

기존 PR이 없을 때만 새 PR을 생성합니다.

생성 규칙:

- base branch: `develop`
- title: 위에서 생성한 `PR_TITLE`
- body: 위에서 준비한 PR body
- reviewer team: `platform-core`

실행 예시:

!`gh pr create --base develop --title "<PR_TITLE>" --body "<PR_BODY>" --team-reviewer platform-core`

가능하면 생성 결과에서 PR 번호와 URL을 함께 확인합니다.

## 10. 라벨, 담당자, 리뷰어 설정

PR 생성 후 다음 후처리를 진행합니다.

1. 현재 로그인 사용자를 확인합니다: !`gh api user --jq .login`
2. `cursor-generated` 라벨이 없으면 생성합니다.
3. 생성된 PR에 `cursor-generated` 라벨을 추가합니다.
4. 현재 로그인 사용자를 assignee로 추가합니다.
5. `.github/CODEOWNERS`가 있으면 owner 계정을 읽어 reviewer 후보를 구성합니다.
6. 현재 assignee 본인은 reviewer 목록에서 제외합니다.
7. reviewer 후보가 있으면 PR에 추가합니다.

참고:

- 팀 reviewer `platform-core`는 PR 생성 시점에 먼저 추가합니다.
- CODEOWNERS 기반 reviewer 추가는 실패해도 전체 작업은 유지합니다.

## 11. 결과 보고

마지막에 아래 내용을 정리해서 보여줍니다.

- PR Title
- PR URL
- PR Type
- 사용한 이슈 번호
- 새 커밋 생성 여부
- push 수행 여부

## 실패 시 처리

문제가 생기면 아래 원칙으로 중단합니다.

1. commit 전에 실패하면 현재 상태만 설명하고 중단합니다.
2. commit 후 push 전에 실패하면 실패 원인과 현재 브랜치 상태를 설명합니다.
3. push 후 PR 생성에 실패하면 push된 브랜치와 마지막 커밋 제목을 함께 알려줍니다.
4. 사용자가 명시적으로 요청하지 않은 `git reset --hard` 같은 파괴적 복구는 하지 않습니다.
