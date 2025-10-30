# Migration Guide - Clipcode Refactor

## Overview

This guide helps you migrate from the original clipcode codebase to the refactored version with Sprint 2 features.

## Step 1: Backup Current Data

```bash
# Backup your database
pg_dump clipcode > clipcode_backup.sql

# Backup your .env file
cp apps/web/.env apps/web/.env.backup
```

## Step 2: Install Dependencies

```bash
# Install new dependencies (liquidjs)
pnpm install
```

## Step 3: Update Environment Variables

```bash
cd apps/web

# Use the new env.example as reference
cp env.example .env

# Make sure these are set:
DATABASE_URL=postgresql://postgres:123@localhost:5432/clipcode
NEXTAUTH_SECRET=your_secret_change_this_in_production_123456789
NEXTAUTH_URL=http://192.168.161.27:3000  # Or your IP
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
NODE_ENV=development
DEV_HOST=192.168.161.27  # Or your IP
```

## Step 4: Run Database Migrations

The schema has been enhanced with new fields and models. Run the migration:

```bash
cd apps/web

# Generate Prisma client
pnpm prisma generate

# Option A: Quick migration (development)
pnpm prisma db push

# Option B: Create and run migration (recommended)
pnpm prisma migrate dev --name add_sprint2_features
```

### New Schema Changes

#### Enhanced Snippet Model:
- `isEncrypted` (Boolean) - Track if code is encrypted
- `simhash` (String) - Store similarity hash
- `gistId` (String) - Link to GitHub Gist
- `gistUrl` (String) - Gist URL reference
- `code` field changed to `@db.Text` (larger storage)

#### New Models:
- `SnippetVersion` - Version history tracking
- `UserPreferences` - User settings and preferences

#### Enhanced User Model:
- `preferences` relation added

## Step 5: Verify Authentication

The authentication configuration has been completely rewritten to fix the OAuth redirect loop.

### Test Authentication:
1. Start the development server
```bash
pnpm dev
```

2. Navigate to http://192.168.161.27:3000
3. Click "Sign in with GitHub"
4. Verify you're redirected properly without loops
5. Check that you can access the dashboard

### If Authentication Fails:

1. **Clear browser cookies** for the site
2. **Verify GitHub OAuth settings**:
   - Homepage URL: `http://192.168.161.27:3000`
   - Callback URL: `http://192.168.161.27:3000/api/auth/callback/github`
3. **Check environment variables** are correct
4. **Regenerate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

## Step 6: Test New Features

### 6.1 Template Rendering

Create a snippet with template syntax:

```javascript
class {{ className }} {
  constructor() {
    this.name = '{{ name | pascal }}';
  }
}
```

Test the API:

```bash
curl -X POST http://192.168.161.27:3000/api/snippets/SNIPPET_ID/render \
  -H "Content-Type: application/json" \
  -d '{"variables": {"className": "MyClass", "name": "my name"}}'
```

### 6.2 Similar Snippets

```bash
curl http://192.168.161.27:3000/api/snippets/SNIPPET_ID/similar?threshold=0.85
```

### 6.3 GitHub Gist Sync

Get a GitHub Personal Access Token:
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `gist` scope
4. Copy the token

Test sync:

```bash
# Pull all Gists
curl "http://192.168.161.27:3000/api/gist/sync?token=YOUR_TOKEN&limit=5"

# Push snippet to Gist
curl -X POST http://192.168.161.27:3000/api/gist/sync \
  -H "Content-Type: application/json" \
  -d '{"snippetId": "SNIPPET_ID", "token": "YOUR_TOKEN"}'
```

## Step 7: Check Logs

Watch for any errors:

```bash
# In the terminal running pnpm dev
# Look for:
# - Database query logs
# - Authentication events
# - API errors
```

## Rollback Procedure

If you need to roll back:

```bash
# Restore database backup
psql clipcode < clipcode_backup.sql

# Restore old .env
cp apps/web/.env.backup apps/web/.env

# Reset to previous code
git reset --hard HEAD~N  # Where N is number of commits to roll back
```

## Breaking Changes

### API Changes
- All API routes now use standardized response format:
  - Success: `{ data: {...} }`
  - Error: `{ error: "message", details: {...} }`

### Database Changes
- `Snippet.code` field now `@db.Text` (no size limit)
- New required indexes added automatically
- New models added (non-breaking for existing data)

### Authentication
- Cookie configuration changed (transparent to users)
- Session strategy remains database-based
- No action needed for existing sessions

## Common Issues

### Issue 1: "Prisma Client not generated"
**Solution:**
```bash
cd apps/web
pnpm prisma generate
```

### Issue 2: "Rate limit exceeded"
**Cause:** Testing too quickly
**Solution:** Wait 15 minutes or restart server to reset rate limits

### Issue 3: "Template rendering error"
**Cause:** Invalid Liquid syntax
**Solution:** Use the `/render` GET endpoint to validate template first

### Issue 4: "Gist sync fails"
**Cause:** Invalid or expired GitHub token
**Solution:** Generate new token with `gist` scope

### Issue 5: Migration fails with "column already exists"
**Solution:** Your database might be partially migrated. Run:
```bash
pnpm prisma db push --force-reset  # WARNING: Resets database
# Then restore your data from backup
psql clipcode < clipcode_backup.sql
```

## Performance Notes

### Rate Limiting
- Current implementation uses in-memory storage
- Rate limits reset on server restart
- For production: Consider Redis-based rate limiting

### Encryption
- Encryption is opt-in per snippet
- Performance impact: ~50ms per snippet encrypt/decrypt
- Cached in memory for session

### Similarity Detection
- SimHash computation: ~10-50ms per snippet
- Results cached for 5 minutes
- Bulk operations may be slow with 1000+ snippets

## Monitoring

Watch these metrics after migration:

1. **Authentication Success Rate**
   - Should be 100% after login
   - Check ErrorLog table for auth errors

2. **API Response Times**
   - Should remain under 200ms for most operations
   - Template rendering: 50-100ms
   - Similarity detection: 100-500ms

3. **Database Query Performance**
   - New indexes should improve search speed
   - Monitor slow query log

4. **Error Rates**
   - Check ErrorLog table regularly
   - Set up alerts for critical errors

## Support

If you encounter issues:

1. Check `REFACTOR_PROGRESS.md` for known issues
2. Review `DEBUG_LOG.md` for debugging tips
3. Check database logs: `apps/web/view-logs.sh`
4. Enable debug mode: Set `NODE_ENV=development` in `.env`

## Next Steps

After successful migration:

1. ✅ Test all existing features
2. ✅ Test new Sprint 2 features
3. ⏳ Build UI for new features
4. ⏳ Add comprehensive tests
5. ⏳ Update documentation

## Verification Checklist

- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database migrated successfully
- [ ] Authentication working (no redirect loops)
- [ ] Can create/read/update/delete snippets
- [ ] Search functionality works
- [ ] Import/Export works
- [ ] Template rendering API works
- [ ] Similar snippets detection works
- [ ] Gist sync works (with token)
- [ ] No console errors
- [ ] No database errors in logs

## Success!

If all checklist items are complete, your migration is successful! 🎉

The refactored codebase includes:
- ✅ Fixed authentication
- ✅ Better error handling
- ✅ Rate limiting
- ✅ Template engine
- ✅ Encryption support
- ✅ Duplicate detection
- ✅ GitHub Gist sync
- ✅ Version history support (schema ready)
- ✅ User preferences (schema ready)

