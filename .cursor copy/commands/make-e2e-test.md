# Playwright E2E 테스트 작성

새 시나리오나 페이지 플로우에 대한 **Playwright E2E 테스트 코드**를 프로젝트 규칙에 맞게 작성한다.

> 목표: `tests/e2e/` 구조와 Page Object 패턴을 따르면서, **시나리오별로 필요한 spec·Page Object·유틸만 최소한으로 추가/수정**한다.

## 사용 시나리오

1. "XX 생성 플로우 E2E 테스트 추가해줘"처럼 **테스트할 사용자 여정(플로우)**가 있을 때
2. "특정 페이지에서 필터/검색 동작 테스트"처럼 **특정 페이지/기능**에 대한 E2E가 필요할 때
3. 새 페이지를 만들었고 **대응하는 Page Object와 spec**을 같이 추가하고 싶을 때

## 전제 / 규칙

- **테스트 위치 (예시 구조, 프로젝트에 맞게 조정)**
    - spec: `tests/e2e/*.spec.ts` 또는 `e2e/*.spec.ts` (기능/도메인별 파일)
    - Page Object: `tests/e2e/pages/*.ts` (페이지별 상호작용 캡슐화)
    - Modals: `tests/e2e/modals/*.ts` (모달이 많을 경우 분리)
    - 공용 유틸: `tests/e2e/utils/*.ts` (날짜/랜덤값/공통 동작 등)
- **진입점**
    - spec에서는 **직접 `page`를 사용**하거나, 프로젝트에 Page Object 팩토리(예: `Pages(page)`, `Modals(page)`)가 있다면 그 패턴을 그대로 사용한다.
    - 새 Page Object를 추가했다면, 해당 팩토리/인덱스 파일에서 export 해 재사용 가능하게 만든다.
- **환경 설정**
    - `playwright.config`에서 `baseURL`이 설정되어 있다면, 테스트에서는 `page.goto('/path')`처럼 **상대 경로**만 사용한다.
    - 로그인, 공통 헤더 등 항상 필요한 준비 단계가 있다면, **공통 beforeEach 훅**이나 별도 헬퍼 함수로 묶어둔다.
- **선택자**
    - 역할/접근성 우선: `getByRole('button', { name: '저장' })`, `getByRole('link', { name })`, `getByPlaceholder('검색')`
    - 필요 시 `page.locator('[data-testid=\"...\"]')`, `page.locator('#content')` 같은 테스트 전용 selector 사용
- **언어**
    - 테스트 설명(`test` 제목)·주석·expect 메시지는 **한국어로 명확하게 의도**를 드러내되, 코드/식별자는 영어를 유지한다.

## 프로젝트별 필수 체크리스트

테스트 작성 전 **프로젝트 구조에 맞게** 확인할 것:

1. **실제 API 사용**
    - E2E는 **실제 API**를 사용한다. mock/스텁 대신 테스트 환경의 백엔드와 연동해 검증한다.

2. **필요한 선행 데이터/권한**
    - 모달·폼에서 선택하는 엔티티(자원, 사용자, 카테고리 등)가 **권한·사용자 등록** 등 선행 조건을 요구하는지 확인.
    - 해당 조건을 만족하는 헬퍼(예: `createXWithY`)가 있다면 재사용.

3. **리소스 정리 (afterEach)**
    - 테스트에서 생성한 데이터는 `afterEach`에서 정리. 프로젝트의 cleanup 헬퍼가 있다면 사용.

4. **유사 테스트 참조**
    - **기존 유사 시나리오를 복사 후 수정**하는 방식이 가장 안정적. 새로 작성하기 전에 `tests/e2e/*.spec.ts`를 검색해 참조할 spec을 찾는다.

## 자주 하는 실수와 해결법

