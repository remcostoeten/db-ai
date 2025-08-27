# Database Management Feature

This document describes the database management feature implemented in db-studio, which provides comprehensive database connection management, schema exploration, and metadata synchronization.

## Overview

The database management feature consists of several interconnected components:

1. **Connection Management** - Store and manage database connections
2. **Database Browser** - Explore database structure and schema
3. **Metadata Synchronization** - Sync database, table, and column information
4. **Multi-Database Support** - Support for PostgreSQL, MySQL, SQLite, and MongoDB

## Architecture

### Backend Components

#### 1. Database Schemas (`apps/server/src/db/schema/connections.ts`)

- **connections** - Store database connection information
- **database** - Store database/schema information
- **table** - Store table/view information  
- **column** - Store column/field information

All entities are user-scoped and include proper foreign key relationships.

#### 2. Data Access Layer (`apps/server/src/lib/dal.ts`)

Provides consistent CRUD operations with:
- Type-safe database operations
- Error handling with `DALError` class
- User-scoped data access
- Support for additional WHERE clauses for security

#### 3. Database Service (`apps/server/src/lib/database-service.ts`)

Handles direct database connections for:
- Connection testing
- Metadata extraction (databases, tables, columns)
- Multi-database type support (PostgreSQL, MySQL, SQLite, MongoDB)

#### 4. API Routers

- **Connection Router** (`apps/server/src/routers/connection.ts`)
  - CRUD operations for connections
  - Connection testing
  - Toggle active status

- **Database Router** (`apps/server/src/routers/database.ts`)
  - Get databases for a connection
  - Sync databases from remote connection

- **Table Router** (`apps/server/src/routers/database.ts`)
  - Get tables for a database
  - Sync tables from remote database

- **Column Router** (`apps/server/src/routers/database.ts`)
  - Get columns for a table
  - Sync columns from remote table

### Frontend Components

#### 1. Connections Page (`apps/web/src/routes/connections.tsx`)

Features:
- Grid view of all connections
- Create/edit connection forms
- Connection testing
- Toggle active/inactive status
- Visual organization with colors
- Support for connection strings or individual fields

#### 2. Database Browser (`apps/web/src/routes/database-browser.tsx`)

Features:
- Tree view of database structure
- Connection → Database → Table → Column hierarchy
- Real-time metadata synchronization
- Column details with types, constraints, and relationships
- Visual indicators for primary keys, foreign keys, etc.

#### 3. Enhanced Dashboard (`apps/web/src/routes/dashboard.tsx`)

Features:
- Connection overview statistics
- Recent connections display
- Quick actions for database management
- Visual connection status indicators

## Usage

### 1. Creating a Connection

1. Navigate to the Connections page
2. Click "Add Connection"
3. Fill in connection details:
   - **Name**: Descriptive name for the connection
   - **Type**: Database type (PostgreSQL, MySQL, SQLite, MongoDB)
   - **Connection method**: Individual fields or connection string
   - **Color**: Visual identifier
4. Test the connection before saving
5. Save the connection

### 2. Browsing Database Structure

1. Navigate to Database Browser
2. Select a connection from the dropdown
3. Click the sync button to load databases
4. Expand databases to view tables
5. Expand tables to view columns
6. View detailed column information in the details panel

### 3. Managing Connections

- **Edit**: Click the settings icon on any connection
- **Test**: Click the "Test" button to verify connectivity
- **Activate/Deactivate**: Use the eye icon to toggle status
- **Delete**: Click the trash icon (with confirmation)

## Database Support

### PostgreSQL
- ✅ Connection testing
- ✅ Database listing
- ✅ Table/view listing with metadata
- ✅ Column information with constraints
- ✅ Primary key detection
- ✅ Foreign key relationships

### MySQL
- ✅ Connection testing
- ⏳ Database/table/column listing (basic implementation)

### SQLite
- ✅ Connection testing
- ⏳ Table/column listing (basic implementation)

### MongoDB
- ✅ Connection testing
- ⏳ Database/collection listing (basic implementation)

## Security Features

- **User Scoping**: All data is scoped to the authenticated user
- **Connection Isolation**: Users can only access their own connections
- **Secure Storage**: Connection credentials are stored securely
- **Protected Routes**: All endpoints require authentication

## Technical Details

### Database Schema

```sql
-- Connections table
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    host TEXT,
    port TEXT,
    database TEXT,
    username TEXT,
    password TEXT,
    connection_string TEXT,
    color TEXT DEFAULT '#3b82f6',
    is_active TEXT DEFAULT 'true',
    metadata TEXT,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Similar structure for databases, tables, and columns
```

### API Endpoints

- `GET /rpc/connection.getAll` - Get user connections
- `POST /rpc/connection.create` - Create new connection
- `PUT /rpc/connection.update` - Update connection
- `DELETE /rpc/connection.delete` - Delete connection
- `POST /rpc/connection.testConnection` - Test connection
- `POST /rpc/database.syncFromConnection` - Sync databases
- `POST /rpc/table.syncFromDatabase` - Sync tables
- `POST /rpc/column.syncFromTable` - Sync columns

### Error Handling

- **DAL Level**: Consistent error wrapping with `DALError`
- **API Level**: Proper HTTP status codes and error messages
- **Frontend**: User-friendly error display and loading states

## Future Enhancements

1. **Query Execution**: Add SQL query execution capabilities
2. **Data Visualization**: Charts and graphs for data analysis
3. **Export/Import**: Schema and data export functionality
4. **Real-time Updates**: WebSocket support for live schema changes
5. **Collaboration**: Share connections and queries with team members
6. **Performance Monitoring**: Query execution time tracking
7. **Backup Management**: Automated backup scheduling

## Development Notes

### Adding New Database Types

1. Add the type to the connection schema enum
2. Implement connection testing in `DatabaseService`
3. Implement metadata extraction methods
4. Update frontend type selection
5. Add appropriate database client dependency

### Extending Metadata

1. Update the relevant schema (database/table/column)
2. Modify the sync methods in `DatabaseService`
3. Update the API routers
4. Enhance frontend display components

This feature provides a solid foundation for database management and can be extended with additional functionality as needed.