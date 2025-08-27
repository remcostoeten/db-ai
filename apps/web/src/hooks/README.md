# ORPC Hooks - Reusable Patterns

This directory contains reusable hooks and patterns for working with ORPC in SolidJS applications.

## Overview

These hooks provide:
- ✅ **Type Safety**: Eliminates need for manual type assertions
- ✅ **Error Handling**: Centralized error handling with logging
- ✅ **Loading States**: Built-in loading state management
- ✅ **Consistency**: Standardized patterns across the application
- ✅ **DRY Principle**: Reduces code duplication

## Hooks

### `useOrpcQuery<T>`

For data fetching operations (GET requests).

```typescript
import { useOrpcQuery, queries } from '@/hooks/use-orpc-query';

// Basic usage
const [todos] = useOrpcQuery(queries.todos.getAll);

// With error handling
const [connections, { refetch }] = useOrpcQuery(
  queries.connections.getAll,
  {
    onError: (error) => handleApiError(error, 'Load Connections')
  }
);
```

**Features:**
- Automatic type inference
- Built-in error handling
- Refetch capability
- Loading states via SolidJS `createResource`

### `useOrpcMutation<TInput, TOutput>`

For data modification operations (POST, PUT, DELETE requests).

```typescript
import { useOrpcMutation, mutations } from '@/hooks/use-orpc-mutation';

const createMutation = useOrpcMutation(mutations.todos.create, {
  onSuccess: () => {
    setNewTodoText('');
    refetch();
  },
  onError: (error) => handleApiError(error, 'Create Todo')
});

// Usage
await createMutation.mutate({ text: 'New todo' });

// Access loading state
const isLoading = createMutation.isLoading();
```

**Features:**
- Loading state management
- Success/error callbacks
- Automatic error handling
- Type-safe input/output

## Pre-defined Queries and Mutations

### Queries (`queries` object)

```typescript
// Connections
queries.connections.getAll()
queries.connections.getById(id)

// Todos
queries.todos.getAll()

// Admin
queries.admin.getDashboardStats()
queries.admin.getUserCount(params)
queries.admin.getAllUsers(params)

// User
queries.user.getRole()

// Health
queries.healthCheck()
```

### Mutations (`mutations` object)

```typescript
// Connections
mutations.connections.create(data)
mutations.connections.update(data)
mutations.connections.delete({ id })

// Todos
mutations.todos.create({ text })
mutations.todos.toggle({ id, completed })
mutations.todos.delete({ id })

// Admin
mutations.admin.updateUserRole({ userId, role })
```

## Error Handling

Centralized error handling utilities in `@/utils/error-handling`:

```typescript
import { handleApiError, getErrorMessage, isNetworkError } from '@/utils/error-handling';

// Global error handler
handleApiError(error, 'Context');

// Extract user-friendly message
const message = getErrorMessage(error);

// Check error types
if (isNetworkError(error)) {
  // Handle network issues
}
```

## Usage Examples

### Complete Component Example

```typescript
import { createSignal } from 'solid-js';
import { useOrpcQuery, queries } from '@/hooks/use-orpc-query';
import { useOrpcMutation, mutations } from '@/hooks/use-orpc-mutation';
import { handleApiError } from '@/utils/error-handling';

export default function TodosView() {
  const [newTodoText, setNewTodoText] = createSignal('');

  // Query
  const [todos, { refetch }] = useOrpcQuery(
    queries.todos.getAll,
    { onError: (error) => handleApiError(error, 'Load Todos') }
  );

  // Mutations
  const createMutation = useOrpcMutation(mutations.todos.create, {
    onSuccess: () => {
      setNewTodoText('');
      refetch();
    },
    onError: (error) => handleApiError(error, 'Create Todo')
  });

  const deleteMutation = useOrpcMutation(mutations.todos.delete, {
    onSuccess: () => refetch(),
    onError: (error) => handleApiError(error, 'Delete Todo')
  });

  // Event handlers
  async function handleCreate(text: string) {
    await createMutation.mutate({ text });
  }

  async function handleDelete(id: number) {
    await deleteMutation.mutate({ id });
  }

  return (
    <div>
      <Show when={todos.loading}>Loading...</Show>
      <Show when={!todos.loading && todos()}>
        <For each={todos()}>
          {(todo) => (
            <div>
              <span>{todo.text}</span>
              <button 
                onClick={() => handleDelete(todo.id)}
                disabled={deleteMutation.isLoading()}
              >
                {deleteMutation.isLoading() ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </For>
      </Show>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        handleCreate(newTodoText());
      }}>
        <input 
          value={newTodoText()} 
          onInput={(e) => setNewTodoText(e.target.value)} 
        />
        <button 
          type="submit"
          disabled={createMutation.isLoading()}
        >
          {createMutation.isLoading() ? 'Creating...' : 'Create'}
        </button>
      </form>
    </div>
  );
}
```

## Benefits

1. **Type Safety**: No more `as Type[]` assertions scattered throughout code
2. **Consistency**: All API calls follow the same pattern
3. **Error Handling**: Centralized error handling with context
4. **Loading States**: Built-in loading state management
5. **Maintainability**: Easy to update API calls globally
6. **Developer Experience**: Better IntelliSense and type checking

## Migration Guide

### Before (Manual Pattern)
```typescript
const [data, { refetch }] = createResource(async () => {
  try {
    const result = await client.connection.getAll();
    return result as TConnection[];
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
});
```

### After (Reusable Pattern)
```typescript
const [data, { refetch }] = useOrpcQuery(
  queries.connections.getAll,
  { onError: (error) => handleApiError(error, 'Load Connections') }
);
```

## Future Enhancements

- [ ] Add optimistic updates for mutations
- [ ] Add caching strategies
- [ ] Add retry logic for failed requests
- [ ] Add request cancellation
- [ ] Add pagination helpers
- [ ] Integration with toast notifications
- [ ] Integration with error tracking services (Sentry)