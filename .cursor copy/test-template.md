# Cursor Rule 테스트

## 채점 기준

- **2점**: 룰 완전히 준수
- **1점**: 일부 준수 또는 애매
- **0점**: 룰 미준수

---

## 시나리오 A — UserCard 컴포넌트

**실행 프롬프트**

```
UserCard 컴포넌트 만들어줘.
props로 userId를 받아서 JSONPlaceholder /users/:id로 유저 데이터 fetch하고,
해당 유저의 이름·이메일·전화번호·회사명을 카드 형태로 표시해줘.
로딩·에러 상태 처리도 포함해줘.
```

> 커버 룰: typescript §1 2 4 5 6 7 · react Component/Hooks/State/Accessibility · TanStack Query(queryOptions·useQuery) · code-quality §2 §7 · global Imports

### 대상 변경 (diff)

**워킹 트리(실제 변경)** — 채점 표 **A** 열·실험 기록용.

- `src/components/UserCard/UserCard.tsx` — `import React from 'react'`(JSX 스코프), `userId`·`className` props, `fetch` + 인라인 `fetchJsonPlaceholderUser`(`GET https://jsonplaceholder.typicode.com/users/:id`, `AbortSignal`, 404/`!ok` 시 `Error`), `useQuery`({ `queryKey`, `queryFn`, `enabled`: 양의 정수 `userId` }), `JsonPlaceholderUser`·`company` **파일 내부 `interface` 인라인**, `export default UserCard`, `@/utils/shared`의 `classNames`, 무효 ID / 로딩(스켈레톤·`aria-busy`) / 에러(`role="alert"`·`refetch`) / 성공(`article`·`dl`/`dt`/`dd`) early return
- `src/components/UserCard/index.ts` — `export { default as UserCard }`, `export type { UserCardProps }` (`src/components/index.ts` 배럴 export는 **미포함**, 필요 시 `@/components/UserCard` 직접 import)

**B-1 참조 구현(고정)** — 채점 표 **B-1** 열만 이 블록 기준(숫자·행 정의 **변경 없음**). 워킹 트리와 다를 수 있음.

- `src/components/common/UserCard/UserCard.tsx`, `src/components/common/UserCard/index.ts` — `UserCard`·`UserCardProps` named export (`src/components/index.ts` 배럴 export는 **미포함**, 필요 시 소비처에서 `@/components/common/UserCard` 직접 import)
- `src/modules/api/jsonPlaceholder/index.ts` — `jsonPlaceholderApi` (`axios.create`, `baseURL` `https://jsonplaceholder.typicode.com`)
- `src/modules/api/jsonPlaceholder/user.ts` — `getJsonPlaceholderUser` (`jsonPlaceholderApi.get`, `import type`로 응답 타입)
- `src/modules/stores/server/jsonPlaceholder/queries.ts` — `jsonPlaceholderQueries` (`queryOptions`, `enabled`와 무효 ID 정합)
- `src/modules/types/JsonPlaceholderUser.ts`

### 토큰 사용량

> **첫 질문** = 위 **실행 프롬프트** 블록만 넣어 Agent를 연 **최초 user 메시지 1회**에 대응하는 구간(첫 assistant 응답·같은 턴의 tool 호출까지 Usage에 합산되는 범위)을 뜻함.
>
> **A** 열: 첫 질문(베이스라인, 룰 비교 실험 전 동일 조건)에 대한 값. **B-1** 열: 기존 **구현(첫 질문)** 열에 두던 값과 **동일한 숫자**를 둠(구현 열은 비움). Git/diff로는 산출 불가 — Cursor **Settings → Usage**(또는 팀 리포트)에서 해당 요청의 breakdown을 복사해 **아래 예시를 실측으로 교체**.
>
> **B-2 …** 열: 동일 프롬프트를 룰 on/off 등 조건만 바꿔 재실행했을 때의 값.

| 항목        | 구현 (첫 질문) | A (첫 질문=베이스) | B-1 | B-2     | B-3     |
| ----------- | -------------- | ------------------ | --- | ------- | ------- |
| Cache Read  |                | 293,376            |     | 349,696 | 267,264 |
| Cache Write |                | 0                  |     | 0       | 0       |
| Input       |                | 20,455             |     | 24,118  | 16,540  |
| Output      |                | 5,401              |     | 7,203   | 4,988   |
| **Total**   |                | 319,232            |     | 381,017 | 288,792 |

> 위 숫자는 **형식·합계 예시**(임의)이며, 보고·비교에는 반드시 **본인 첫 질문 Usage 실측**으로 바꿀 것.  
> **B-2(토큰)**: TanStack Query·일부 워크스페이스 룰을 끈 채 동일 프롬프트 재실행했을 때 **캐시·Input이 소폭 감소**했다는 가정의 예시치(실측으로 교체).  
> **B-3(토큰)**: **TanStack Query skill만 비활성화**하고 워크스페이스 react/typescript·`queryOptions` 관례 문서는 유지한 재실행 가정 — B-2보다 캐시·Input은 크고 A보다 작은 **중간대** 예시치(실측으로 교체).

### 채점

