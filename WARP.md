# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

db-palace is a full-stack TypeScript monorepo built with modern tools for rapid development:
- **Frontend**: SolidJS with TanStack Router, TailwindCSS, and Tauri for desktop
- **Backend**: Hono server with oRPC for type-safe APIs, Drizzle ORM with PostgreSQL
- **Build System**: Turborepo with Bun package manager
- **Deployment**: Cloudflare Workers for both web and server apps

## Development Commands

### Core Development
```bash
# Install dependencies
bun install

# Start all apps in development
bun dev

# Start individual apps
bun dev:web      # Frontend only (port 3001)
bun dev:server   # Backend only (port 3000)

# Build all apps
bun build

# Type checking
bun check-types
```

### Database Operations
```bash
# Push schema changes to database
bun db:push

# Open database studio UI
bun db:studio

# Generate migrations
bun db:generate

# Run migrations
bun db:migrate
```

### Desktop App (Tauri)
```bash
cd apps/web
bun desktop:dev    # Development mode
bun desktop:build  # Production build
```

### Deployment
```bash
# Deploy web app to Cloudflare
cd apps/web && bun deploy

# Deploy server to Cloudflare Workers
cd apps/server && bun deploy
```

## Architecture Overview

### Monorepo Structure
```
apps/
├── web/          # SolidJS frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── views/         # Page-level components
│   │   ├── routes/        # TanStack Router route definitions
│   │   ├── lib/           # Client-side utilities
│   │   └── utils/         # oRPC client setup
│   └── vite.config.ts
├── server/       # Hono backend API
│   ├── src/
│   │   ├── db/            # Database schema and migrations
│   │   ├── lib/           # Authentication and context
│   │   ├── routers/       # oRPC route handlers
│   │   └── index.ts       # Server entry point
│   └── drizzle.config.ts
```

### Key Technologies & Patterns

**Type-Safe API Layer**: Uses oRPC for end-to-end type safety between frontend and backend. The `AppRouter` type is shared across both apps, enabling full TypeScript intellisense for API calls.

**Authentication**: Better Auth handles email/password authentication with session management across both client and server.

**Database**: Drizzle ORM with PostgreSQL provides type-safe database operations. Schema files in `apps/server/src/db/schema/` define the database structure.

**State Management**: 
- TanStack Query for server state management
- SolidJS signals for local component state
- TanStack Router for routing and route-based state

**Styling**: TailwindCSS v4 with Vite plugin for rapid UI development

**Build & Deploy**: Turborepo orchestrates builds, Cloudflare Workers for production deployment

### Code Style Requirements

This project follows strict functional programming patterns enforced by Ultracite:

**Function Declarations**: Use only `function foo() {}` syntax, never arrow constants
**Type Definitions**: All types prefixed with `T`, single non-exported types named `TProps`
**SolidJS Patterns**: Never destructure props, use `props.propName` instead
**File Naming**: kebab-case for filenames, camelCase for functions and variables
**No Classes**: Pure functional approach only
**No Comments**: Code should be self-explanatory

### Database Schema Patterns

Follow the established pattern in schema files:
- Use Drizzle's `pgTable` for table definitions
- Primary keys with `serial` type and `.primaryKey()`
- Text fields with `.notNull()` where appropriate
- Boolean fields with sensible defaults

### Component Architecture

**Views vs Components**:
- `views/`: Page-level components that handle routing and data fetching
- `components/`: Reusable UI components that accept props

**Route Structure**: 
- TanStack Router with file-based routing in `routes/`
- Each route file exports route configuration with loaders for data fetching
- Context provides access to oRPC client and query client

## Development Workflow

1. **Database Changes**: Modify schema files in `apps/server/src/db/schema/`, then run `bun db:push`
2. **API Changes**: Add/modify routers in `apps/server/src/routers/`, types automatically sync to frontend
3. **Frontend Features**: Create views in `apps/web/src/views/` and components in `apps/web/src/components/`
4. **Authentication**: Use `auth.api` methods from Better Auth, context provides session data

## Environment Setup

Ensure these environment variables are set:
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGIN`: Frontend URL for CORS (development: http://localhost:3001)
- `VITE_SERVER_URL`: Backend URL for frontend API calls

## Important Files

- `turbo.json`: Turborepo task definitions and dependency graph
- `apps/server/drizzle.config.ts`: Database configuration
- `apps/web/src/utils/orpc.ts`: oRPC client setup with TanStack Query integration
- `.cursor/rules/ultracite.mdc`: Comprehensive code style rules (400+ rules)
- `GEMINI.md`: Duplicate of code style rules for AI assistants

When making changes, always consider the type-safe flow from database schema → oRPC router → frontend client to maintain end-to-end type safety.
