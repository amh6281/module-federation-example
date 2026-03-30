# Zustand Store Acceptance Criteria (TypeScript)

**Library**: Zustand  
**Purpose**: Skill testing acceptance criteria for validating generated code correctness  
**Pattern**: Custom `createStore` wrapper with devtools/immer middleware

---

## 1. Correct Import Patterns

### 1.1 Core Imports

#### ✅ CORRECT: createStore Wrapper Import
```typescript
import { createStore } from '@/modules/stores/client';
```

#### ✅ CORRECT: shallow Import for Selectors
```typescript
import { shallow } from 'zustand/shallow';
```

### 1.2 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Direct zustand create import
```typescript
// WRONG - don't use zustand create directly
import { create } from 'zustand';

// CORRECT - use createStore wrapper
import { createStore } from '@/modules/stores/client';
```

---

## 2. Store Creation Patterns

### 2.1 ✅ CORRECT: Basic Store with createStore
```typescript
import { createStore } from '@/modules/stores/client';

interface MyStore {
  count: number;
  actions: {
    increment: () => void;
  };
}

export const useMyStore = createStore<MyStore>(
  set => ({
    count: 0,
    actions: {
      increment: () => set(state => ({ count: state.count + 1 }), false, 'myStore/increment'),
    },
  }),
  'myStore',
);
```

### 2.2 ✅ CORRECT: With get() Access
```typescript
export const useMyStore = createStore<MyStore>(
  (set, get) => ({
    count: 0,
    actions: {
      increment: () => set(state => ({ count: state.count + 1 }), false, 'myStore/increment'),
      double: () => {
        const current = get().count;
        set({ count: current * 2 }, false, 'myStore/double');
      },
    },
  }),
  'myStore',
);
```

### 2.3 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Missing createStore wrapper
```typescript
// WRONG - should use createStore wrapper
import { create } from 'zustand';
export const useMyStore = create<MyStore>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// CORRECT - use createStore wrapper
import { createStore } from '@/modules/stores/client';
export const useMyStore = createStore<MyStore>(
  set => ({
    count: 0,
    actions: {
      increment: () => set(state => ({ count: state.count + 1 }), false, 'myStore/increment'),
    },
  }),
  'myStore',
);
```

#### ❌ INCORRECT: Missing store name parameter
```typescript
// WRONG - store name is required for devtools
export const useMyStore = createStore<MyStore>(
  set => ({ count: 0 }),
);

// CORRECT - include store name
export const useMyStore = createStore<MyStore>(
  set => ({ count: 0 }),
  'myStore',
);
```

---

## 3. State and Actions Pattern

### 3.1 ✅ CORRECT: Combined Interface with actions Property
```typescript
export interface MyStore {
  // State properties
  items: Item[];
  isLoading: boolean;
  selectedId?: number;
  
  // Actions grouped in actions object
  actions: {
    addItem: (item: Item) => void;
    removeItem: (id: number) => void;
    setSelectedId: (id: number) => void;
    loadItems: () => Promise<void>;
  };
}
```

### 3.2 ✅ CORRECT: Store Implementation with actions
```typescript
export const useMyStore = createStore<MyStore>(
  set => ({
    // State
    items: [],
    isLoading: false,
    selectedId: undefined,

    // Actions
    actions: {
      addItem: (item: Item) => {
        set(state => ({ items: [...state.items, item] }), false, 'myStore/addItem');
      },
      removeItem: (id: number) => {
        set(state => ({ items: state.items.filter(i => i.id !== id) }), false, 'myStore/removeItem');
      },
      setSelectedId: (id: number) => {
        set({ selectedId: id }, false, 'myStore/setSelectedId');
      },
      loadItems: async () => {
        set({ isLoading: true }, false, 'myStore/loadItems');
        try {
          const items = await fetchItems();
          set({ items, isLoading: false }, false, 'myStore/loadItems');
        } catch (error) {
          set({ isLoading: false }, false, 'myStore/loadItems');
        }
      },
    },
  }),
  'myStore',
);
```

### 3.3 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Separating State and Actions into different interfaces
```typescript
// WRONG - don't separate into different interfaces
export interface MyState {
  items: Item[];
}
export interface MyActions {
  addItem: (item: Item) => void;
}
export type MyStore = MyState & MyActions;

// CORRECT - combine in single interface with actions property
export interface MyStore {
  items: Item[];
  actions: {
    addItem: (item: Item) => void;
  };
}
```

#### ❌ INCORRECT: Actions not grouped in actions property
```typescript
// WRONG - actions should be grouped
export interface MyStore {
  items: Item[];
  addItem: (item: Item) => void;
}

// CORRECT - actions grouped in actions object
export interface MyStore {
  items: Item[];
  actions: {
    addItem: (item: Item) => void;
  };
}
```

