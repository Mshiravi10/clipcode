# Get Started with clipcode

## Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm 8.15.0+
- PostgreSQL 14+

### Step-by-Step Setup

#### 1. Install Dependencies
```bash
pnpm install
```

#### 2. Setup Database
Create a PostgreSQL database:
```sql
CREATE DATABASE clipcode;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

#### 3. Configure Environment
Copy `.env.example` in `apps/web/`:
```bash
cd apps/web
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/clipcode
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
```

Generate secret:
```bash
openssl rand -base64 32
```

Get GitHub OAuth credentials:
1. Go to https://github.com/settings/developers
2. Create new OAuth App
3. Homepage: `http://localhost:3000`
4. Callback: `http://localhost:3000/api/auth/callback/github`

#### 4. Setup Database
```bash
cd apps/web
pnpm db:migrate
pnpm db:seed
```

#### 5. Run Development Server
```bash
cd ../..
pnpm dev
```

#### 6. Open Browser
Visit: http://localhost:3000

## What's Inside

### Dashboard Pages
- `/` - Dashboard with stats
- `/snippets` - List all snippets
- `/snippets/new` - Create new snippet
- `/snippets/[slug]` - View snippet
- `/collections` - View collections
- `/tags` - View tags
- `/import` - Import snippets
- `/export` - Export snippets

### Features to Try

1. **Create a Snippet**
   - Click "New Snippet"
   - Fill in title, language, code
   - Save

2. **Search Snippets**
   - Use search bar on snippets page
   - Try full-text search
   - Apply filters

3. **Copy Code**
   - View any snippet
   - Click "Copy" button
   - Paste anywhere

4. **Favorites**
   - Click star icon on any snippet
   - Filter by favorites

5. **Import/Export**
   - Export all snippets to JSON
   - Try importing a Markdown file

### Sample Data

After seeding, you'll have:
- 3 demo users
- 10 tags (Database, API, React, etc.)
- 2 collections
- 12 sample snippets (C#, JS, SQL, TypeScript)

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

### GitHub Login Not Working
- Check GITHUB_ID and GITHUB_SECRET
- Verify callback URL matches
- Check OAuth app is authorized

### Build Errors
```bash
pnpm install
pnpm build
```

### Port Already in Use
```bash
# Change port in apps/web/.env
PORT=3001
```

## Development Tips

### Useful Commands
```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm format       # Format code
pnpm test         # Run tests
pnpm db:studio    # Open Prisma Studio
```

### Hot Reload
- Edits to components auto-refresh
- API routes need server restart
- Database changes need migration

### Debugging
- Check browser console for errors
- Check server logs in terminal
- Use Prisma Studio to inspect DB

## Next Steps

1. Customize the UI
2. Add your own snippets
3. Explore the API
4. Read the docs in `docs/`
5. Plan Sprint 2 features

Enjoy coding with clipcode! 🚀


