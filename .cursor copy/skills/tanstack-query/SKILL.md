---
name: tanstack-query
description: >-
    Creates TanStack Query (React Query) queries and mutations following project patterns.
    Uses queryOptions, query factories, selectors, and setQueryData for cache management.
    Use when setting up data fetching for a new domain, creating query definitions, implementing mutations with cache updates, or managing server state with TanStack Query.
---

# TanStack Query

Creates TanStack Query queries and mutations following project patterns.

## Workflow

### Step 1: Create Domain Structure

Create `src/modules/stores/server/{domain}/` directory with:

- `queries.ts` - Query definitions with queryOptions
- `mutations.ts` - Mutation hooks (if needed)
- `selectors.ts` - Data transformation functions (if needed)

Use `assets/template.ts` as a starting point. Replace `{{Domain}}`, `{{domain}}`, `{{domainId}}` placeholders.

### Step 2: Write queries.ts

Use query factory pattern with `all()` method:

```typescript
import { queryOptions } from '@tanstack/react-query';
import { getResourceTypes, getResourceType } from '@/modules/api/reserve/resourceType';

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

Required rules:

- Include `all()` method in query factory
- Use `queryOptions` for all query definitions
- Import API functions from `@/modules/api/reserve/{domain}/` or `@/modules/api/{domain}/`

### Step 3: Write mutations.ts

Update cache directly with `setQueryData` and handle errors:

```typescript
import { ModalType } from '@/constants';
import { getErrorMessage } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useModalStore } from '../../client/modal';
import { resourceTypeQueries } from './queries';

export const useCreateResourceType = () => {
	const openModal = useModalStore(state => state.actions.openModal);
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (resourceType: Partial<ResourceType>) => createResourceType(resourceType),
		onSuccess: data => {
			queryClient.setQueryData(resourceTypeQueries.resourceTypes().queryKey, prev => {
				if (!prev) return prev;
				return { ...prev, value: [...prev.value, data], total: prev.total + 1 };
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

Required rules:

- Use `setQueryData` to update cache directly (not just `invalidateQueries`)
- Handle errors with `useModalStore` and `getErrorMessage`
- Use `useNavigate` for post-success navigation if needed

### Step 4: Write selectors.ts (Optional)

Separate data transformation functions:

```typescript
import type { Profile } from '@/modules/types/User';

export const selectIsAdministrator = (state: Profile) => state.isAdministrator;
```

Use in components:

```typescript
const { data: isAdministrator } = useQuery({
	...userQueries.profile(),
	select: selectIsAdministrator,
});
```

### Step 5: Use in Components

Spread query options when using queries:

```typescript
import { useQuery } from '@tanstack/react-query';
import { resourceTypeQueries } from '@/modules/stores/server/resourceType/queries';

const { data: resourceTypes, isLoading } = useQuery({ ...resourceTypeQueries.resourceTypes() });
```

## Validation Checklist

Verify generated code follows:

- [ ] Uses `queryOptions` for query definitions
- [ ] Query factory includes `all()` method
- [ ] Uses `setQueryData` for cache updates (not just `invalidateQueries`)
- [ ] Spreads query options in components: `useQuery({ ...domainQueries.query() })`
- [ ] Mutations include error handling
- [ ] Files are in correct location: `src/modules/stores/server/{domain}/`

## References

For detailed acceptance criteria and anti-patterns, see [acceptance-criteria.md](./references/acceptance-criteria.md).