---

## 4. Using Immer for Updates

### 4.1 ✅ CORRECT: Direct Mutations with Immer
```typescript
// The immer middleware allows direct mutations
set(
  state => {
    state.items.push(newItem); // Direct mutation (immer handles immutability)
    state.isLoading = false;
  },
  false,
  'myStore/addItem',
);
```

### 4.2 ✅ CORRECT: Functional Updates (also works)
```typescript
set(state => ({ items: [...state.items, newItem] }), false, 'myStore/addItem');
```

### 4.3 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Mutating state without immer callback
```typescript
// WRONG - don't mutate state directly outside set callback
const state = useMyStore.getState();
state.items.push(newItem); // This won't trigger updates

// CORRECT - use set with immer callback
set(state => {
  state.items.push(newItem);
}, false, 'myStore/addItem');
```

---

## 5. Selector Patterns

### 5.1 ✅ CORRECT: Individual Selectors
```typescript
// Good - only re-renders when `items` changes
const items = useMyStore(state => state.items);

// Good - selecting actions
const { addItem } = useMyStore(state => state.actions);
```

### 5.2 ✅ CORRECT: Multiple Selectors with shallow
```typescript
import { shallow } from 'zustand/shallow';

// Good - only re-renders when selected values change
const { items, isLoading } = useMyStore(
  state => ({
    items: state.items,
    isLoading: state.isLoading,
  }),
  shallow,
);
```

### 5.3 ✅ CORRECT: Multiple Selectors in Component
```typescript
function MyComponent() {
  const items = useMyStore(state => state.items);
  const { addItem } = useMyStore(state => state.actions);
  
  return <button onClick={() => addItem(newItem)}>{items.length}</button>;
}
```

### 5.4 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Destructuring entire store
```typescript
// WRONG - re-renders on any state change
const { items, isLoading } = useMyStore();
```

#### ❌ INCORRECT: Creating new objects without shallow
```typescript
// WRONG - creates new object reference every render, causes unnecessary re-renders
const data = useMyStore(state => ({
  items: state.items,
  isLoading: state.isLoading,
}));

// CORRECT - use shallow for object selectors
import { shallow } from 'zustand/shallow';
const data = useMyStore(
  state => ({
    items: state.items,
    isLoading: state.isLoading,
  }),
  shallow,
);
```

---

## 6. Accessing Actions

### 6.1 ✅ CORRECT: Accessing Actions
```typescript
// Access all actions
const { addItem, removeItem } = useMyStore(state => state.actions);

// Access single action
const addItem = useMyStore(state => state.actions.addItem);

// Access in component
function MyComponent() {
  const { addItem } = useMyStore(state => state.actions);
  return <button onClick={() => addItem(newItem)}>Add</button>;
}
```

### 6.2 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Accessing actions without actions property
```typescript
// WRONG - actions are in actions property
const addItem = useMyStore(state => state.addItem);

// CORRECT - access through actions property
const addItem = useMyStore(state => state.actions.addItem);
```

---

## 7. Using get() for Computed Values

### 7.1 ✅ CORRECT: Computed Values with get()
```typescript
export interface Accounts {
  accounts: UserAccount[];
  actions: {
    addAccount: (account: UserAccount) => void;
  };
  getAccount: (userId: string) => UserAccount | undefined;
}

export const useAccountsStore = createStore<Accounts>(
  (set, get) => ({
    accounts: [],
    actions: {
      addAccount: (account: UserAccount) => {
        set(state => ({ accounts: [...state.accounts, account] }), false, 'accounts/addAccount');
      },
    },
    getAccount: (userId: string) => get().accounts.find(account => account.member.userId === userId),
  }),
  'accounts',
);
```

---

## 8. Action Enum Pattern (Optional but Recommended)

### 8.1 ✅ CORRECT: Using Action Enums
```typescript
enum MyStoreActions {
  ADD_ITEM = 'myStore/addItem',
  REMOVE_ITEM = 'myStore/removeItem',
  SET_SELECTED_ID = 'myStore/setSelectedId',
}

export const useMyStore = createStore<MyStore>(
  set => ({
    items: [],
    actions: {
      addItem: (item: Item) => {
        set(state => ({ items: [...state.items, item] }), false, MyStoreActions.ADD_ITEM);
      },
      removeItem: (id: number) => {
        set(state => ({ items: state.items.filter(i => i.id !== id) }), false, MyStoreActions.REMOVE_ITEM);
      },
    },
  }),
  'myStore',
);
```

### 8.2 ✅ CORRECT: Action String Literals (also acceptable)
```typescript
// Using string literals is also acceptable
set(state => ({ items: [...state.items, item] }), false, 'myStore/addItem');
```