> **구현 (첫 질문)** 열: 해당 시나리오 **실행 프롬프트 한 번**으로 나온 산출물(워킹 트리에 커밋·반영된 버전) 행별 점수. 시나리오 A·B는 **A** 열과 **동일**하게 채움(베이스라인 = 첫 질문).  
> **B-1** 열: 위 [대상 변경 (diff)](#대상-변경-diff)의 **B-1 참조 구현(고정)** 블록 코드 기준 정적 대조(항목당 0~2점). **A**·**B-2**·**B-3** 열은 Cursor 룰 on/off 실험 반복 시 채점( **A** 는 워킹 트리·베이스라인 산출물 기준).

> **B-2(채점)**: TanStack Query skill·`api`/`queries` 분리 룰이 약할 때 나온 산출물 가정 — `fetch`/`axios`를 컴포넌트(또는 단일 훅) 안에 두고 `import type`·`queryOptions`·`modules/api/jsonPlaceholder`(`getJsonPlaceholderUser` 등) 분리가 없는 경우의 정적 점수.

> **B-3(채점)**: **skill 없이** 워크스페이스 룰만으로 `queryOptions`·`queries.ts`는 맞췄으나 **`getJsonPlaceholderUser`를 `user.ts`로 분리하지 않고** `UserCard` 또는 `queries` 파일 내부에 인라인한 산출물 가정. 접근성은 `role`·`aria-busy` 수준만 있고 **`aria-live` 미사용** 등으로 **aria 행 1점** 처리.

| 확인 포인트                                                                 | 구현 (첫 질문) | A         | B-1       | B-2       | B-3       |
| --------------------------------------------------------------------------- | -------------- | --------- | --------- | --------- | --------- |
| `any` 없음 (콜백 파라미터 포함)                                             | 2              | 2         | 2         | 2         | 2         |
| `React.FC` 미사용                                                           | 2              | 2         | 2         | 2         | 2         |
| props가 named 타입으로 정의됨 (`export type UserCardProps`)                 | 2              | 2         | 2         | 2         | 2         |
| 도메인 타입 `JsonPlaceholderUser`가 `modules/types`에 분리됨                | 0              | 0         | 2         | 2         | 2         |
| `company`가 별도 named 타입(`type`/`interface`)로 분리됨 (중첩 inline 아님) | 0              | 0         | 0         | 0         | 0         |
| 화살표 함수로 컴포넌트 정의 (`export const UserCard = … =>`)                | 2              | 2         | 2         | 2         | 2         |
| `UserCard`에 exported 함수 return type 명시                                 | 0              | 0         | 0         | 0         | 0         |
| named export만 사용 (`export default` 없음)                                 | 0              | 0         | 2         | 2         | 2         |
| 도메인 타입 소비처에서 `import type` 사용 (예: API 모듈)                    | 0              | 0         | 2         | 0         | 2         |
| `queryOptions` + `useQuery`로 서버 상태 처리 (프로젝트 query 패턴)          | 0              | 0         | 2         | 0         | 2         |
| `getJsonPlaceholderUser`가 `modules/api/jsonPlaceholder`에 분리됨           | 0              | 0         | 2         | 0         | 0         |
| 시맨틱 HTML (`article`, `dl`, `dt`, `dd` 등)                                | 2              | 2         | 2         | 2         | 2         |
| `aria`·`role` (`aria-busy`, `aria-live`, `role="alert"` 등)                 | 2              | 2         | 2         | 2         | 1         |
| 무효 ID·로딩·에러·성공을 early return으로 분기 (깊은 중첩 `if` 없음)        | 2              | 2         | 2         | 2         | 2         |
| **소계**                                                                    | **16/28**      | **16/28** | **24/28** | **18/28** | **21/28** |

**B-1 열 감점 요약** (0~2점 행 기준, **B-1 참조 구현** 기준): `JsonPlaceholderUser.company`가 인라인 객체 타입이라 별도 named 타입 분리 없음 — **0점**. `UserCard`에 `JSX.Element` 등 반환 타입 미명시 — **0점**. 네트워크는 **`jsonPlaceholderApi`(axios)** + `user.ts`의 `getJsonPlaceholderUser`; 프롬프트의 “fetch” 표현과 무관하게 **API 모듈 분리**로 채점한다.

**A 열·워킹 트리** (`src/components/UserCard`): 인라인 타입·`export default`·인라인 `useQuery` 등으로 B-1 대비 상대 감점 — 소계 **16/28**(표 **A** 열).

---

## 시나리오 B — PostList 컴포넌트

**실행 프롬프트**

```
PostList 컴포넌트 만들어줘.
props로 userId를 받아서 JSONPlaceholder /posts?userId=:id 데이터 fetch해줘.
포스트마다 제목·본문을 표시하고, 제목으로 검색·필터링하는 input 포함해줘.
빈 결과·로딩·에러 상태 각각 처리해줘.
```

> 커버 룰: typescript §1 3 5 6 7 8 13 · react Hooks/State/Performance/Forms · code-quality §2 3 4 §7 · global Imports · TanStack Query(`queryOptions`·`useQuery`)

### 대상 변경 (diff)

**워킹 트리(실제 변경)** — 채점 표 **A** 열·실험 기록용.

- `src/components/PostList/PostList.tsx` — `userId`·`className` props, `URLSearchParams({ userId })`로 `GET https://jsonplaceholder.typicode.com/posts?userId=` + 인라인 `fetchPostsByUserId`(`AbortSignal`, `!ok` 시 `Error`), `useQuery`({ `queryKey`, `queryFn`, `enabled`: 양의 정수 `userId` }), `JsonPlaceholderPost` **파일 내부 `interface`**, `useState` 제목 검색어 + `useMemo`로 제목 부분 일치 필터, `import React` + `export default PostList`, `@/utils/shared`의 `classNames`, 무효 ID / 로딩(스켈레톤·`aria-busy`·`aria-label`) / 에러(`role="alert"`·`refetch`) / API 빈 목록(`role="status"`) / 성공 시 검색 무결과(`role="status"`)·`ul`/`li`/`h2`/`p`(제목·본문) early return, 검색 `input`에 `label`·`htmlFor`·`id` 연결
- `src/components/PostList/index.ts` — `export { default as PostList }`, `export type { PostListProps }` (`src/components/index.ts` 배럴 export는 **미포함**, 필요 시 `@/components/PostList` 직접 import)

**B-1 참조 구현(고정)** — 채점 표 **B-1** 열만 이 블록 기준. 워킹 트리와 다를 수 있음.

- `src/components/common/PostList/PostList.tsx`, `src/components/common/PostList/index.ts` — `PostList`·`PostListProps` named export (`src/components/index.ts` 배럴 export는 **미포함**, 필요 시 `@/components/common/PostList` 직접 import)
- `src/modules/api/jsonPlaceholder/post.ts` — `getJsonPlaceholderPosts`(`GetJsonPlaceholderPostsParams`: `userId?`, `q?`; `userId`는 `params`, `q`는 응답 배열 클라이언트 필터, 선택 인자 `signal?: AbortSignal`로 `axios` 취소 연동), `getJsonPlaceholderPost`, `createJsonPlaceholderPost`(`CreateJsonPlaceholderPostBody`), `updateJsonPlaceholderPost`(`PUT`), `deleteJsonPlaceholderPost`, `getJsonPlaceholderPostsByUserId`(내부 `getJsonPlaceholderPosts({ userId }, signal)` 호환). `axios` 인스턴스는 **`index.ts`의 `jsonPlaceholderApi` 재사용**
- `src/modules/stores/server/jsonPlaceholder/queries.ts` — `jsonPlaceholderQueries.postsByUser` (`queryOptions`, `enabled`와 무효 ID 정합)
- `src/modules/types/JsonPlaceholderPost.ts`

### 토큰 사용량

> **첫 질문** = 위 **실행 프롬프트** 블록만 넣어 Agent를 연 **최초 user 메시지 1회**에 대응하는 구간(첫 assistant 응답·같은 턴의 tool 호출까지 Usage에 합산되는 범위)을 뜻함.
>
> **A** 열: 첫 질문(베이스라인, 룰 비교 실험 전 동일 조건)에 대한 값. **B-1** 열: 기존 **구현(첫 질문)** 열에 두던 값과 **동일한 숫자**를 둠(구현 열은 비움). Git/diff로는 산출 불가 — Cursor **Settings → Usage**(또는 팀 리포트)에서 해당 요청의 breakdown을 복사해 **아래 예시를 실측으로 교체**.
>
> **B-2 …** 열: 동일 프롬프트를 룰 on/off 등 조건만 바꿔 재실행했을 때의 값.

| 항목        | 구현 (첫 질문) | A (첫 질문=베이스) | B-1       | B-2    | B-3     |
| ----------- | -------------- | ------------------ | --------- | ------ | ------- |
| Cache Read  |                | 191,488            | 1,032,000 | 72,192 | 111,616 |
| Cache Write |                | 0                  | 23,000    | 0      | 0       |
| Input       |                | 20,716             | 91,000    | 12,792 | 16,204  |
| Output      |                | 3,859              | 15,500    | 3,321  | 5,467   |
| **Total**   |                | 216,063            | 1,161,500 | 88,305 | 133,287 |

> 위 숫자는 **형식·합계 예시**(PostList 프롬프트가 UserCard보다 요구사항이 많아 A 시나리오 예시보다 Input·Output을 약간 크게 둔 임의값)이며, 보고·비교에는 반드시 **본인 첫 질문 Usage 실측**으로 바꿀 것.  
> **B-2(토큰)**: TanStack Query skill·`api`/`queries` 분리 룰을 끈 채 동일 프롬프트 재실행했을 때 **캐시·Input이 소폭 감소**했다는 가정의 예시치(실측으로 교체).  
> **B-3(토큰)**: **TanStack Query skill만 비활성화**하고 워크스페이스 react/typescript·`queryOptions` 관례 문서는 유지한 재실행 가정 — B-2보다 캐시·Input은 크고 A보다 작은 **중간대** 예시치(실측으로 교체).

### 채점

> **구현 (첫 질문)** 열: 시나리오 A 채점과 같이 **첫 프롬프트 산출물 = A 베이스**이면 **A** 열과 동일 숫자. 워킹 트리 `src/components/PostList` 기준.  
> **B-1** 열: 시나리오 B **대상 변경 (diff)**의 **B-1 참조 구현(고정)** 블록 코드 기준 정적 대조. **A**·**B-2**·**B-3** 열은 Cursor 룰 on/off 실험 반복 시 채점( **A** 는 워킹 트리·베이스라인 산출물 기준).
> **B-2(채점)**: TanStack Query·`api`/`queries` 분리 룰이 약할 때 나온 산출물 가정 — `fetch`/`axios`를 컴포넌트(또는 단일 훅) 안에 두고 `queryOptions`·`modules/api/jsonPlaceholder/post`(`getJsonPlaceholderPostsByUserId` 등)·`queries.postsByUser` 분리가 없고, 수동 `useState`/`useEffect`로 목록·로딩·에러만 관리하는 경우의 정적 점수.  
> **B-3(채점)**: **B-3(토큰)**과 동일 실험 조건에서 — `queryOptions`·`queries.ts`는 맞췄으나 **`getJsonPlaceholderPostsByUserId`를 `post.ts`로 분리하지 않고** `PostList` 또는 `queries` 파일 내부에 인라인한 산출물 가정. 제목 필터는 **클라이언트에서만** 처리하되 **`useMemo` 없이** 매 렌더 `.filter`만 두는 경우 **필터 메모이제이션 행 0점**. 접근성은 `role`·`aria-busy`·`aria-label` 수준만 있고 **`aria-live` 미사용** 등으로 **aria 행 1점** 처리.

| 확인 포인트                                                  | 구현 (첫 질문) | A         | B-1       | B-2       | B-3       |
| ------------------------------------------------------------ | -------------- | --------- | --------- | --------- | --------- |
| `any` 없음 (콜백 파라미터 포함)                              | 2              | 2         | 2         | 2         | 2         |
| `enum` 미사용                                                | 2              | 2         | 2         | 2         | 2         |
| fetch 상태를 `as const` + union type으로 정의                | 0              | 0         | 0         | 0         | 0         |
| fetch 상태를 discriminated union으로 정의                    | 0              | 0         | 0         | 2         | 0         |
| magic string 없음 (상태값 상수로 관리)                       | 0              | 0         | 0         | 0         | 0         |
| 좁은 타입 사용 (`string` 대신 리터럴 union)                  | 0              | 0         | 0         | 0         | 0         |
| named `interface`로 `Post` 타입 분리                         | 0              | 0         | 1         | 1         | 1         |
| exported 함수 return type 명시                               | 0              | 0         | 0         | 0         | 0         |
| named export 사용                                            | 0              | 0         | 2         | 2         | 2         |
| `import type` 사용                                           | 0              | 0         | 2         | 0         | 2         |
| fetch 로직 커스텀 훅으로 분리 (`usePostsByUserId`)           | 0              | 0         | 0         | 2         | 0         |
| 필터 로직 `useMemo`로 메모이제이션                           | 2              | 2         | 2         | 0         | 0         |
| 검색 핸들러 `useCallback`으로 메모이제이션                   | 0              | 0         | 0         | 0         | 0         |
| 하드코딩된 숫자/문자 없음 (상수로 분리)                      | 0              | 0         | 1         | 1         | 1         |
| 시맨틱 HTML (`ul`, `li`, `section`, `article` 등)            | 2              | 2         | 2         | 2         | 2         |
| `aria` 속성 사용 (`aria-label`, `aria-live`, `aria-busy` 등) | 2              | 2         | 2         | 0         | 1         |
| form input에 `label` 연결 (`htmlFor` + `id`)                 | 2              | 2         | 2         | 2         | 2         |
| 빈 결과 상태 별도 처리 (로딩·에러와 구분)                    | 2              | 2         | 2         | 1         | 2         |
| **소계**                                                     | **16/36**      | **16/36** | **20/36** | **17/36** | **19/36** |

**A 열·워킹 트리** (`src/components/PostList`): 인라인 타입·`export default`·인라인 `fetch`+`useQuery`·`queryOptions`/API 모듈 분리 없음 등으로 B-1 대비 상대 감점 — 소계 **16/36**(표 **A** 열).

**B-1 열 감점 요약**: 서버 상태는 **TanStack Query**(`jsonPlaceholderQueries.postsByUser`·`useQuery`)로 처리해, 체크리스트의 수동 **`as const`/discriminated union fetch 상태** 행과는 결이 달라 **각 0점**. 목록 조회는 **`post.ts`의 `getJsonPlaceholderPostsByUserId`**(구현상 `getJsonPlaceholderPosts({ userId })`)로 **`/posts?userId=`** 에 맞추고, **제목 검색 필터는 PostList 쪽 클라이언트 상태·`useMemo` 필터**로 처리(B-1 참조의 `post.ts`에는 시나리오 C와 공유되는 **`getJsonPlaceholderPosts`·`q`** 도 있으나 PostList 소비는 기존과 동일하게 **userId 목록 조회 중심**). **`jsonPlaceholderApi`는 `index.ts`와 공유**. 도메인 타입은 `type JsonPlaceholderPost`(`Post`/`interface` 명칭 아님) — **1점**. `PostList` 반환 타입 미명시 — **0점**. 목록 fetch는 **`usePostsByUserId`가 아니라** 컴포넌트 내 `useQuery` — 해당 행 **0점**. `import type`은 `post.ts`·타입 모듈에서 사용 — **2점**. `aria-live`·`aria-busy`·`role`·검색 `aria-controls` 등 — **aria 행 2점**. 문구·스켈레톤 반복 횟수 등 — **magic string/하드코딩 행 감점**.

---

## 시나리오 C — posts API 파일

**실행 프롬프트**

```
JSONPlaceholder /posts API 파일 만들어줘.
목록 조회(userId·검색어 파라미터), 단건 조회, 생성, 수정, 삭제 함수 포함해줘.
axios 인스턴스 기반으로 만들어줘.
```

> 커버 룰: api §1~12 전체 · typescript §1 4 6 10 11 15 16 · global Imports  
> 참고: JSONPlaceholder는 **공개 API**라 Reserve용 `setupInterceptors`(Bearer 등)를 붙이지 않는 구현이 타당함. 채점은 아래 **대상 변경** 코드 기준.

### 대상 변경 (diff)

- `src/modules/api/jsonPlaceholder/index.ts` — `jsonPlaceholderApi`(`axios.create`, `baseURL` `https://jsonplaceholder.typicode.com`; Reserve용 `setupInterceptors` 미적용). 시나리오 A·B와 **동일 인스턴스 공유**
- `src/modules/api/jsonPlaceholder/post.ts` — `jsonPlaceholderApi` **import** 후 posts 전용 함수만: `getJsonPlaceholderPosts`(`GetJsonPlaceholderPostsParams`: `userId?`, `q?`, 선택 `signal?: AbortSignal`), `getJsonPlaceholderPost`, `createJsonPlaceholderPost`(`CreateJsonPlaceholderPostBody`), `updateJsonPlaceholderPost`(`PUT` 전체 바디), `deleteJsonPlaceholderPost`, `getJsonPlaceholderPostsByUserId`(호환 래퍼, `signal` 전달)

### 토큰 사용량

> **첫 질문**·**A**·**B-1** 열 의미는 [시나리오 A](#시나리오-a--usercard-컴포넌트) 토큰 표와 동일.

| 항목        | 구현 (첫 질문) | A (첫 질문=베이스) | B-1    | B-2    | B-3    |
| ----------- | -------------- | ------------------ | ------ | ------ | ------ |
| Cache Read  |                | 70,656             | 87,552 | 66,560 | 77,056 |
| Cache Write |                | 0                  | 0      | 0      | 0      |
| Input       |                | 10,586             | 5,879  | 9,884  | 7,882  |
| Output      |                | 1,550              | 3,364  | 3,043  | 3,204  |
| **Total**   |                | 82,792             | 96,795 | 79,487 | 88,142 |

> Usage 숫자는 Cursor **Settings → Usage** 실측으로 채울 것.  
> **B-2(토큰)**: api §1~12·typescript 관련 룰/스킬을 끈 채 동일 프롬프트 재실행 시 **캐시·Input이 소폭 감소**했다는 가정의 예시치(실측으로 교체).  
> **B-3(토큰)**: **TanStack Query skill만 비활성화**(본 시나리오는 Query 미사용이나 실험 축 정렬)하고 워크스페이스 api/typescript·global Imports 관례는 유지한 재실행 가정 — B-2보다 캐시·Input은 크고 A보다 작은 **중간대** 예시치(실측으로 교체). 위 표 B-3 열은 B-1·B-2 실측(또는 예시) 사이 **선형 보간**으로 둔 자리표시자.

### 채점

> **구현 (첫 질문)** 열: 문서에 적어 둔 **A 베이스라인** 산출물(워킹 트리에 posts API가 없을 때의 가정 점수)과 동일하게 **A** 열을 복사. 실제 첫 질문 코드가 있으면 그에 맞게 수정.  
> **B-1** 열: 시나리오 C **대상 변경 (diff)**에 적힌 파일·함수 시그니처 기준 정적 대조. **A**·**B-2**·**B-3** 열은 Cursor 룰 on/off 실험 반복 시 채점.
> **B-2(채점)**: api/typescript·global Imports 룰이 약할 때의 산출물 가정 — `fetch`로 posts를 호출하거나 컴포넌트에서 `axios` 직접 생성, **`index.ts` 인스턴스 재사용 없음**, `import type`·제네릭·RORO·`q` 클라이언트 필터·CRUD 시그니처 중 다수 누락.  
> **B-3(채점)**: **B-3(토큰)**과 동일 실험 조건에서 — **`post.ts`에 `axios.create`를 또 두어** `index.ts`의 `jsonPlaceholderApi`와 **중복**하거나, `deleteJsonPlaceholderPost`가 **`AxiosResponse` 전체를 반환**하고, `getJsonPlaceholderPosts`에서 **`q`에 대한 클라이언트 필터가 없고** `params`에만 `q`를 실어 **무의미한 요청**만 하는 산출물 가정.

| 확인 포인트                                                                                                              | 구현 (첫 질문) | A         | B-1       | B-2       | B-3       |
| ------------------------------------------------------------------------------------------------------------------------ | -------------- | --------- | --------- | --------- | --------- |
| `any` 없음                                                                                                               | 2              | 2         | 2         | 2         | 2         |
| 도메인 전용 `axios.create` 인스턴스 (`jsonPlaceholderApi`, `baseURL` 명시) — **`index.ts` 단일 생성·`post.ts`는 재사용** | 2              | 2         | 2         | 0         | 0         |
| 내부 Reserve API와 분리 — 공개 API에 `setupInterceptors` 미적용(인증·토큰 인터셉터 없음)                                 | 0              | 0         | 2         | 2         | 2         |
| `get` / `post` / `put` / `delete` 응답에 제네릭 부착 (`JsonPlaceholderPost` 등)                                          | 2              | 2         | 2         | 1         | 2         |
| 목록 조회 `getJsonPlaceholderPosts` 파라미터 객체(RORO), `userId`는 `axios` `params` 전달                                | 2              | 2         | 2         | 2         | 2         |
| 검색어 `q`는 API 한계상 응답 배열 클라이언트 필터(제목·본문 부분 일치 등 동등 동작)                                      | 0              | 0         | 2         | 0         | 0         |
| 단건 조회 `getJsonPlaceholderPost(id: number)` 단일 인자                                                                 | 2              | 2         | 2         | 2         | 2         |
| `createJsonPlaceholderPost` payload: `Omit<JsonPlaceholderPost, 'id'>`(별칭 타입 허용)                                   | 1              | 1         | 2         | 2         | 2         |
| `updateJsonPlaceholderPost` — `PUT` + `(id, body)`에 전체 `JsonPlaceholderPost`                                          | 2              | 2         | 2         | 2         | 2         |
| `async/await`만 사용 (Promise 체이닝 없음)                                                                               | 2              | 2         | 2         | 1         | 2         |
| `return data` 패턴 (전체 `response` 미반환)                                                                              | 2              | 2         | 2         | 0         | 1         |
| 함수명 `get`/`create`/`update`/`delete` + `JsonPlaceholder` 도메인 접두어(프로젝트 관례)                                 | 0              | 0         | 2         | 2         | 2         |
| `fetch*` prefix·컴포넌트에서 `axios` 직접 호출 없음(API 모듈로 캡슐화)                                                   | 2              | 2         | 2         | 0         | 2         |
| named export만 사용 (`export default` 없음)                                                                              | 2              | 2         | 2         | 2         | 2         |
| 도메인 타입은 `import type` 사용                                                                                         | 0              | 0         | 2         | 0         | 2         |
| posts 관련 요청만 `post.ts`에 집중, 라우팅·모달·전역 상태 변경 등 side effect 없음                                       | 0              | 0         | 2         | 2         | 2         |
| **소계**                                                                                                                 | **21/32**      | **21/32** | **32/32** | **20/32** | **31/32** |

**B-1 열 요약**: **`jsonPlaceholderApi`는 `index.ts`에서 단일 `axios.create`**, **`post.ts`는 해당 인스턴스를 import**해 posts 전용 함수만 둔 형태. 채점은 위 **대상 변경**의 인스턴스 위치·재사용·CRUD·`q` 필터 동작·시그니처와 정합하면 만점.

---

## 시나리오 D — UserDashboard 페이지

**실행 프롬프트**

```
UserDashboard 페이지 만들어줘.
유저 목록(/users)을 fetch해서 테이블로 표시하고, 이름으로 검색 가능하게 해줘.
테이블 각 행을 키보드·마우스로 선택하면 해당 유저의 posts 목록(/posts?userId=:id)을
사이드패널에 표시해줘. posts도 별도로 fetch해줘.
유저·posts 각각 로딩·에러·빈 상태 모두 처리해줘.
```

> 커버 룰: architecture 전체 · react 전체 · typescript §3 5 6 7 8 · code-quality §2 3 4 §7 · global Imports

### 대상 변경 (diff)

**워킹 트리(실제 변경)** — 채점 표 **A** 열·실험 기록용.

- `src/components/UserDashboard/UserDashboard.tsx` — 페이지 단일 파일: `getJsonPlaceholderUsers`·`getJsonPlaceholderPostsByUserId` + 컴포넌트 내부 `useQuery` 두 번( `queryKey`: `['jsonplaceholder','users']` / `['jsonplaceholder','posts',userId]` , `queryFn`에 `signal` 전달; **`jsonPlaceholderQueries`·`queries.ts` 없음**). 네이티브 `table`·Tailwind(`choco`/`cool` 토큰)·이름 검색 `useState` + `useMemo`·`selectUser`/`handleListKeyDown` **`useCallback`**. 목록 래퍼 `div` `tabIndex={0}`·`role="region"`·`onKeyDown`에서 ↑↓·Home·End, 행 클릭으로 선택·`aria-selected`; 행은 `tabIndex={-1}`. 유저·게시글 각각 로딩(스켈레톤·**`aria-busy`·`aria-label`**)·에러(`role="alert"`·`refetch`)·빈·검색 무결과·패널 미선택(`role="status"`). 우측 `aside` 내 **`UserPostsPanel`**(함수 컴포넌트)에서 posts만 별도 `useQuery` + `ul`/`li`/`h3`/`p`( **`PostList` 미사용** ). 메인 UI 분기는 **중첩 삼항 대신 `if`/`let` 블록**(`no-nested-ternary` 대응).
- `src/components/UserDashboard/index.ts` — `export { default as UserDashboard } from './UserDashboard'` (`no-restricted-exports` 회피)
- `src/routes.tsx` — `Paths.USER_DASHBOARD` 자식 라우트, `UserDashboardPage`에 `React.lazy(() => import('@/components/UserDashboard/UserDashboard'))` 할당 후 `Suspense`로 감싸기
- `src/constants/Paths.ts` — `USER_DASHBOARD: '/task/user-dashboard'`
- `src/layout/Header.tsx` — `pathname` 세그먼트 `user-dashboard`일 때 제목 `'유저 대시보드'`, 멤버 드롭다운·`SearchBar` 노출 조건에서 **`user-dashboard` 제외**
- `src/modules/api/jsonPlaceholder/user.ts` — `JsonPlaceholderUserListItem` 타입·`getJsonPlaceholderUsers(signal?: AbortSignal)` (`GET /users`, **`jsonPlaceholderApi` 재사용**)
- (재사용·확장) `src/modules/api/jsonPlaceholder/post.ts` — `getJsonPlaceholderPostsByUserId(userId, signal?)` 등 시나리오 C와 동일 모듈; TanStack Query `queryFn`에서 **`AbortSignal` 연동**

**B-1 참조 구현(고정)** — 아래는 문서상 참조용이며 워킹 트리와 다를 수 있음.

- `src/routes/pages/UserDashboardPage.tsx` 등 — `jsonPlaceholderQueries.users`·`postsByUser`(`queryOptions`)·`LoadingSpinner` 등을 가정한 별도 설계

### 토큰 사용량

> **첫 질문**·**A**·**B-1** 열 의미는 [시나리오 A](#시나리오-a--usercard-컴포넌트) 토큰 표와 동일.

| 항목        | 구현 (첫 질문) | A (첫 질문=베이스) | B-1 | B-2     | B-3     |
| ----------- | -------------- | ------------------ | --- | ------- | ------- |
| Cache Read  |                | 872,448            |     | 306,176 | 385,024 |
| Cache Write |                | 0                  |     | 0       | 0       |
| Input       |                | 52,317             |     | 39,505  | 27,973  |
| Output      |                | 14,867             |     | 8,054   | 10,373  |
| **Total**   |                | 939,632            |     | 353,735 | 423,370 |

> Usage 숫자는 Cursor **Settings → Usage** 실측으로 채울 것.  
> **B-2(토큰)**: TanStack Query skill·`api`/`queries` 분리·architecture 룰을 끈 채 동일 프롬프트 재실행 시 **캐시·Input이 소폭 감소**했다는 가정의 예시치(실측으로 교체). UserDashboard는 시나리오 A·B 대비 요구 범위가 넓어 Input·Output을 약간 크게 둠.  
> **B-3(토큰)**: **TanStack Query skill만 비활성화**하고 워크스페이스 react/typescript·`queryOptions` 관례는 유지한 재실행 가정 — B-2보다 캐시·Input은 크고 A(첫 질문)보다 작은 **중간대** 예시치(실측으로 교체).

### 채점

> **구현 (첫 질문)** 열: 워킹 트리 `src/components/UserDashboard` 첫 질문 산출물이면 **A** 열과 동일하게 채움.  
> **B-1** 열: 시나리오 D **B-1 참조 구현(고정)** 블록 기준 정적 대조. 워킹 트리는 `UserPostsPanel`에서 `getJsonPlaceholderPostsByUserId` + `useQuery`로 posts를 **유저 쿼리와 독립**하게 가져와 **「별도 fetch」 행과 정합**( `jsonPlaceholderQueries.postsByUser` 유무는 B-1 대비 차이). **A**·**B-2**·**B-3** 열은 Cursor 룰 on/off 실험 반복 시 채점.
> **B-2(채점)**: TanStack Query·`api`/`queries` 분리 룰이 약할 때의 산출물 가정 — 유저·posts 모두 페이지(또는 단일 훅) 안에서 `fetch`/`axios` 직접 호출, `queryOptions`·`getJsonPlaceholderUsers`·`jsonPlaceholderQueries.users`·`postsByUser` 분리 없이 `useState`/`useEffect`로 로딩·에러만 관리하는 경우의 정적 점수.  
> **B-3(채점)**: **B-3(토큰)**과 동일 실험 조건에서 — `queryOptions`·`queries.ts`·`postsByUser`는 유지하나 **`getJsonPlaceholderUsers`를 `user.ts`로 분리하지 않고** `queries.ts`(또는 페이지)의 `queryFn`에 `jsonPlaceholderApi.get('/users')`를 **인라인**한 산출물 가정. posts는 **`post.ts`·`getJsonPlaceholderPostsByUserId` 분리는 유지**. 접근성은 `role`·`aria-label`·`aria-selected`·`role="alert"` 수준만 있고 **`aria-live` 미사용** 등으로 **aria 행 1점** 처리.

| 확인 포인트                                                                                                   | 구현 (첫 질문) | A         | B-1       | B-2       | B-3       |
| ------------------------------------------------------------------------------------------------------------- | -------------- | --------- | --------- | --------- | --------- |
| `any` 없음 (콜백 파라미터 포함)                                                                               | 2              | 2         | 2         | 2         | 2         |
| `enum` 미사용                                                                                                 | 2              | 2         | 2         | 2         | 2         |
| `as const` 객체로 fetch 상태 리터럴 상수화                                                                    | 0              | 0         | 0         | 0         | 0         |
| discriminated union으로 수동 fetch 상태 정의 (TanStack Query만 쓰면 해당 없음 → 0)                            | 0              | 0         | 0         | 0         | 0         |
| magic string 없음 (상태값·문구 상수화)                                                                        | 0              | 0         | 0         | 0         | 0         |
| 도메인 타입: 유저 `JsonPlaceholderUser`; posts `JsonPlaceholderPost` (`User`/`Post` 단순 명칭 아님)           | 0              | 0         | 1         | 1         | 1         |
| `React.FC` 미사용                                                                                             | 2              | 2         | 2         | 2         | 2         |
| global 룰 기준 named export 선호와의 정합 (페이지는 `export default` + lazy import 관례)                      | 0              | 0         | 0         | 0         | 0         |
| `import type` 사용                                                                                            | 2              | 2         | 2         | 0         | 2         |
| 페이지 파일 위치 `src/routes/pages/UserDashboardPage.tsx`                                                     | 0              | 0         | 2         | 2         | 2         |
| 경로 상수 `Paths.USER_DASHBOARD`가 `src/constants/Paths.ts`에 등록됨                                          | 2              | 2         | 2         | 2         | 2         |
| `@/` alias 사용                                                                                               | 2              | 2         | 2         | 2         | 2         |
| 유저 목록: `getJsonPlaceholderUsers` + `jsonPlaceholderQueries.users` + `useQuery` (API·queries·훅 패턴 분리) | 0              | 0         | 2         | 0         | 0         |
| posts는 별도 fetch (`useQuery`·`postsByUser`, 유저와 독립 캐시; `PostList` 사용 여부 무관)                    | 2              | 2         | 2         | 0         | 2         |
| 페이지 전용 훅을 `src/components/UserDashboard/hooks/` 등으로 분리한 구조                                     | 0              | 0         | 0         | 0         | 0         |
| 검색/필터 `useMemo` 사용                                                                                      | 2              | 2         | 2         | 0         | 2         |
| 이벤트·네비게이션 로직 `useCallback` 사용 (`selectUser`, `handleListKeyDown`)                                 | 2              | 2         | 2         | 0         | 2         |
| 레이아웃·패널·테이블이 단일 파일 (Template/Organism 수준 분리 없음)                                           | 0              | 0         | 0         | 0         | 0         |
| 하드코딩 최소화 (URL·문구·클래스 내 수치 등 상수화 수준)                                                      | 0              | 0         | 1         | 1         | 1         |
| 시맨틱 HTML (`header`, `aside`, `h1`/`h2`; 루트는 `div`, 네이티브 `table`/`section`/`main` 없음)              | 2              | 2         | 1         | 1         | 1         |
| `aria-*` (`aria-selected`, `aria-label`, `role`, `aria-busy`, 유저 로딩 `aria-live="polite"` 등)              | 2              | 2         | 1         | 0         | 1         |
| 키보드·마우스 선택 (행 클릭 + 포커스 가능 region에서 ↑↓·Home·End; 워킹 트리는 행 `Enter`/`Space` 없음)        | 2              | 2         | 2         | 2         | 2         |
| **소계**                                                                                                      | **24/44**      | **24/44** | **28/44** | **19/44** | **26/44** |

**B-1 열 감점 요약** (0~2점 행 기준): 유저·posts 모두 **TanStack Query**라 체크리스트의 **`as const`/discriminated union 수동 fetch 상태** 행과 결이 달라 **각 0점**. 문구·레이아웃 수치 **`h-[calc(100vh-60px-56px)]`** 등 — **magic string·하드코딩 행 감점**. 유저 타입은 **`JsonPlaceholderUserListItem`**, posts는 **`JsonPlaceholderPost`(`post.ts`)** — 체크리스트의 **`JsonPlaceholderUser` 명칭** 행은 **0~1점** 구간. 페이지 **`export default UserDashboard`** + lazy — **named export 선호 행 0점**. **`jsonPlaceholderQueries.users`/`postsByUser` 없음** — **유저 API·queries 분리 행 0점**. **`UserDashboard` 전용 훅 폴더·Organism 분리 없음** — **0점**. 루트 **`div`** 위주 — **시맨틱 1점**(B-1 기준). **`aria-live` 미사용** — 워킹 트리는 유저·게시글 로딩에 **`aria-busy`·`aria-label`** 있으나 B-1 설계 대비 **aria 행은 표의 B-1 열 기준 유지(1점)**.

**A 열·워킹 트리** (`src/components/UserDashboard` 등): `user.ts`·`post.ts` 분리 + 컴포넌트 내 이중 `useQuery`로 posts **별도 fetch**·**`useCallback`** 충족 → B-1 대비 **소계 +4**( **24/44** , 표 **A**·**구현 (첫 질문)** 열). 여전히 **`routes/pages`·`queryOptions` 레이어·`JsonPlaceholderUser` 단일 명칭** 등 B-1 대비 감점 요인 존재.

---

## 시나리오 E — 포스트 상태 상수 + 타입 정의

**실행 프롬프트**

```
포스트 상태값(draft, published, archived, deleted)을
TypeScript enum으로 쓰고 있는데, 룰에 맞게 바꿔줘.
관련 타입이랑 상수도 같이 정의해줘.
상태마다 표시용 한국어 라벨도 매핑해줘.
```

> 커버 룰: typescript §3 4 8 9 13 18 21 · code-quality §Constants Over Magic Numbers · global Imports

### 대상 변경 (diff)

**워킹 트리(실제 변경)** — 채점 표 **A** 열·실험 기록용.

- `src/modules/types/PostStatus.ts` — `POST_STATUS`(`as const`; 값 `draft` / `published` / `archived` / `deleted`), `PostStatus`는 `(typeof POST_STATUS)[keyof typeof POST_STATUS]`로 추출, `POST_STATUS_LABEL`은 `as const satisfies Record<PostStatus, string>`(초안·게시됨·보관됨·삭제됨). **`enum` 미사용.**

**B-1 참조(고정)** — 위 파일이 시나리오 E **B-1** 채점 기준과 동일 패턴이면 **A**·**B-1** 소계 정합.

### 토큰 사용량

> **첫 질문**·**A**·**B-1** 열 의미는 [시나리오 A](#시나리오-a--usercard-컴포넌트) 토큰 표와 동일.

| 항목        | 구현 (첫 질문) | A (첫 질문=베이스) | B-1 | B-2     | B-3    |
| ----------- | -------------- | ------------------ | --- | ------- | ------ |
| Cache Read  |                | 204,288            |     | 116,224 | 65,024 |
| Cache Write |                | 0                  |     | 0       | 0      |
| Input       |                | 21,289             |     | 10,609  | 13,874 |
| Output      |                | 2,377              |     | 2,298   | 1,143  |
| **Total**   |                | 227,954            |     | 129,131 | 80,041 |

> Usage 숫자는 Cursor **Settings → Usage** 실측으로 채울 것.  
> **B-2(토큰)**: typescript §3·§8·§21 등이 약한 설정에서 동일 프롬프트 재실행 시 **룰·스킬 컨텍스트가 줄어** Cache Read·Input이 다소 낮아졌다는 가정의 예시치(실측으로 교체).  
> **B-3(토큰)**: **typescript/cursor skill(해당 시나리오용 보조 스킬)만 비활성화**하고 워크스페이스 `typescript.mdc`·global Imports 관례는 유지한 재실행 가정 — B-2보다 캐시·Input은 크고 A(첫 질문)보다 작은 **중간대** 예시치(실측으로 교체). 위 B-3 열은 시나리오 D의 B-2→B-3 Total 비율(~1.16)을 E B-2 Total에 곱한 **자리표시자**.

### 채점

> **구현 (첫 질문)** 열: 워킹 트리에 `PostStatus.ts`가 **B-1과 동일 패턴**으로 있으면 **A** 열과 동일하게 채움(이전 **A 베이스**는 `PostStatus.ts` 없음·`enum` 등 미준수 가정 **20/22**).  
> **B-1** 열: 시나리오 E **대상 변경 (diff)**의 `PostStatus.ts` 기준 정적 대조. **A**·**B-2**·**B-3** 열은 Cursor 룰 on/off 실험 반복 시 채점.
> **B-2(채점)**: 위 룰이 약할 때의 산출물 가정 — `enum PostStatus { … }`로 상태값을 두고, 한국어 라벨은 `POST_STATUS_LABEL: Record<PostStatus, string>` 등으로만 두거나 키를 매직 스트링으로 나열하고, `as const`·`(typeof POST_STATUS)[keyof typeof POST_STATUS]`·`satisfies Record<PostStatus, string>` 패턴이 없는 경우의 정적 점수.  
> **B-3(채점)**: **B-3(토큰)**과 동일 실험 조건에서 — `POST_STATUS`는 `as const`·`PostStatus`는 `(typeof POST_STATUS)[keyof typeof POST_STATUS]`로 맞췄으나 **`POST_STATUS_LABEL`에 `satisfies Record<PostStatus, string>` 없이** `as const`만 적용하거나 `Record<PostStatus, string>` 타입 단언에 의존한 산출물 가정(상태 추가 시 라벨 누락을 컴파일 타임에 잡기 어려움). 나머지 행은 워크스페이스 룰에 맞춰 **B-2 대비 만점에 가깝게** 채점.

| 확인 포인트                                                   | 구현 (첫 질문) | A         | B-1       | B-2      | B-3       |
| ------------------------------------------------------------- | -------------- | --------- | --------- | -------- | --------- |
| `enum` 미사용                                                 | 2              | 2         | 2         | 0        | 2         |
| `as const` 객체로 상수 정의                                   | 2              | 2         | 2         | 0        | 2         |
| `(typeof CONST)[keyof typeof CONST]` 패턴으로 union type 추출 | 2              | 2         | 2         | 0        | 2         |
| 상수 객체명 UPPER_SNAKE_CASE (`POST_STATUS`)                  | 2              | 2         | 2         | 0        | 2         |
| 타입명 PascalCase (`PostStatus`)                              | 2              | 2         | 2         | 2        | 2         |
| 라벨 매핑 객체에 `satisfies Record<PostStatus, string>` 활용  | 2              | 2         | 2         | 0        | 0         |
| 라벨 매핑 객체도 `as const` 적용                              | 2              | 2         | 2         | 0        | 2         |
| `readonly` 적용 (불변 데이터 명시)                            | 2              | 2         | 2         | 0        | 2         |
| 타입 파일 위치 `src/modules/types/` 하위 제안                 | 2              | 2         | 2         | 2        | 2         |
| `import type`으로 타입만 import                               | 1              | 1         | 1         | 1        | 1         |
| `interface` 아닌 `type`으로 union 정의 (typescript §4 준수)   | 2              | 2         | 2         | 0        | 2         |
| **소계**                                                      | **21/22**      | **21/22** | **21/22** | **5/22** | **19/22** |

**A 열·워킹 트리** (`src/modules/types/PostStatus.ts`): `POST_STATUS`·`POST_STATUS_LABEL`·`as const`·union 추출·`satisfies Record<PostStatus, string>` 충족 → 표 **A**·**구현 (첫 질문)** 소계 **21/22**(B-1과 동일; 단일 파일이라 **`import type` 실증 행은 1점**).

**B-1 열 요약**: `POST_STATUS`·`POST_STATUS_LABEL`에 `as const`, `PostStatus`는 `(typeof POST_STATUS)[keyof typeof POST_STATUS]`로 추출. 라벨은 `satisfies Record<PostStatus, string>`로 키 완전성 검증. `readonly` 행은 별도 `Readonly<>`/`readonly` 한정자 없이 **`as const`로 속성이 읽기 전용 리터럴로 좁혀짐**으로 만점 처리(룰 §3·§9 취지 부합). `import type` 행은 **B-1 산출이 단일 타입/상수 파일이라 소비처에서의 `import type` 실증이 없음** → **1점**(소비 파일 추가 시 2점으로 상향 가능).

---

## 최종 집계

> **B 평균**: 시나리오별·전체 행 모두 **(B-1 + B-2 + B-3) / 3** — 소수는 첫째 자리 반올림.  
> **개선율**: `(B 평균 - A) / A × 100`(%) — 소수 첫째 자리 반올림(A가 0이면 정의하지 않음).

| 시나리오                 | 구현 (첫 질문) | A   | B-1 | B-2 | B-3 | B 평균 | 개선율   |
| ------------------------ | -------------- | --- | --- | --- | --- | ------ | -------- |
| A UserCard (/28)         | 16             | 16  | 24  | 18  | 21  | 21     | 31.3%    |
| B PostList (/36)         | 16             | 16  | 20  | 17  | 19  | 18.7   | 16.7%    |
| C posts API (/32)        | 21             | 21  | 32  | 20  | 31  | 27.7   | 31.7%    |
| D UserDashboard (/44)    | 24             | 24  | 28  | 19  | 26  | 24.3   | 1.4%     |
| E 상태 상수 + 타입 (/22) | 21             | 21  | 21  | 5   | 19  | 15     | −28.6%   |
| **전체 (/162)**          | **98**         | 98  | 125 | 79  | 116 | 106.7  | 8.8%     |

> **구현 (첫 질문)**·**A(Ref)**: 채점 표 **구현 (첫 질문)** 열 = 해당 시나리오 **첫 실행 프롬프트** 산출물 행별 점수. **A** 열과 숫자를 맞춤. 시나리오 A·B는 워킹 트리 `src/components/UserCard`(**16/28**)·`src/components/PostList`(**16/36**)와 대응하고, C는 **posts API** 워킹 트리(**21/32**), D는 **`src/components/UserDashboard`** 워킹 트리(**24/44**), E는 **`src/modules/types/PostStatus.ts`** 워킹 트리(**21/22**, B-1과 동일 패턴). B-1(참조 구현)과 체크 문구가 다를 수 있음 — 시나리오별 소계 합 **98/162**.  
> **B-1(Ref)**: 워킹 트리에 구현이 있는 시나리오만 기입. 시나리오 A **B-1** 열은 **B-1 참조 구현** 고정 기준 **24/28**(워킹 트리와 별도). B(PostList) **20/36**, C(posts API) **32/32**, D(UserDashboard) **28/44**, E(포스트 상태) `PostStatus.ts` 기준 **21/22** — 합계 **125/162**.  
> **B-2(Ref)**: 시나리오 E는 typescript §3·§21 등이 약한 가정 산출물 기준 **5/22**(아래 시나리오 E 채점 표 B-2 열). A·B·C·D의 B-2는 각 시나리오 **B-2(채점)** 설명·표를 따름. C(posts API) 가정 산출물 **20/32**.  
> **B-3(Ref)**: 시나리오 A **21/28**, B(PostList) **19/36**, C(posts API) **31/32**, D(UserDashboard) **26/44**, E(포스트 상태) **19/22**(각 **B-3(채점)** 가정·토큰 표 B-3 열은 예시치·자리표시자) — 합계 **116/162**.

### 토큰 사용량 전체 집계

> Cache Read가 높을수록 룰 파일이 캐시에서 효율적으로 읽히고 있다는 의미.
> A(룰 없음)와 B(룰 있음) Input 차이 = 룰 파일이 컨텍스트에 추가하는 토큰 비용.
> **B-3 합계** 열: 시나리오 A~E 본문 토큰 표 **B-3** 열의 합(시나리오 C·E B-3는 보간·비율 기반 **자리표시자** 포함).

| 항목        | A 합계    | B-1 합계  | B-2 합계    | B-3 합계    | B 평균      | A 대비 증감   |
| ----------- | --------- | --------- | ----------- | ----------- | ----------- | ------------- |
| Cache Read  | 1,632,256 | 1,119,552 | 910,848     | 905,984     | 978,795     | −40.0%        |
| Cache Write | 0         | 23,000    | 0           | 0           | 7,667       | —             |
| Input       | 125,363   | 96,879    | 96,908      | 82,473      | 92,087      | −26.5%        |
| Output      | 28,054    | 18,864    | 23,919      | 25,175      | 22,653      | −19.3%        |
| **Total**   | 1,785,673 | 1,258,295 | 1,031,675   | 1,013,632   | 1,101,201   | −38.3%        |

> **A 합계**: 시나리오 A~E 본문 토큰 표 **A (첫 질문=베이스)** 열의 합(예시치 기준 산술 합; 실측 Usage로 교체 시 각 시나리오 표부터 갱신).  
> **B-1 합계**: 본문 표에서 **B-1 열이 비어 있는 시나리오(A·D·E)** 는 **0으로만 합산**(예시치 기준). 실측으로 A·D·E의 B-1을 채우면 이 행을 다시 합산할 것.  
> **B 평균**: 동일 행의 **(B-1 합계 + B-2 합계 + B-3 합계) ÷ 3** — 소수는 반올림하여 정수로 표기.  
> **A 대비 증감**: 동일 행 **(B 평균 − A 합계) / A 합계 × 100**(%), 소수 첫째 자리 반올름. **Cache Write**는 A 합계가 0이라 비율을 두지 않음(—).

---

## 실패 케이스 기록

> 점수 1 이하인 항목 정리. rule 개선 인풋으로 활용.

```
- [ ] (시나리오 X) <포인트명> — <구체적 실패 내용>
```
