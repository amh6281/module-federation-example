---
description: Create a pull request for the current branch or update the existing pull request body from the latest pushed commits.
allowed-tools: Bash(git *), Bash(gh *), Bash(jq *), Bash(sed *), Bash(awk *), Bash(rg *), Bash(brew install gh)
---

# Sync Pull Request

> 커밋은 만들지 않는다. 필요하면 먼저 `/commit`으로 커밋·push를 완료한 뒤 실행한다.

## 실행 전 중단 조건

아래 상태 중 하나라도 해당하면 이유를 설명하고 즉시 멈춘다.

| 상태             | 판단 방법                          |
| ---------------- | ---------------------------------- |
| detached HEAD    | 현재 브랜치명이 비어 있음          |
| merge conflict   | staged 파일 중 unmerged 항목 존재  |
| upstream 없음    | remote 추적 브랜치가 설정되지 않음 |
| 미push 커밋 존재 | 로컬이 원격보다 ahead              |

---

## 컨텍스트 파악

다음 정보를 파악한다. 명령어 선택은 자유롭게 한다.

- **현재 브랜치명**
- **원격 동기화 상태** (ahead / behind / sync)
- **이슈 번호**: 브랜치명에서 `[A-Z]+-\d+` 패턴 우선 추출 → 없으면 마지막 segment → 없으면 `NO-ISSUE`
- **Jira URL**: `https://jira.mailplug.co.kr/browse/<이슈번호>`
- **develop 이후 커밋 목록** (subject + body)
- **기존 열린 PR 여부** (현재 브랜치 기준)

---

## PR 제목 결정

> 기존 PR이 있으면 이 단계를 건너뛴다. 제목은 변경하지 않는다.

우선순위대로 적용한다.

1. 사용자가 자연어로 제목을 지정했으면 그대로 사용
2. develop 이후 커밋이 1개 → 해당 커밋 subject를 그대로 사용
3. develop 이후 커밋이 2개 이상 → 핵심 내용을 하나의 대표 제목으로 재구성
   - Type: 모두 같으면 유지, 다르면 `Chore`
4. 커밋이 없으면: `Chore(<이슈번호>): 작업 반영`

제목 조건: 최대 50자, 마침표·특수기호 없음

---

## PR 본문 생성

`.github/pull_request_template.md`가 있으면 템플릿 기반으로, 없으면 기본 구조로 작성한다.

### 템플릿이 있는 경우

- 이슈 번호·Jira URL placeholder를 실제 값으로 치환
- **Summary**: 변경 배경 → 핵심 변경사항 → 기대 효과 순서로 한국어 bullet 작성
  - 파일명 나열 금지, 리뷰 포인트 중심으로
- **Checklist**: 실제 작업 성격에 해당하는 항목만 `[x]` 체크

  | 체크 항목 | 해당 작업 성격   |
  | --------- | ---------------- |
  | Feat      | 새로운 기능 추가 |
  | Fix       | 버그 수정        |
  | Style     | UI / CSS 변경    |
  | Refactor  | 코드 리팩토링    |
  | Comment   | 문서 / 주석      |
  | Test      | 테스트           |
  | Chore     | 빌드 / 패키지    |

### 템플릿이 없는 경우

```md
## Summary

- 변경 배경
- 핵심 변경사항
- 기대 효과
```

---

## PR 생성 또는 업데이트

| 상황         | 행동                                |
| ------------ | ----------------------------------- |
| 열린 PR 없음 | base `develop`으로 새 PR 생성       |
| 열린 PR 있음 | 기존 PR 본문만 업데이트 (제목 유지) |

---

## 후처리

현재 GitHub 사용자를 확인한 뒤 아래를 수행한다. 이미 설정된 값은 건드리지 않는다.

- `cursor-generated` 라벨이 없으면 생성 후 PR에 추가
- 현재 사용자를 assignee로 추가
- `.github/CODEOWNERS`가 있으면 reviewer 추출 → 본인 제외 후 추가

---

## 결과 출력

```
Action  : created | updated
Branch  : <브랜치명>
PR      : <URL>
Number  : #<번호>
Title   : <제목>
Body    : updated
```

---

## 실패 처리

| 시점             | 처리                                   |
| ---------------- | -------------------------------------- |
| 실행 전          | 현재 상태 설명 후 중단                 |
| upstream 없음    | push 필요 안내 후 중단                 |
| 미push 커밋 존재 | `/commit` 또는 `git push` 안내 후 중단 |
| PR 생성 실패     | 현재 브랜치 + 마지막 커밋 제목 안내    |
| PR 업데이트 실패 | 기존 PR 번호 / URL + 실패 원인 안내    |

`git reset --hard` 등 파괴적 복구는 사용자가 명시적으로 요청하지 않는 한 수행하지 않는다.