| 실수                                    | 원인                                                               | 해결                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 모달/폼에서 선택 항목이 안 보임         | 선행 데이터·권한 미설정                                            | 프로젝트의 setup 헬퍼 사용 또는 권한/등록 플로우를 테스트에 포함                                     |
| Select/토글 버튼을 `name`으로 찾지 못함 | Select는 현재 선택값(예: "선택", "필수")만 노출, 행/폼 이름과 다름 | `getByRole('row').filter({ has: inputLocator }).getByRole('button')` 형태로 **행 기준** 후 버튼 선택 |
| API 응답 대기 실패                      | 네트워크·서버 지연                                                 | `waitForResponse`, `waitForLoadState`, 요소 기준 `waitFor` 등 명시적 대기 사용                       |
| 테스트 간 상태 오염                     | 정적 변수·전역 상태가 남아 있음                                    | `beforeEach`에서 `ClassName.staticVar = null` 등 초기화                                              |
| 인증/로그인 실패                        | URL·타임아웃·환경 변수                                             | 프로젝트의 auth 설정(`.env`, `auth-setup` 등) 확인                                                   |

## 실행 흐름

### 1. 컨텍스트 파악

1. 사용자가 **테스트할 시나리오 또는 대상 페이지/기능**을 자연어로 설명한 내용을 정리한다.
2. 관련 소스 확인:
    - 페이지 컴포넌트: 예) `src/pages/**`, `src/routes/pages/**`, `src/components/<PageName>/**`
    - 공통 UI/레이아웃: 예) `src/layout/**`, `src/components/common/**`
3. 이미 유사한 시나리오를 다루는 E2E가 있는지 `tests/e2e/*.spec.ts`, `tests/e2e/pages/*.ts`에서 먼저 찾고, **가능하면 복사·수정**하는 방향으로 간다.

### 2. Page Object 정리

- **새 페이지**가 필요하면:
    - `tests/e2e/pages/<name>-page.ts` 생성
    - 생성자에서 `page`를 주입하고, 자주 쓰는 요소/행동을 메서드로 감싼다.
        - 예: `goto()`, `fillForm()`, `clickSave()`, `expectListItem()` 등
    - 공통 동작(네비게이션, 검색 등)은 별도 BasePage나 공통 헬퍼에 두고, 개별 페이지 객체에서 재사용한다.
- **기존 Page Object**가 있다면:
    - 가능한 한 기존 메서드를 재사용하고, **새 메서드만 최소한으로 추가**한다.
- **Select·토글 등 동적 표시값 요소**:
    - Select는 "선택", "필수" 등 **현재 선택값**만 노출하므로, `getByRole('button', { name: '폼이름' })`처럼 고정 이름으로 찾으면 실패함.
    - **행(row) 또는 부모 컨텍스트로 범위를 좁힌 뒤** 해당 행 내 버튼을 선택:  
      `getByRole('row').filter({ has: inputLocator }).getByRole('button')`

### 3. 기능 동작 조건 파악 (정확도 향상을 위한 필수 단계)

1. **해당 UI가 언제, 어떤 상태에서 보이는지**를 실제 코드에서 직접 확인한다.
    - 관련 컴포넌트/레이아웃 파일을 열고, `if` 조건, `useEffect`, `visible`/`open` 플래그, feature flag, 권한 체크 등을 살펴본다.
2. 위 조건을 만족시키도록 **테스트 초기 상태를 설계**한다.
    - 예시:
        - 특정 목록이 비어 있을 때만 보이는 배너 → 목록 데이터가 비어 있는 상태를 만들 것
        - 관리자 권한에서만 보이는 버튼 → 테스트 컨텍스트에서 관리자 계정을 사용하거나, 해당 플래그를 켠 상태로 시작할 것
    - 실제 API를 사용하므로, **테스트 환경(백엔드·DB)**이 준비되어 있는지 확인한다.
3. 조건이 복잡할수록, **가장 비슷한 기존 spec**을 찾아 거기서 초기 상태 구성/행동 패턴을 그대로 가져온 뒤, 필요한 부분만 수정한다.

### 4. Spec 작성

