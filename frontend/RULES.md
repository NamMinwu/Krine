# Frontend Architecture

- Framework: Next.js (App Router)
- Language: TypeScript
- UI: Tailwind CSS
- Component: React
- State Management:
  - Server State: TanStack Query
  - Client/UI State: useState 또는 Zustand
  - Global Context: 반드시 필요한 경우에만 React Context 사용

## Architecture Rules

1. Server Component를 기본값으로 사용한다.
2. Client Component는 상호작용이 필요한 컴포넌트에서만 사용한다.
3. API 호출과 서버 데이터 관리는 TanStack Query를 사용한다.
4. 전역 상태가 필요하다고 판단될 때만 Zustand/Context를 사용한다.
5. Context는 Provider Pattern + Custom Hook 형태로 구현한다.
6. UI 컴포넌트는 비즈니스 로직과 분리한다.
7. 하나의 컴포넌트가 지나치게 많은 책임을 갖지 않도록 한다.
8. API 호출 로직은 UI 컴포넌트에서 직접 작성하지 않는다.
9. 도메인별로 코드를 그룹화한다.
10. 새로운 패턴을 도입하기 전에 기존 프로젝트의 패턴을 우선 재사용한다.

## Component Architecture

- 컴포넌트는 하나의 명확한 책임을 가진다.
- 컴포넌트는 기능/도메인을 기준으로 구성한다.
- 큰 컴포넌트는 의미 있는 UI 단위로 Composition한다.
- 단순히 코드 줄 수를 줄이기 위해 컴포넌트를 분리하지 않는다.
- 동일한 UI가 반복되거나 독립적인 책임을 가지는 경우 컴포넌트로 분리한다.
- 비즈니스 로직과 UI 표현을 가능한 한 분리한다.
- 복잡한 UI는 Compound Component Pattern을 고려한다.
- 새로운 추상화를 만들기 전에 기존 컴포넌트의 재사용 가능성을 확인한다.
- Server Component와 Client Component의 경계를 명확하게 유지한다.

## State Management Rules

1. 상태를 추가하기 전에 해당 값이 정말 상태인지 판단한다.
2. 다른 상태로부터 계산 가능한 값은 상태로 저장하지 않는다.
3. 서버 데이터는 useState에 저장하지 않는다.
4. 서버 데이터는 Server Component 또는 TanStack Query를 사용한다.
5. URL로 표현 가능한 상태는 URL Search Params를 사용한다.
6. 상태는 가능한 한 사용하는 컴포넌트 가까이에 배치한다. (State Colocation)
7. 여러 컴포넌트가 공유해야 할 때만 상태를 상위 컴포넌트로 이동한다.
8. 전역 상태는 최후의 수단으로 사용한다.
9. Context/Zustand를 사용하기 전에 Local State와 URL State로 해결할 수 있는지 확인한다.
10. 상태 간 동기화를 위해 중복 상태를 만들지 않는다.
11. useEffect를 상태 동기화 용도로 사용하지 않는다.

## Directory Convention

- 특정 라우트에서만 쓰는 UI는 그 라우트의 `_components/` 프라이빗 폴더에 콜로케이션한다.
- 여러 라우트가 공유하는 UI는 공유 범위의 최소 공통 조상 세그먼트의 `_components/`에 둔다.
- 도메인 로직(쿼리·라벨·판정)은 `src/domains/`에 둔다.

## 규칙 우회 절차

1. 어떤 규칙이든 우회가 필요하다고 판단되면, **코드를 작성하기 전에 먼저 사용자에게 물어 승인을 받는다.**
2. 승인된 우회는 아래 "현재 알려진 예외" 섹션에 **이유와 해소 조건**을 함께 기록한다.
3. 무기록 우회는 금지 — 우회 자체보다 기록 없는 우회가 부패를 만든다.

## 자동 집행

기계 검증 가능한 규칙은 ESLint로 강제한다 (`npm run lint`):

- 규칙 3·8 (컴포넌트에서 API 직접 호출 금지) → `no-restricted-imports`가 `.tsx`에서 `@/domains/*/api` import를 차단

## 현재 알려진 예외 (제출 후 해소 예정)

- 규칙 1·2: 페이지 전반이 Client Component — 상호작용 중심 앱 특성 + 마감 제약으로 유예.
  전환 시 데이터 페칭은 Server Component로, 상호작용은 client island로 분리한다.
