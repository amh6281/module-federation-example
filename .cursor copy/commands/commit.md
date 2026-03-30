---
description: Generate a commit message from staged changes, commit, and confirm before pushing.
allowed-tools: Bash(git *), Bash(sed *), Bash(awk *), Bash(rg *)
---

# Commit Changes

> 커밋은 **staged changes 기준**으로만 판단한다. unstaged 변경사항은 근거에 포함하지 않는다.

## 실행 전 중단 조건

아래 상태 중 하나라도 해당하면 이유를 설명하고 즉시 멈춘다.

| 상태                 | 판단 방법                         |
| -------------------- | --------------------------------- |
| detached HEAD        | 현재 브랜치명이 비어 있음         |
| merge conflict       | staged 파일 중 unmerged 항목 존재 |
| staged 변경사항 없음 | commit할 내용이 없음              |

---

## 1. 컨텍스트 파악

다음 정보를 파악한다. 명령어 선택은 자유롭게 한다.

- **현재 브랜치명**
- **이슈 번호**: 브랜치명에서 `[A-Z]+-\d+` 패턴 우선 추출 → 없으면 마지막 segment → 없으면 `NO-ISSUE`
- **staged 변경 목록**: 변경 유형(추가/수정/삭제/이동)과 파일 경로
- **upstream 설정 여부**

---

## 2. 커밋 메시지 결정

형식: `<Type>(<이슈번호>): <Summary>`

### Type

staged 파일의 성격을 보고 아래 우선순위대로 하나를 고른다.

| 우선순위 | 조건                                                    | Type       |
| -------- | ------------------------------------------------------- | ---------- |
| 1        | 프로젝트 초기 생성                                      | `Init`     |
| 2        | 파일 삭제만                                             | `Remove`   |
| 3        | 파일/폴더 이동·이름 변경 중심                           | `Rename`   |
| 4        | `test` `tests` `spec` 포함, 비즈니스 로직 변경 없음     | `Test`     |
| 5        | `.css` `.scss` `style` 포함                             | `Style`    |
| 6        | 신규 기능·화면·API 연동                                 | `Feat`     |
| 7        | 버그·예외처리·typo 수정                                 | `Fix`      |
| 8        | `src` `app` `components` `pages` `hooks` 또는 구조 개선 | `Refactor` |
| 9        | `package.json` lock파일 `Dockerfile` `workflow` asset   | `Chore`    |
| 10       | 그 외                                                   | `Chore`    |

### Summary

우선순위대로 적용한다.

1. 사용자가 자연어로 커밋 제목을 지정했으면 그대로 사용
2. staged 변경 목록을 바탕으로 "무엇을 바꿨는지" 문구로 작성
    - 파일명 나열 금지
    - 최대 50자, 마침표·특수기호 없음
3. 판단 불가 시 기본값: `작업 반영`

---

## 3. Commit

staged 변경사항만 커밋한다.

---

## 4. Push 여부 확인

커밋 후 바로 push하지 않는다. 아래 내용을 정리해서 사용자에게 먼저 보여준다.

```
커밋을 생성했습니다.

- Type    : <TYPE>
- Summary : <SUMMARY>
- Commit  : <COMMIT_TITLE>
- Branch  : <BRANCH>
- Upstream: <UPSTREAM 또는 (no upstream)>
- Push To : <origin HEAD 또는 현재 upstream 브랜치>

이 커밋을 원격에 push 할까요? `accept` 또는 `run`이면 진행합니다.
```

`accept` 또는 `run` 확인 전에는 push하지 않는다.

---

## 5. Push

| 상황          | 행동                        |
| ------------- | --------------------------- |
| upstream 없음 | `git push -u origin HEAD`   |
| upstream 있음 | 현재 upstream 브랜치로 push |

---

## 6. 결과 출력

```
Commit : <커밋 제목>
SHA    : <commit SHA>
Pushed : yes | no
Branch : <push된 브랜치 또는 대상>
```

---

## 실패 처리

| 시점        | 처리                         |
| ----------- | ---------------------------- |
| 실행 전     | 현재 상태 설명 후 중단       |
| commit 실패 | 실패 원인 + staged 상태 안내 |
| push 미확인 | push 없이 커밋 결과만 출력   |
| push 실패   | 실패 원인 + 브랜치 상태 안내 |
