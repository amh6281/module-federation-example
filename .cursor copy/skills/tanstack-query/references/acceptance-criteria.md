# TanStack Query Acceptance Criteria (TypeScript)

**Library**: TanStack Query (React Query)  
**Purpose**: Skill testing acceptance criteria for validating generated code correctness  
**Pattern**: queryOptions with query factories, separate queries/mutations/selectors files

---

## 1. Correct Import Patterns

### 1.1 Core Imports

#### ✅ CORRECT: `queryOptions` Import

```typescript
import { queryOptions } from '@tanstack/react-query';
```

#### ✅ CORRECT: `useQuery`, `useMutation` Imports

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
```

### 1.2 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Direct `useQuery` without `queryOptions`

```typescript
// WRONG - don't define queries inline
const { data } = useQuery({
	queryKey: ['items'],
	queryFn: fetchItems,
});

// CORRECT - use queryOptions in queries.ts
const { data } = useQuery({ ...itemQueries.items() });
```

---

## 2. Query Factory Pattern

### 2.1 ✅ CORRECT: Query Factory with `all()` Method

```typescript
import { getResourceTypes, getResourceType } from '@/modules/api/reserve/resourceType';
import { queryOptions } from '@tanstack/react-query';

export const resourceTypeQueries = {
	all: () => ['resourceTypes'],
	resourceTypes: () => queryOptions({ queryKey: [...resourceTypeQueries.all()], queryFn: getResourceTypes }),
	resourceType: (resourceTypeId: number) =>
		queryOptions({
			queryKey: ['resourceType', resourceTypeId],
			queryFn: () => getResourceType(resourceTypeId),
			enabled: !!resourceTypeId,
		}),
};
```

### 2.2 ✅ CORRECT: Nested Query Keys

```typescript
import { getReservationsByType } from '@/modules/api/reserve/reservation';
import { queryOptions } from '@tanstack/react-query';

export const reservationsQueries = {
	all: () => ['reservations'],
	listByType: (params: {
		resourceTypeId: number;
		startDateTime: string;
		endDateTime: string;
		searchData?: { search: string; searchTargets: string };
		timeGmt?: string;
	}) =>
		queryOptions({
			queryKey: [...reservationsQueries.all(), 'byType', params],
			queryFn: () => getReservationsByType(params),
		}),
};
```

### 2.3 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Missing `all()` Method

```typescript
// WRONG - should have all() method
export const itemQueries = {
	items: () =>
		queryOptions({
			queryKey: ['items'],
			queryFn: getItems,
		}),
};

// CORRECT - include all() method
export const itemQueries = {
	all: () => ['items'],
	items: () =>
		queryOptions({
			queryKey: [...itemQueries.all()],
			queryFn: getItems,
		}),
};
```

#### ❌ INCORRECT: String Query Keys instead of Arrays

```typescript
// WRONG - query keys must be arrays
queryKey: 'items';

// CORRECT - use array
queryKey: ['items'];
```

---

## 3. Query Options Pattern

### 3.1 ✅ CORRECT: Using `queryOptions`

```typescript
import { getProfile } from '@/modules/api/member/config';
import { queryOptions } from '@tanstack/react-query';

export const userQueries = {
	all: () => ['user'],
	profile: () =>
		queryOptions({
			queryKey: [...userQueries.all(), 'profile'],
			queryFn: () => getProfile(),
		}),
};
```

### 3.2 ✅ CORRECT: `enabled` Option for Dependent Queries

```typescript
import { getResourceType } from '@/modules/api/reserve/resourceType';
import { queryOptions } from '@tanstack/react-query';

export const resourceTypeQueries = {
	all: () => ['resourceTypes'],
	resourceType: (resourceTypeId: number) =>
		queryOptions({
			queryKey: ['resourceType', resourceTypeId],
			queryFn: () => getResourceType(resourceTypeId),
			enabled: !!resourceTypeId, // Only run when resourceTypeId exists
		}),
};
```

### 3.3 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Not using `queryOptions`

```typescript
// WRONG - define query inline
export const useItems = () => {
	return useQuery({
		queryKey: ['items'],
		queryFn: getItems,
	});
};

// CORRECT - use queryOptions in queries.ts
export const itemQueries = {
	all: () => ['items'],
	items: () =>
		queryOptions({
			queryKey: [...itemQueries.all()],
			queryFn: getItems,
		}),
};
```

---

## 4. Using Queries in Components

### 4.1 ✅ CORRECT: Spread Query Options

```typescript
import { useQuery } from '@tanstack/react-query';
import { resourceTypeQueries } from '@/modules/stores/server/resourceType/queries';

