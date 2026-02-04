# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Tech Stack

- **Runtime**: NestJS + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Architecture**: CQRS (Command/Query separation)

## Project Overview

NestJS TypeScript backend server with CQRS architecture support. Uses Express as the HTTP platform.

## Commands

### Development
```bash
npm run start:dev     # Watch mode with auto-reload
npm run start:debug   # Debug mode with inspector
```

### Build & Production
```bash
npm run build         # Compile to dist/
npm run start:prod    # Run compiled code
```

### Testing
```bash
npm run test                           # Run unit tests (*.spec.ts in src/)
npm run test -- --watch                # Watch mode
npm run test -- path/to/file.spec.ts   # Run specific test file
npm run test:e2e                       # Run e2e tests (test/*.e2e-spec.ts)
npm run test:cov                       # Generate coverage report
```

### Linting & Formatting
```bash
npm run lint          # ESLint with auto-fix
npm run format        # Prettier formatting
```

### Code Generation (NestJS CLI)
```bash
nest g module <name>      # Generate module
nest g controller <name>  # Generate controller
nest g service <name>     # Generate service
nest g resource <name>    # Generate full CRUD resource
```

### Prisma
```bash
npx prisma generate        # Generate Prisma Client after schema changes
npx prisma migrate dev     # Create and apply migration in development
npx prisma migrate deploy  # Apply migrations in production
npx prisma studio          # Open database GUI
npx prisma db push         # Push schema changes without migration (dev only)
```

## Architecture

### NestJS Module Structure
- **Modules** (`*.module.ts`): Container for related components. Register controllers, providers, and imports.
- **Controllers** (`*.controller.ts`): Handle HTTP routes using decorators (`@Get`, `@Post`, etc.)
- **Services** (`*.service.ts`): Business logic, marked with `@Injectable()`

### Installed Capabilities
- `@nestjs/cqrs`: Command/Query separation - use for complex domain logic
- `@nestjs/config`: Environment configuration via `ConfigModule` and `ConfigService`
- `Prisma`: Type-safe database client - always use PrismaService for DB operations

### TypeScript Configuration
- Module system: `nodenext`
- Target: ES2023
- Strict null checks enabled, but `noImplicitAny` is off
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)

### Code Style
- Single quotes, trailing commas (Prettier)
- `@typescript-eslint/no-explicit-any` is disabled
- Floating promises and unsafe arguments are warnings (not errors)

## Testing Patterns

Unit tests use `@nestjs/testing` with `Test.createTestingModule()`:
```typescript
const module = await Test.createTestingModule({
  providers: [MyService],
}).compile();
const service = module.get<MyService>(MyService);
```

E2E tests use `supertest` against the full application.

## Rules

### Database & Prisma
- All database access goes through `PrismaService`
- After modifying `schema.prisma`, always run `npx prisma generate`
- Use transactions for operations that modify multiple tables
- Define relations in Prisma schema, not manually in queries

### Commits
- Use conventional commits: `type: description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
