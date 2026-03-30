import { createStore } from '@/modules/stores/client';

// ============================================================================
// Types
// ============================================================================

/**
 * Item - Example item type (replace with your actual type)
 */
interface Item {
  id: string;
  name: string;
  // Add other properties as needed
}

/**
 * {{StoreName}}State - The state shape for this store
 */
export interface {{StoreName}}State {
  // State properties
  items: Item[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions grouped in actions object
  actions: {
    // Setters
    setItems: (items: Item[]) => void;
    setSelectedId: (id: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    // Complex actions
    loadItems: () => Promise<void>;
    addItem: (item: Item) => void;
    removeItem: (id: string) => void;

    // Reset
    reset: () => void;
  };
}

// ============================================================================
// Action Enums (Optional but recommended)
// ============================================================================

enum {{StoreName}}Actions {
  SET_ITEMS = '{{storeName}}/setItems',
  SET_SELECTED_ID = '{{storeName}}/setSelectedId',
  SET_LOADING = '{{storeName}}/setLoading',
  SET_ERROR = '{{storeName}}/setError',
  LOAD_ITEMS = '{{storeName}}/loadItems',
  ADD_ITEM = '{{storeName}}/addItem',
  REMOVE_ITEM = '{{storeName}}/removeItem',
  RESET = '{{storeName}}/reset',
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: Omit<{{StoreName}}State, 'actions'> = {
  items: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

// ============================================================================
// Store
// ============================================================================

/**
 * use{{StoreName}}Store - Zustand store for managing {{description}}
 *
 * @example
 * ```typescript
 * // In a component - use individual selectors for performance
 * const items = use{{StoreName}}Store((state) => state.items);
 * const { loadItems } = use{{StoreName}}Store((state) => state.actions);
 *
 * // Multiple values with shallow
 * import { shallow } from 'zustand/shallow';
 * const { items, isLoading } = use{{StoreName}}Store(
 *   (state) => ({ items: state.items, isLoading: state.isLoading }),
 *   shallow,
 * );
 * ```
 */
export const use{{StoreName}}Store = createStore<{{StoreName}}State>(
  set => ({
    // Initial state
    ...initialState,

    // Actions
    actions: {
      // Simple setters
      setItems: items => {
        set({ items }, false, {{StoreName}}Actions.SET_ITEMS);
      },
      setSelectedId: selectedId => {
        set({ selectedId }, false, {{StoreName}}Actions.SET_SELECTED_ID);
      },
      setLoading: isLoading => {
        set({ isLoading }, false, {{StoreName}}Actions.SET_LOADING);
      },
      setError: error => {
        set({ error }, false, {{StoreName}}Actions.SET_ERROR);
      },

      // Async action example
      loadItems: async () => {
        set({ isLoading: true, error: null }, false, {{StoreName}}Actions.LOAD_ITEMS);
        try {
          // const items = await fetchItems();
          const items: Item[] = []; // Replace with actual fetch
          set({ items, isLoading: false }, false, {{StoreName}}Actions.LOAD_ITEMS);
        } catch (error) {
          set(
            {
              error: error instanceof Error ? error.message : 'Failed to load',
              isLoading: false,
            },
            false,
            {{StoreName}}Actions.LOAD_ITEMS,
          );
        }
      },

      // Add item (using immer for direct mutation)
      addItem: item => {
        set(
          state => {
            state.items.push(item);
          },
          false,
          {{StoreName}}Actions.ADD_ITEM,
        );
      },

      // Remove item (using immer for direct mutation)
      removeItem: id => {
        set(
          state => {
            state.items = state.items.filter(item => item.id !== id);
            // Clear selection if removed item was selected
            if (state.selectedId === id) {
              state.selectedId = null;
            }
          },
          false,
          {{StoreName}}Actions.REMOVE_ITEM,
        );
      },

      // Reset to initial state
      reset: () => {
        set(initialState, false, {{StoreName}}Actions.RESET);
      },
    },
  }),
  '{{storeName}}',
);