const { data: resourceTypes, isLoading } = useQuery({ ...resourceTypeQueries.resourceTypes() });
```

### 4.2 ✅ CORRECT: With Selector

```typescript
import { selectIsAdministrator } from '@/modules/stores/server/user/selectors';

const { data: isAdministrator } = useQuery({
	...userQueries.profile(),
	select: selectIsAdministrator,
});
```

### 4.3 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Not spreading query options

```typescript
// WRONG - don't pass query directly
const { data } = useQuery(resourceTypeQueries.resourceTypes());

// CORRECT - spread the options
const { data } = useQuery({ ...resourceTypeQueries.resourceTypes() });
```

#### ❌ INCORRECT: Defining queries in components

```typescript
// WRONG - queries should be in queries.ts
function MyComponent() {
	const { data } = useQuery({
		queryKey: ['items'],
		queryFn: getItems,
	});
}

// CORRECT - use queries from queries.ts
function MyComponent() {
	const { data } = useQuery({ ...itemQueries.items() });
}
```

---

## 5. Mutations Pattern

### 5.1 ✅ CORRECT: Mutation with `setQueryData` and Error Handling

```typescript
import { ModalType } from '@/constants';
import { getErrorMessage } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '@/modules/stores/client/modal';
import { resourceTypeQueries } from './queries';

export const useCreateResourceType = () => {
	const navigate = useNavigate();
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (resourceType: Partial<ResourceType>) => createResourceType(resourceType),
		onSuccess: data => {
			// Navigate if needed
			// navigate(Paths.RESOURCE_TYPES_MANAGE);

			queryClient.setQueryData(resourceTypeQueries.resourceTypes().queryKey, prev => {
				if (!prev) return prev;
				return {
					...prev,
					value: [...prev.value, data],
					total: prev.total + 1,
				};
			});
		},
		onError: error => {
			openModal({
				type: ModalType.ALERT,
				message: getErrorMessage(error.response?.data?.error),
			});
		},
	});
};
```

### 5.2 ✅ CORRECT: Update Multiple Cache Entries

```typescript
import { ModalType } from '@/constants';
import { getErrorMessage } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '@/modules/stores/client/modal';
import { resourceTypeQueries } from './queries';

export const useUpdateResourceType = () => {
	const navigate = useNavigate();
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (resourceType: Partial<ResourceType>) => updateResourceType(resourceType),
		onSuccess: data => {
			// Navigate if needed
			// navigate(Paths.RESOURCE_TYPES_MANAGE);

			// Update list cache
			queryClient.setQueryData(resourceTypeQueries.resourceTypes().queryKey, prev => {
				if (!prev) return prev;
				return {
					...prev,
					value: prev.value.map(item => (item.resourceTypeId === data.resourceTypeId ? data : item)),
				};
			});
			// Update detail cache
			queryClient.setQueryData(resourceTypeQueries.resourceType(data.resourceTypeId).queryKey, data);
		},
		onError: error => {
			openModal({
				type: ModalType.ALERT,
				message: getErrorMessage(error.response?.data?.error),
			});
		},
	});
};
```

### 5.3 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Only using `invalidateQueries`

```typescript
// WRONG - should update cache directly for better UX
onSuccess: () => {
	queryClient.invalidateQueries({ queryKey: ['items'] });
};

// CORRECT - update cache directly with setQueryData
onSuccess: data => {
	queryClient.setQueryData(itemQueries.items().queryKey, prev => ({
		...prev,
		value: [...prev.value, data],
	}));
};
```

#### ❌ INCORRECT: Mutations in `queries.ts`

```typescript
// WRONG - mutations should be in mutations.ts
export const itemQueries = {
	// ...
};

export const useCreateItem = () => {
	/* ... */
};

// CORRECT - separate files
// queries.ts
export const itemQueries = {
	/* ... */
};

// mutations.ts
export const useCreateItem = () => {
	/* ... */
};
```

---

## 6. Selectors Pattern

### 6.1 ✅ CORRECT: Separate Selectors File

```typescript
// selectors.ts
import type { Profile } from '@/modules/types/User';

export const selectIsAdministrator = (state: Profile) => state.isAdministrator;
export const selectMemberId = (state: Profile) => state.memberId;
```

### 6.2 ✅ CORRECT: Using Selectors in Queries

```typescript
const { data: isAdministrator } = useQuery({
	...userQueries.profile(),
	select: selectIsAdministrator,
});
```

### 6.3 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Inline selectors in components

```typescript
// WRONG - selector should be in selectors.ts
const { data: isAdmin } = useQuery({
	...userQueries.profile(),
	select: state => state.isAdministrator,
});

