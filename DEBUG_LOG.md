# clipcode Debug Log

## Active Issues

| Status | Priority | Issue | Location | Error | Solution | Fixed |
|--------|----------|-------|----------|-------|----------|-------|
| 🔴 Critical | P0 | GitHub OAuth sign-in stuck in redirect loop | Authentication | State cookie missing, constant redirects between /auth/signin and / | Need to handle state cookie properly with IP address | ❌ No |
| 🔴 Critical | P0 | Unknown argument `refresh_token_expires_in` in Account model | apps/web/prisma/schema.prisma | Prisma error when creating account during OAuth | Add field to Account model | ✅ Yes |
| 🟡 Major | P1 | Cross-origin request blocked from IP address | next.config.mjs | Warnings about blocked requests from 192.168.161.27 | Added allowedDevOrigins to config | ✅ Yes |

## Resolved Issues

### ✅ Issue #1: Missing refresh_token_expires_in Field
**Timestamp**: 2025-01-XX
**Status**: RESOLVED

**Problem**: 
```
Invalid `prisma.account.create()` invocation:
Unknown argument `refresh_token_expires_in`. Available options are marked with ?.
```

**Root Cause**: GitHub OAuth returns `refresh_token_expires_in` field, but Prisma Account model didn't have this field defined.

**Location**: `apps/web/prisma/schema.prisma` (Line 114-132)

**Solution Applied**:
1. Added `refresh_token_expires_in Int?` to Account model in schema.prisma
2. Ran `pnpm prisma db push` to update database
3. Regenerated Prisma client

**Files Changed**:
- `apps/web/prisma/schema.prisma`

**Verification**: Schema updated, but sign-in still failing with redirect loop.

---

### ✅ Issue #2: Cross-Origin Request Blocked
**Timestamp**: 2025-01-XX
**Status**: RESOLVED

**Problem**: 
```
⚠ Blocked cross-origin request from 192.168.161.27 to /_next/* resource
```

**Root Cause**: Next.js blocking requests from IP address in development mode.

**Location**: `apps/web/next.config.mjs`

**Solution Applied**:
```javascript
const nextConfig = {
    allowedDevOrigins: ['192.168.161.27:3000', 'localhost:3000'],
};
```

**Files Changed**:
- `apps/web/next.config.mjs`

**Verification**: Warnings stopped appearing after server restart.

---

## Current Active Issue

### 🔴 Issue #3: GitHub OAuth Redirect Loop
**Timestamp**: 2025-01-XX
**Status**: ACTIVE
**Priority**: P0 - Critical

**Error Messages**:
1. Initial attempt:
```
[next-auth][error][OAUTH_CALLBACK_ERROR]
State cookie was missing.
```

2. After schema fix:
```
GET /auth/signin?callbackUrl=http%3A%2F%2F192.168.161.27%3A3000%2F 307 in Xms
GET /api/auth/signin?callbackUrl=%2F 302 in Xms
(Infinite loop)
```

**Symptoms**:
- User clicks "Sign in with GitHub"
- Redirects to GitHub authorization
- GitHub redirects back to app
- App immediately redirects to `/auth/signin` again
- Process repeats indefinitely
- Console shows constant redirects: `GET /auth/signin` → `GET /api/auth/signin` → repeat

**Evidence from Logs**:
```
web:dev: prisma:query SELECT "public"."Session"."id", "public"."Session"."sessionToken", ...
web:dev: GET /auth/signin?callbackUrl=http%3A%2F%2F192.168.161.27%3A3000%2F 307 in 34ms
web:dev: GET /api/auth/signin?callbackUrl=%2F 302 in 11ms
web:dev: prisma:query SELECT "public"."Session"."id", "public"."Session"."sessionToken", ...
(Gets stuck in this loop)
```

