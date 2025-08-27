# oRPC DAL Layer Audit Findings

## Current State Analysis

### Backend Routers ✅ GOOD
All backend routers are properly implemented with DAL:

1. **todoRouter** - ✅ Uses DAL consistently
   - getAll, getById, create, update, toggle, delete
   - Proper user scoping with `userId`
   - Error handling with `isDALError`

2. **connectionRouter** - ✅ Uses DAL consistently  
   - getAll, getById, create, update, delete, testConnection, toggleActive
   - Proper user scoping with `userId`
   - Error handling with `isDALError`

3. **databaseRouter** - ✅ Uses DAL consistently
   - getByConnectionId, syncFromConnection
   - Proper user scoping and connection validation

4. **tableRouter** - ✅ Uses DAL consistently
   - getByDatabaseId, syncFromDatabase
   - Proper user scoping and parent validation

5. **columnRouter** - ✅ Uses DAL consistently
   - getByTableId, syncFromTable
   - Proper user scoping and parent validation

### Frontend Routes ❌ NEEDS STANDARDIZATION

**Issues Found:**

1. **Inconsistent Hook Usage**
   - Routes use raw `useQuery()` and `useMutation()` instead of standardized hooks
   - Manual refetch calls instead of automatic cache invalidation
   - No use of the improved `orpc-hooks.ts` I created

2. **Missing CRUD Operations**
   - Some routes don't implement all CRUD operations
   - No standardized patterns for optimistic updates

3. **Inconsistent Error Handling**
   - Some routes have error boundaries, others don't
   - No standardized error display patterns

4. **Missing Route Guards**
   - Not all protected routes use `useAuthGuard`
   - Login route doesn't use `useGuestGuard`

## Required Standardization

### 1. Frontend Hook Usage
All routes should use the standardized hooks from `orpc-hooks.ts`:

```typescript
// Instead of:
const todos = useQuery(() => orpc.todo.getAll.queryOptions());

// Use:
const todos = useTodos();
```

### 2. CRUD Pattern Standardization
Each entity should follow this pattern:

```typescript
// Query hooks
const entities = useEntities();
const entity = useEntity(id);

// Mutation hooks
const createEntity = useCreateEntity();
const updateEntity = useUpdateEntity();
const deleteEntity = useDeleteEntity();
```

### 3. Error Handling
All routes should be wrapped with `ComponentErrorBoundary`

### 4. Route Guards
- Protected routes: `useAuthGuard(navigate)`
- Guest routes: `useGuestGuard(navigate)`

## Implementation Plan

1. Update all frontend routes to use standardized hooks
2. Implement missing CRUD operations where needed
3. Add proper error boundaries to all components
4. Ensure consistent route guard usage
5. Create comprehensive testing for all routes