// CORRECT - use selector from selectors.ts
const { data: isAdmin } = useQuery({
	...userQueries.profile(),
	select: selectIsAdministrator,
});
```

---

## 7. File Structure

### 7.1 ✅ CORRECT: Domain-Based Structure

```
src/modules/stores/server/
  └── resourceType/
      ├── queries.ts      # Query definitions
      ├── mutations.ts    # Mutation hooks
      └── selectors.ts    # Selectors (optional)
```

### 7.2 ✅ CORRECT: Import Paths

```typescript
// In queries.ts
import { getResourceTypes } from '@/modules/api/reserve/resourceType';

// In mutations.ts
import { resourceTypeQueries } from './queries';

// In components
import { resourceTypeQueries } from '@/modules/stores/server/resourceType/queries';
```

### 7.3 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Wrong file location

```typescript
// WRONG - queries should be in stores/server
src / modules / api / reserve / resourceType / queries.ts;

// CORRECT - queries in stores/server
src / modules / stores / server / resourceType / queries.ts;
```

---

## 8. Query Client Configuration

### 8.1 ✅ CORRECT: Global Configuration

```typescript
// src/modules/stores/server/index.ts
import { QueryClient } from '@tanstack/react-query';

import type { QueryClientConfig } from '@tanstack/react-query';

const queryClientConfig: QueryClientConfig = {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
			staleTime: 60 * 1000 * 5,
		},
	},
};

export const queryClient = new QueryClient(queryClientConfig);
```

### 8.2 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Creating `QueryClient` in components

```typescript
// WRONG - QueryClient should be created once
function MyComponent() {
	const queryClient = new QueryClient();
}

// CORRECT - use exported queryClient
import { queryClient } from '@/modules/stores/server';
```

---

## 9. Error Handling

### 9.1 ✅ CORRECT: Error Handling in Mutations

```typescript
import { ModalType } from '@/constants';
import { getErrorMessage } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '@/modules/stores/client/modal';
import { resourceTypeQueries } from './queries';

export const useCreateResourceType = () => {
	const navigate = useNavigate();
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (resourceType: Partial<ResourceType>) => createResourceType(resourceType),
		onSuccess: data => {
			// Navigate if needed
			// navigate(Paths.RESOURCE_TYPES_MANAGE);

			// Update cache
			queryClient.setQueryData(resourceTypeQueries.resourceTypes().queryKey, prev => {
				if (!prev) return prev;
				return {
					...prev,
					value: [...prev.value, data],
					total: prev.total + 1,
				};
			});
		},
		onError: error => {
			openModal({
				type: ModalType.ALERT,
				message: getErrorMessage(error.response?.data?.error),
			});
		},
	});
};
```

### 9.2 ✅ CORRECT: Error Handling with Special Cases

```typescript
import { ModalType, RESOURCE_TYPE } from '@/constants';
import { getErrorMessage } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useModalStore } from '@/modules/stores/client/modal';
import { resourceTypeQueries } from './queries';

export const useDeleteResourceType = () => {
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (resourceTypeId: number) => deleteResourceType(resourceTypeId),
		onSuccess: (_, resourceTypeId) => {
			// Update cache
			queryClient.setQueryData(resourceTypeQueries.resourceTypes().queryKey, prev => {
				if (!prev) return prev;
				return {
					...prev,
					value: prev.value.filter(item => item.resourceTypeId !== resourceTypeId),
					total: prev.total - 1,
				};
			});
		},
		onError: (error, resourceTypeId) => {
			// Handle specific error cases
			if (error.response?.data.error?.code === RESOURCE_TYPE.RESOURCE_TYPE_NOT_FOUND) {
				openModal({
					type: ModalType.ALERT,
					message: getErrorMessage(error.response?.data.error),
					callback: () => {
						// Update cache even on error if item was already deleted
						queryClient.setQueryData(resourceTypeQueries.resourceTypes().queryKey, prev => {
							if (!prev) return prev;
							return {
								...prev,
								value: prev.value.filter(item => item.resourceTypeId !== resourceTypeId),
								total: prev.total - 1,
							};
						});
					},
				});
			} else {
				openModal({
					type: ModalType.ALERT,
					message: getErrorMessage(error.response?.data?.error),
				});
			}
		},
	});
};
```

### 9.3 Anti-Patterns (ERRORS)

#### ❌ INCORRECT: Missing error handling

```typescript
// WRONG - no error handling
export const useCreateResourceType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (resourceType: Partial<ResourceType>) => createResourceType(resourceType),
		onSuccess: data => {
			// Update cache
		},
	});
};