**Attempted Fixes**:
1. ✅ Added `refresh_token_expires_in` field to Account model
2. ✅ Updated NextAuth config with cookie settings:
   ```typescript
   cookies: {
       state: {
           name: 'next-auth.state',
           options: {
               httpOnly: true,
               sameSite: 'lax',
               path: '/',
               secure: false,
           },
       },
   },
   useSecureCookies: false,
   ```
3. ✅ Added `allowedDevOrigins` to next.config.mjs

**Current Configuration**:
```env
# apps/web/.env
DATABASE_URL=postgresql://postgres:123@localhost:5432/clipcode
NEXTAUTH_SECRET=your_secret_change_this_in_production_123456789
NEXTAUTH_URL=http://192.168.161.27:3000
GITHUB_ID=Iv23liKIVB09C8YpSPh0
GITHUB_SECRET=8928ab8336863dd61862c6f08e5e14a87d8efb6d
```

**Observations**:
- OAuth code is being received from GitHub (`code=...`)
- State parameter is present in callback URL
- Session queries are running
- But cannot establish session

**Possible Root Causes**:
1. **Cookie domain/path mismatch**: Cookies set for one domain but read from another
2. **Session not being created**: Account creation might be failing silently
3. **Middleware redirect loop**: Middleware protecting / but session validation failing
4. **Browser cookie issues**: Third-party cookies or SameSite restrictions

**Next Steps to Debug**:
1. [ ] Check browser DevTools → Application → Cookies for `next-auth.*` cookies
2. [ ] Add detailed logging to auth flow to see where it fails
3. [ ] Test with `localhost` instead of IP address
4. [ ] Check if session is actually being created in database
5. [ ] Verify GitHub OAuth callback URL matches exactly

**Test Commands**:
```bash
# Check if user was created
cd apps/web
pnpm prisma studio

# Check cookies in browser
# DevTools → Application → Cookies → http://192.168.161.27:3000
```

**Files to Investigate**:
- `apps/web/lib/auth.ts` (NextAuth config)
- `apps/web/middleware.ts` (Protected routes)
- `apps/web/app/(dashboard)/layout.tsx)$` (Requires auth)
- `apps/web/app/auth/signin/page.tsx` (Sign-in page)

---

## Configuration Reference

### Environment Variables
```
DATABASE_URL=postgresql://postgres:123@localhost:5432/clipcode
NEXTAUTH_SECRET=your_secret_change_this_in_production_123456789
NEXTAUTH_URL=http://192.168.161.27:3000
GITHUB_ID=Iv23liKIVB09C8YpSPh0
GITHUB_SECRET=8928ab8336863dd61862c6f08e5e14a87d8efb6d
```

### GitHub OAuth App Settings
- Homepage URL: `http://192.168.161.27:3000`
- Callback URL: `http://192.168.161.27:3000/api/auth/callback/github`

### Database Status
- ✅ PostgreSQL running on port 5432
- ✅ Database `clipcode` exists
- ✅ All tables created
- ✅ Seed data loaded (3 users, 10 tags, 2 collections, 12 snippets)

### Server Status
- ✅ Running on http://localhost:3000
- ✅ Running on http://192.168.161.27:3000
- ✅ Prisma Client generated
- ✅ All dependencies installed

---

## Quick Troubleshooting Guide

### Sign-in Not Working?
1. Check browser cookies for `next-auth.*`
2. Clear all cookies for the site
3. Check GitHub OAuth callback URL is exact match
4. Try `localhost:3000` instead of IP

### Database Issues?
```bash
cd apps/web
pnpm prisma studio
# Inspect tables manually
```

### Prisma Schema Issues?
```bash
cd apps/web
pnpm prisma generate
pnpm prisma db push
```

### Need to Restart?
```bash
Stop-Process -Name "node" -Force
cd D:\CVProjects;\;\clipcode
pnpm dev
```

---

## Report New Issues

When reporting a new issue, include:
- [ ] Screenshot of error (if visible)
- [ ] Relevant terminal logs
- [ ] Browser console errors
- [ ] What action led to the error
- [ ] Expected vs actual behavior

