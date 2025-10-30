# clipcode Architecture

## System Overview

clipcode is a modern code snippet management application built with Next.js 14 App Router, PostgreSQL, and Prisma. The application follows a server-first architecture with React Server Components and Server Actions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │  Monaco      │  │  React Query │      │
│  │  (Next.js)   │  │  Editor      │  │  (Cache)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  App Router  │  │Server Actions│  │   API        │      │
│  │   Pages      │  │              │  │   Routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           │                 │                 │              │
│           └─────────────────┴─────────────────┘              │
│                            │                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  NextAuth    │  │    Zod       │  │   Audit      │      │
│  │  Middleware  │  │ Validation   │  │   Logger     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Prisma    │  │   Search     │  │    Slug      │      │
│  │    Client    │  │   Service    │  │  Generator   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│                    PostgreSQL 14+                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Tables     │  │  Full-Text   │  │   Triggers   │      │
│  │   Relations  │  │  Indexes     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Authentication (NextAuth)

**Flow:**
1. User clicks "Sign in with GitHub"
2. NextAuth redirects to GitHub OAuth
3. User authorizes application
4. GitHub returns to callback URL
5. NextAuth creates/updates user in database
6. Session created and stored

**Implementation:**
- `lib/auth.ts` - NextAuth configuration
- `lib/auth-helpers.ts` - Helper functions
- `app/api/auth/[...nextauth]/route.ts` - Auth endpoints
- `middleware.ts` - Route protection

### 2. Database (PostgreSQL + Prisma)

**Schema:**
- **User**: Authentication and user data
- **Snippet**: Code snippets with metadata
- **Tag**: Categorization tags
- **SnippetTag**: Many-to-many relation
- **Collection**: Grouping snippets
- **Favorite**: User favorites
- **AuditLog**: Action tracking

**Indexes:**
- GIN index on `Snippet.tsv` for full-text search
- pg_trgm indexes on `title` and `code` for fuzzy search
- Standard B-tree indexes on foreign keys

**Triggers:**
```sql
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON "Snippet" FOR EACH ROW
EXECUTE FUNCTION snippet_tsv_trigger();
```

### 3. Search Service

**Features:**
- Full-text search using `tsvector` and `to_tsquery()`
- Fuzzy matching with `similarity()` function
- Filter support (language, framework, tags, favorites, date ranges)
- Cursor-based pagination

**Implementation:**
```typescript
// lib/search.ts
export async function searchSnippets(
  userId: string,
  filters: SearchFilters
): Promise<SearchResult>
```

**Search Strategy:**
1. Build WHERE clause from filters
2. Execute full-text query if search term provided
3. Apply language/framework/tag filters
4. Execute query with pagination
5. Return results with cursor for next page

### 4. API Layer

**Pattern:**
- RESTful endpoints in `app/api/`
- Zod validation for all inputs
- Consistent response format: `{ data, error }`
- Audit logging for mutations
- Server-side session validation

**Example:**
```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const data = createSnippetSchema.parse(body);

  const snippet = await prisma.snippet.create({ data });
  await logAudit('CREATED_SNIPPET', 'SNIPPET', snippet.id, session.user.id);

  return NextResponse.json({ data: snippet }, { status: 201 });
}
```

### 5. UI Components

**Structure:**
- `components/ui/` - shadcn/ui base components
- `components/` - Feature components
- Server Components by default
- Client Components for interactivity

**Key Components:**
- **SnippetEditor**: Monaco wrapper with SSR-safe loading
- **SnippetCard**: Display snippet with actions
- **Filters**: Search and filter controls
- **DashboardNav**: Navigation with active state

### 6. File Organization

**App Router Structure:**
```
app/
├── (dashboard)/          # Authenticated routes
│   ├── layout.tsx        # Dashboard layout
│   ├── page.tsx          # Dashboard home
│   └── snippets/
│       ├── page.tsx      # List snippets
│       ├── new/page.tsx  # Create snippet
│       └── [slug]/page.tsx # View/edit snippet
├── api/                  # API endpoints
├── auth/                 # Auth pages
└── layout.tsx            # Root layout
```

## Data Flow

### Creating a Snippet

1. **Client**: User fills form and submits
2. **Validation**: Zod schema validates input
3. **Slug Generation**: Unique slug created from title
4. **Database**: Snippet created with relations
5. **Trigger**: `tsv` column automatically updated
6. **Audit**: Action logged to AuditLog
7. **Response**: Snippet data returned to client
8. **UI**: Redirect to snippet detail page

### Searching Snippets

1. **Client**: User enters search query
2. **API**: `/api/snippets?q=...&language=...`
3. **Search Service**: Build query with filters
4. **Database**: Execute full-text search
5. **Results**: Snippets with relations loaded
6. **Response**: Paginated results returned
7. **UI**: Display snippet cards

### Copying Code

1. **Client**: User clicks copy button
2. **Clipboard**: Code copied to clipboard
3. **API**: POST to `/api/snippets/:id/copy`
4. **Database**: Increment `usageCount`
5. **Audit**: Log copy action
6. **UI**: Show success toast

## Security

### Authentication
- Session-based with database storage
- Protected routes via middleware
- CSRF protection via NextAuth

### Input Validation
- Zod schemas for all user inputs
- Server-side validation always enforced
- SQL injection prevented by Prisma

### Authorization
- User isolation (snippets belong to users)
- Session verification on every request
- No public endpoints (except auth)

## Performance

### Optimizations
- Server Components reduce client JS
- Database indexes for fast queries
- Cursor pagination for large datasets
- Monaco editor lazy loaded

### Caching Strategy
- React Query for client-side cache
- Next.js automatic caching for RSC
- PostgreSQL query planning

## Scalability

### Current Architecture
- Single database server
- Stateless application server
- Horizontal scaling possible

### Future Improvements
- Redis for session storage
- Read replicas for search
- CDN for static assets
- Background jobs for heavy operations

## Deployment

### Requirements
- Node.js 18+
- PostgreSQL 14+
- Environment variables configured

### Process
1. Install dependencies: `pnpm install`
2. Generate Prisma Client: `prisma generate`
3. Run migrations: `prisma migrate deploy`
4. Build application: `pnpm build`
5. Start server: `pnpm start`

### Environment Variables
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_ID=
GITHUB_SECRET=
```

## Monitoring

### Logs
- Application logs via console
- Audit logs in database
- NextAuth debug mode available

### Metrics
- Usage count per snippet
- User activity via audit logs
- Search query patterns

## Testing Strategy

### Unit Tests (Vitest)
- Search service logic
- Slug generation
- Validation schemas

### E2E Tests (Playwright)
- Authentication flow
- Snippet CRUD operations
- Search functionality
- Copy to clipboard

### Manual Testing
- Browser compatibility
- Responsive design
- Accessibility (WCAG 2.1)

## Future Architecture

### Sprint 2 Additions
- Template engine (liquidjs)
- Encryption service (AES-GCM)
- Similarity detection (SimHash)
- GitHub Gist sync
- Command palette
- Keyboard shortcuts

### Potential Improvements
- GraphQL API
- Real-time collaboration
- Code execution sandbox
- AI code suggestions
- Mobile app