---

## 9. Persist Support

### 9.1 ✅ CORRECT: Persist to localStorage
```typescript
export const useSettingsStore = createStore<SettingsStore>(
  set => ({
    theme: 'dark',
    actions: {
      setTheme: (theme: string) => set({ theme }, false, 'settings/setTheme'),
    },
  }),
  'settings',
  {
    name: 'settings-storage', // localStorage key
    partialize: state => ({ theme: state.theme }), // Only persist selected fields
  },
);
```

---

## 10. Async Actions

### 10.1 ✅ CORRECT: Async Action Pattern
```typescript
export const useDataStore = createStore<DataStore>(
  set => ({
    data: null,
    isLoading: false,
    error: null,
    actions: {
      fetchData: async (id: string) => {
        set({ isLoading: true, error: null }, false, 'data/fetchData');
        try {
          const response = await api.getData(id);
          set({ data: response, isLoading: false }, false, 'data/fetchData');
        } catch (error) {
          set({ error: error.message, isLoading: false }, false, 'data/fetchData');
        }
      },
    },
  }),
  'data',
);
```

---

## 11. File Structure

### 11.1 ✅ CORRECT: Store File Location
```
src/modules/stores/client/
  ├── index.ts          # createStore wrapper
  ├── modal.ts          # Modal store
  ├── search.ts         # Search store
  └── reservationModal.ts # Reservation modal store
```

### 11.2 ✅ CORRECT: Export Pattern
```typescript
// In modal.ts
export interface ModalState { ... }
export const useModalStore = createStore<ModalState>(...);

// In component
import { useModalStore } from '@/modules/stores/client/modal';
```

---

## 12. Complete Example

### 12.1 ✅ CORRECT: Complete Store Implementation
```typescript
import { createStore } from '@/modules/stores/client';

export interface SearchState {
  search: string;
  searchTargets: 'all' | 'title' | 'member';
  startDateTime: string;
  endDateTime: string;
  isSearched: boolean;
  actions: {
    clearSearch: () => void;
    setSearch: (payload: {
      search: string;
      searchTargets: SearchState['searchTargets'];
      isSearched: boolean;
    }) => void;
    setTime: (payload: { startDateTime: string; endDateTime: string }) => void;
  };
}

enum SearchActions {
  CLEAR_SEARCH = 'search/clearSearch',
  SET_SEARCH = 'search/setSearch',
  SET_TIME = 'search/setTime',
}

export const useSearchStore = createStore<SearchState>(
  set => ({
    search: '',
    searchTargets: 'all',
    startDateTime: '',
    endDateTime: '',
    isSearched: false,
    actions: {
      clearSearch: () => {
        set(
          {
            search: '',
            searchTargets: 'all',
            startDateTime: '',
            endDateTime: '',
            isSearched: false,
          },
          false,
          SearchActions.CLEAR_SEARCH,
        );
      },
      setSearch: payload => {
        set(
          { search: payload.search, searchTargets: payload.searchTargets, isSearched: payload.isSearched },
          false,
          SearchActions.SET_SEARCH,
        );
      },
      setTime: payload => {
        set(
          {
            startDateTime: payload.startDateTime,
            endDateTime: payload.endDateTime,
          },
          false,
          SearchActions.SET_TIME,
        );
      },
    },
  }),
  'search',
);
```

---

## 13. Anti-Patterns Summary

### 13.1 ❌ Common Mistakes
```typescript
// WRONG - using zustand create directly
import { create } from 'zustand';
export const useStore = create<Store>()((set) => ({}));

// WRONG - missing actions property grouping
export interface Store {
  items: Item[];
  addItem: (item: Item) => void; // Should be in actions
}

// WRONG - destructuring entire store
const { items, isLoading } = useStore();

// WRONG - creating objects without shallow
const data = useStore(state => ({ items: state.items }));

// WRONG - missing store name
createStore<Store>(set => ({}));

// WRONG - accessing actions incorrectly
const addItem = useStore(state => state.addItem); // Should be state.actions.addItem

// CORRECT - proper pattern
import { createStore } from '@/modules/stores/client';
import { shallow } from 'zustand/shallow';

export interface Store {
  items: Item[];
  actions: {
    addItem: (item: Item) => void;
  };
}

export const useStore = createStore<Store>(
  set => ({
    items: [],
    actions: {
      addItem: (item) => set(state => ({ items: [...state.items, item] }), false, 'store/addItem'),
    },
  }),
  'store',
);

// Usage
const items = useStore(state => state.items);
const { addItem } = useStore(state => state.actions);
const { items, isLoading } = useStore(
  state => ({ items: state.items, isLoading: state.isLoading }),
  shallow,
);
```