- **파일**: 기존 도메인 spec에 시나리오를 추가하거나, 새 시나리오 묶음이 크면 새 `tests/e2e/<도메인>.spec.ts`를 만든다.
- **구조 (기본 템플릿)**:

    ```ts
    import { expect, test } from '@playwright/test';
    // import { Pages } from './pages'; // 프로젝트에 Page Object 팩토리가 있다면 사용

    test.describe('시나리오 그룹 설명', () => {
    	test.beforeEach(async ({ page }) => {
    		// 공통 준비: 로그인, 공통 페이지 진입, feature flag 설정 등
    		// await page.goto('/...');
    	});

    	test('구체적인 시나리오 한 줄 설명', async ({ page }) => {
    		// const pages = Pages(page); // 선택 사항
    		// 1) given: 초기 상태 (필요한 데이터/플래그/URL 설정)
    		// 2) when: 사용자 행동 (버튼 클릭, 입력, 드래그 등)
    		// 3) then: 기대 결과 검증 (UI, URL, 네트워크 호출 여부 등)
    		// await expect(page.getByText('...')).toBeVisible();
    	});
    });
    ```

- **assertion**: `expect`는 `@playwright/test`에서 import.
    - 예: `await expect(locator).toBeVisible()`, `await expect(page).toHaveURL(/search/)`
    - 가능하면 텍스트 전체보다는 **역할/의미 기반 selector**에 대한 검증을 우선한다.

### 5. 검증

- 작성·수정한 spec에 대해:
    - 전체: `npm run test:e2e`
    - 특정 spec만: `npx playwright test tests/e2e/<파일명>.spec.ts`
    - 특정 테스트만: `npx playwright test tests/e2e/<파일명>.spec.ts -g "테스트 제목"`
- 테스트가 불안정하면(간헐 실패):
    - 불필요한 `waitForTimeout`을 제거하고, `waitForURL`, `waitForLoadState`, 요소 기준 `waitFor` 등 **명시적인 동기화 포인트**로 교체한다.

### 6. 실행·디버깅 명령

```bash
# 전체 E2E (프로젝트 스크립트에 따라 setup → 브라우저)
npm run test:e2e

# 특정 spec만
npx playwright test tests/e2e/<파일명>.spec.ts --project=<프로젝트명>

# 특정 테스트만 (-g로 제목 일부 매칭)
npx playwright test tests/e2e/<파일명>.spec.ts -g "테스트 제목" --project=<프로젝트명>

# 브라우저 보이면서 실행 (디버깅용)
npx playwright test tests/e2e/<파일명>.spec.ts -g "테스트 제목" --project=<프로젝트명> --headed

# UI 모드 (대화형 테스트 실행)
npm run test:e2e:ui
```

## 출력 예시 (개념)

**요청**: "리스트 페이지에서 아이템을 삭제하는 E2E 추가해줘"

- **추가/수정**:
    - `tests/e2e/pages/list-page.ts`: `goto()`, `deleteItem(name)`, `expectItemDeleted(name)` 같은 메서드가 없다면 추가
    - `tests/e2e/list.spec.ts` (또는 해당 도메인 spec)에 아래와 유사한 테스트 추가:
        - `리스트 페이지 진입 → 특정 아이템의 삭제 버튼 클릭 → 확인 → 리스트에서 사라졌는지 확인`

## 요약

- **입력**: 테스트할 시나리오 또는 페이지/기능 설명
- **동작**: 프로젝트의 Page Object/유틸 구조를 재사용해 `test.describe`/`test.beforeEach`/`test` 블록을 작성하고, UI 표시 조건을 코드로 확인해 초기 상태를 설계한다.
- **효과**: 프로젝트 전반에서 재사용 가능한 패턴으로 Playwright E2E 테스트가 추가되고, `npm run test:e2e`나 개별 명령으로 손쉽게 실행·검증할 수 있다.

## 작성 전 빠른 점검

1. 유사 테스트가 있는가? → 있으면 **복사 후 수정**.
2. 선행 데이터·권한이 필요한가? → 프로젝트의 setup 헬퍼 또는 등록 플로우를 포함했는가?
3. `baseURL`·인증 등 **테스트 환경**이 올바르게 설정되어 있는가?
4. `afterEach`에서 **생성 데이터 정리**를 하는가?
5. Select/토글을 찾을 때 **행 기준**으로 범위를 좁혔는가?