// CORRECT - handle errors with useModalStore
import { ModalType } from '@/constants';
import { getErrorMessage } from '@/utils';
import { useModalStore } from '@/modules/stores/client/modal';

export const useCreateResourceType = () => {
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (resourceType: Partial<ResourceType>) => createResourceType(resourceType),
		onSuccess: data => {
			// Update cache
		},
		onError: error => {
			openModal({
				type: ModalType.ALERT,
				message: getErrorMessage(error.response?.data?.error),
			});
		},
	});
};
```

---

## 10. Complete Example

### 10.1 ✅ CORRECT: Complete Domain Setup

```typescript
// queries.ts
import { getResourceType, getResourceTypes } from '@/modules/api/reserve/resourceType';
import { queryOptions } from '@tanstack/react-query';

export const resourceTypeQueries = {
	all: () => ['resourceTypes'],
	resourceTypes: () => queryOptions({ queryKey: [...resourceTypeQueries.all()], queryFn: getResourceTypes }),
	resourceType: (resourceTypeId: number) =>
		queryOptions({
			queryKey: ['resourceType', resourceTypeId],
			queryFn: () => getResourceType(resourceTypeId),
			enabled: !!resourceTypeId,
		}),
};

// mutations.ts
import { ModalType } from '@/constants';
import { createResourceType } from '@/modules/api/reserve/resourceType';
import type { ResourceType } from '@/modules/types/ResourceType';
import { getErrorMessage } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '../../client/modal';
import { resourceTypeQueries } from './queries';

export const useCreateResourceType = () => {
	const navigate = useNavigate();
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (resourceType: Partial<ResourceType>) => createResourceType(resourceType),
		onSuccess: data => {
			// Navigate if needed
			// navigate(Paths.RESOURCE_TYPES_MANAGE);

			queryClient.setQueryData(resourceTypeQueries.resourceTypes().queryKey, prev => {
				if (!prev) return prev;
				return {
					...prev,
					value: [...prev.value, data],
					total: prev.total + 1,
				};
			});
		},
		onError: error => {
			openModal({
				type: ModalType.ALERT,
				message: getErrorMessage(error.response?.data?.error),
			});
		},
	});
};

// selectors.ts
import type { ResourceType } from '@/modules/types/ResourceType';

export const selectResourceTypeById = (state: PagedResponse<ResourceType>, id: number) =>
	state.value.find(item => item.resourceTypeId === id);
```

---

## 11. Anti-Patterns Summary

### 11.1 ❌ Common Mistakes

```typescript
// WRONG - inline query definition
const { data } = useQuery({
	queryKey: ['items'],
	queryFn: getItems,
});

// WRONG - missing queryOptions
export const itemQueries = {
	items: () => ({
		queryKey: ['items'],
		queryFn: getItems,
	}),
};

// WRONG - not spreading query options
const { data } = useQuery(itemQueries.items());

// WRONG - only invalidateQueries
onSuccess: () => {
	queryClient.invalidateQueries({ queryKey: ['items'] });
};

// WRONG - selectors inline
select: state => state.isAdministrator;

// CORRECT - proper pattern
// queries.ts
import { queryOptions } from '@tanstack/react-query';
import { getItems } from '@/modules/api/reserve/item';

export const itemQueries = {
	all: () => ['items'],
	items: () =>
		queryOptions({
			queryKey: [...itemQueries.all()],
			queryFn: getItems,
		}),
};

// Component
import { useQuery } from '@tanstack/react-query';
import { itemQueries } from '@/modules/stores/server/item/queries';

const { data } = useQuery({ ...itemQueries.items() });

// mutations.ts
import { ModalType } from '@/constants';
import { createItem } from '@/modules/api/reserve/item';
import { getErrorMessage } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useModalStore } from '@/modules/stores/client/modal';
import { itemQueries } from './queries';

export const useCreateItem = () => {
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (item: Partial<Item>) => createItem(item),
		onSuccess: data => {
			queryClient.setQueryData(itemQueries.items().queryKey, prev => {
				if (!prev) return prev;
				return {
					...prev,
					value: [...prev.value, data],
					total: prev.total + 1,
				};
			});
		},
		onError: error => {
			openModal({
				type: ModalType.ALERT,
				message: getErrorMessage(error.response?.data?.error),
			});
		},
	});
};

// selectors.ts
import type { Profile } from '@/modules/types/User';

export const selectIsAdmin = (state: Profile) => state.isAdministrator;
```
