# clipcode - Code Snippet Manager

A production-ready Next.js 14 application for managing code snippets with tags, collections, powerful search, and great DX.

## Features (Sprint 1 - MVP)

### ✅ Completed

- **Monorepo Structure**: Turborepo + pnpm workspace
- **Authentication**: NextAuth with GitHub OAuth
- **Database**: PostgreSQL + Prisma with full-text search (tsvector + pg_trgm)
- **Search**: Advanced search with filters, full-text, and fuzzy matching
- **API Routes**: Complete REST API with Zod validation
- **UI Components**: Modern UI with Tailwind CSS + shadcn/ui + Monaco Editor
- **Audit Logging**: Track all mutations
- **Import/Export**: JSON and Markdown formats

### 🚧 In Progress

- Additional dashboard pages (collections, tags management, import/export UI)
- Unit and E2E tests
- CI/CD pipeline
- Complete documentation

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript strict mode)
- **UI**: Tailwind CSS, shadcn/ui, Radix UI, Monaco Editor
- **Auth**: NextAuth (GitHub provider)
- **Database**: PostgreSQL + Prisma
- **Search**: Postgres full-text (tsvector + GIN) + pg_trgm fuzzy
- **State**: Server Actions + React Query
- **Validation**: Zod + React Hook Form
- **Testing**: Vitest (unit) + Playwright (e2e)

## Prerequisites

- Node.js >= 18.0.0
- pnpm 8.15.0+
- PostgreSQL 14+

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE clipcode;
```

Enable required extensions:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 3. Environment Variables

Copy `.env.example` to `.env` in `apps/web/`:

```bash
cd apps/web
cp .env.example .env
```

Update the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/clipcode
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
```

To generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

To create GitHub OAuth App:
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID and Client Secret to `.env`

### 4. Run Migrations

```bash
cd apps/web
pnpm db:migrate
```

### 5. Seed Database (Optional)

```bash
pnpm db:seed
```

This creates:
- 3 demo users
- 10 tags
- 2 collections
- 12 sample snippets (C#, JS, SQL, TypeScript)

### 6. Start Development Server

```bash
cd ..
pnpm dev
```

Visit http://localhost:3000

## Project Structure

```
clipcode/
├── apps/web/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── snippets/
│   │   │       ├── page.tsx
│   │   │       ├── new/page.tsx
│   │   │       └── [slug]/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── snippets/route.ts
│   │   │   ├── favorite/[id]/route.ts
│   │   │   ├── import/route.ts
│   │   │   ├── export/route.ts
│   │   │   └── stats/route.ts
│   │   ├── auth/signin/page.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── snippet-editor.tsx   # Monaco wrapper
│   │   ├── snippet-card.tsx
│   │   ├── filters.tsx
│   │   ├── dashboard-nav.tsx
│   │   └── user-menu.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── search.ts            # Full-text + fuzzy search
│   │   ├── slug.ts
│   │   ├── validators.ts        # Zod schemas
│   │   └── audit.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── middleware.ts
│   └── package.json
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── roadmap.md
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## API Endpoints

### Snippets

- `GET /api/snippets` - List/search snippets with filters
- `POST /api/snippets` - Create snippet
- `GET /api/snippets/[id]` - Get snippet
- `PUT /api/snippets/[id]` - Update snippet
- `DELETE /api/snippets/[id]` - Delete snippet
- `POST /api/snippets/[id]/copy` - Increment usage count

### Other

- `POST /api/favorite/[id]` - Toggle favorite
- `GET /api/stats` - Get dashboard statistics
- `POST /api/import` - Import snippets (JSON/Markdown)
- `POST /api/export` - Export snippets (JSON/Markdown)
- `GET /api/tags` - List all tags

## Database Schema

**Core Models:**
- `User` - Users with NextAuth
- `Snippet` - Code snippets with full-text search
- `Tag` - Tags for categorization
- `Collection` - Snippet collections
- `Favorite` - User favorites
- `AuditLog` - Action tracking

**Search Features:**
- `tsvector` column with GIN index for full-text search
- `pg_trgm` indexes for fuzzy matching
- Automatic trigger to update search vector

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run unit tests
pnpm test:e2e     # Run E2E tests
pnpm db:push      # Push schema changes
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio
```

## Development Notes

### Search Implementation

The search service (`lib/search.ts`) provides:
- Full-text search using PostgreSQL `tsvector`
- Fuzzy matching using `pg_trgm` similarity
- Filter support for language, framework, tags, favorites, date ranges
- Cursor-based pagination

### Authentication Flow

1. User clicks "Sign in with GitHub"
2. NextAuth handles OAuth flow
3. User data stored in database via Prisma adapter
4. Protected routes checked by middleware

### Code Editor

Monaco Editor is dynamically imported to avoid SSR issues:
- Supports syntax highlighting for common languages
- VS Dark theme
- Auto-resizing
- Line numbers and minimap options

## TODO for Sprint 1 Completion

1. **Pages**:
   - [ ] Snippet create/edit form pages
   - [ ] Collections management pages
   - [ ] Tags management pages
   - [ ] Import/Export UI pages

2. **Testing**:
   - [ ] Unit tests for search service
   - [ ] Unit tests for slug generation
   - [ ] E2E tests for auth flow
   - [ ] E2E tests for snippet CRUD

3. **CI/CD**:
   - [ ] GitHub Actions workflow
   - [ ] Automated testing
   - [ ] Build verification

4. **Documentation**:
   - [ ] API documentation with examples
   - [ ] Architecture diagram
   - [ ] Deployment guide

## Sprint 2 Features (Planned)

- Template engine with liquidjs
- Encryption at rest for code
- Duplicate detection (SimHash/MinHash)
- GitHub Gist sync
- Command palette (⌘K)
- Keyboard shortcuts

## Contributing

This is a demonstration project. For production use, additional security hardening and testing is recommended.

## License

MIT


