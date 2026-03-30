---
name: zustand
description: >-
  Creates Zustand stores with TypeScript, devtools/immer middleware, and proper state/action separation using createStore wrapper.
  Uses actions property for grouping, immer for immutable updates, and selectors for performance.
  Use when building React state management, creating global stores for UI state, managing modal/dialog state, form state, search/filter state, or any client-side state that needs to be shared across components.
---

# Zustand Store

Creates Zustand stores following project patterns with proper TypeScript types, devtools/immer middleware, and custom createStore wrapper.

## Workflow

### Step 1: Create Store File

Create store file in `src/modules/stores/client/`:

```
src/modules/stores/client/
  ├── index.ts          # createStore wrapper
  ├── modal.ts          # Modal store
  ├── search.ts         # Search store
  └── myStore.ts        # Your new store
```

Use `assets/template.ts` as a starting point. Replace `{{StoreName}}`, `{{storeName}}`, `{{description}}` placeholders.

### Step 2: Define Interface

Define interface with state and `actions` property:

```typescript
export interface MyStore {
	items: Item[];
	isLoading: boolean;
	error: string | null;
	actions: {
		setItems: (items: Item[]) => void;
		setLoading: (loading: boolean) => void;
		loadItems: () => Promise<void>;
		reset: () => void;
	};
}
```

Required rules:
- Combine state and actions in a single interface
- Group all actions inside `actions` property
- Use TypeScript types for all properties

### Step 3: Use createStore Wrapper

Always use `createStore` wrapper (never use `create` directly):

```typescript
import { createStore } from '@/modules/stores/client';

export const useMyStore = createStore<MyStore>(
	set => ({
		items: [],
		isLoading: false,
		error: null,
		actions: {
			setItems: items => {
				set({ items }, false, 'myStore/setItems');
			},
			setLoading: isLoading => {
				set({ isLoading }, false, 'myStore/setLoading');
			},
			loadItems: async () => {
				set({ isLoading: true, error: null }, false, 'myStore/loadItems');
				try {
					const items: Item[] = [];
					set({ items, isLoading: false }, false, 'myStore/loadItems');
				} catch (error) {
					set(
						{ error: error instanceof Error ? error.message : 'Failed', isLoading: false },
						false,
						'myStore/loadItems',
					);
				}
			},
			reset: () => {
				set({ items: [], isLoading: false, error: null }, false, 'myStore/reset');
			},
		},
	}),
	'myStore',
);
```

Required rules:
- Use `createStore` wrapper from `@/modules/stores/client`
- Store name parameter is required (for devtools)
- Use immer for direct mutations in `set` callbacks
- Include action type string as third parameter to `set`

### Step 4: Use Immer for Updates

The `immer` middleware allows direct mutations:

```typescript
actions: {
	addItem: item => {
		set(state => { state.items.push(item); }, false, 'myStore/addItem');
	},
}
```

### Step 5: Use Selectors in Components

Avoid full store destructuring. Use individual selectors or `shallow`:

```typescript
// Good: Individual selector
const items = useMyStore(state => state.items);
const { loadItems } = useMyStore(state => state.actions);

// Good: Multiple values with shallow
import { shallow } from 'zustand/shallow';
const { items, isLoading } = useMyStore(
	state => ({ items: state.items, isLoading: state.isLoading }),
	shallow,
);

// Bad: Full destructuring
const { items, isLoading, actions } = useMyStore();
```

## Validation Checklist

Verify generated code follows:

- [ ] Uses `createStore` wrapper (never `create` directly)
- [ ] Actions grouped inside `actions` property
- [ ] Store name parameter provided (for devtools)
- [ ] Uses individual selectors or `shallow` (avoids full destructuring)
- [ ] Uses immer for direct mutations in `set` callbacks
- [ ] File is in correct location: `src/modules/stores/client/`

## References

For detailed acceptance criteria, anti-patterns, and validation rules, see [acceptance-criteria.md](./references/acceptance-criteria.md).
