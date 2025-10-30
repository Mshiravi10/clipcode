# راهنمای Setup کردن GitHub OAuth

## مشکل:
وقتی کاربر جدید میخواد با GitHub login کنه، خطای 404 میگیره.

## راه حل:

### 1. تنظیمات GitHub OAuth App

برید به GitHub Settings:
1. `https://github.com/settings/developers`
2. روی OAuth App خودتون کلیک کنید (یا یکی جدید بسازید)
3. این تنظیمات رو وارد کنید:

```
Application name: ClipCodeAmin
Homepage URL: http://192.168.161.27:3000
Authorization callback URL: http://192.168.161.27:3000/api/auth/callback/github
```

⚠️ **مهم**: دقیقا همین URL رو وارد کنید: `http://192.168.161.27:3000/api/auth/callback/github`

### 2. Environment Variables

در فایل `apps/web/.env` این متغیرها رو چک کنید:

```env
# GitHub OAuth
GITHUB_ID=Iv23liKIVB09C8YpSPh0
GITHUB_SECRET=your_github_secret_here

# NextAuth
NEXTAUTH_URL=http://192.168.161.27:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 3. Generate کردن NEXTAUTH_SECRET

اگر `NEXTAUTH_SECRET` ندارید:

```bash
# در PowerShell:
openssl rand -base64 32

# یا در Node:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Restart کردن Dev Server

بعد از تغییر `.env`:

```powershell
# Ctrl+C برای توقف server
# سپس:
npm run dev
```

### 5. تست Authentication

1. برید به: `http://192.168.161.27:3000/auth/signin`
2. روی "Sign in with GitHub" کلیک کنید
3. GitHub باید شما رو redirect کنه به صفحه authorize
4. بعد از authorize، باید برگردید به dashboard

## مشکلات رایج:

### خطای 404 در Callback:
- ✅ چک کنید Callback URL در GitHub settings درسته
- ✅ چک کنید `NEXTAUTH_URL` در `.env` درسته
- ✅ Server رو restart کنید

### خطای "Invalid client":
- ✅ `GITHUB_ID` و `GITHUB_SECRET` رو دوباره چک کنید
- ✅ مطمئن بشید که در GitHub OAuth App، credentials رو کپی کردید

### خطای CORS:
- ✅ مطمئن بشید که Homepage URL و Callback URL با `NEXTAUTH_URL` match میکنن

## نکات امنیتی:

⚠️ **برای Production:**
- از HTTPS استفاده کنید
- IP رو با domain name جایگزین کنید
- `NEXTAUTH_SECRET` رو در production تغییر بدید
- GitHub OAuth App جداگانه برای production بسازید

## تست موفقیت:

```bash
# چک کردن اینکه NextAuth درست کار می‌کنه:
curl http://192.168.161.27:3000/api/auth/providers
```

باید یک JSON با GitHub provider برگردونه:

```json
{
  "github": {
    "id": "github",
    "name": "GitHub",
    "type": "oauth",
    "signinUrl": "http://192.168.161.27:3000/api/auth/signin/github",
    "callbackUrl": "http://192.168.161.27:3000/api/auth/callback/github"
  }
}
```

