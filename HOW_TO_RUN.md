# 🚀 راهنمای صحیح اجرای پروژه

## ❌ اشتباه:
```powershell
cd apps/web
npm run dev  # این درست نیست!
```

## ✅ صحیح:
```powershell
# از ROOT directory پروژه:
cd D:\CVProjects\clipcode
pnpm dev
```

## چرا؟

این یک **Turborepo monorepo** است که:
- از `turbo` برای مدیریت workspace ها استفاده می‌کنه
- Environment variables باید از root load بشن
- Dependencies بین packages باید resolve بشن

## 📝 مراحل صحیح اجرا:

### 1. متوقف کردن server فعلی
اگر با `npm run dev` اجرا کردید، `Ctrl+C` بزنید

### 2. رفتن به root directory
```powershell
cd D:\CVProjects\clipcode
```

### 3. نصب dependencies (اگر هنوز نکردید)
```powershell
pnpm install
```

### 4. اجرای dev server
```powershell
pnpm dev
```

این command به صورت خودکار:
- Turbo را اجرا می‌کنه
- Environment variables را load می‌کنه
- Next.js را با IP صحیح start می‌کنه (`192.168.161.27`)

### 5. دسترسی به app
```
http://192.168.161.27:3000
```

## 🔍 تست صحت اجرا:

بعد از start شدن server، این دستور رو اجرا کنید:
```powershell
curl http://192.168.161.27:3000/api/auth/providers
```

باید JSON با provider های GitHub برگرده.

## 🐛 Troubleshooting:

### اگر pnpm نصب نیست:
```powershell
npm install -g pnpm@8.15.0
```

### اگر خطای port گرفتید:
```powershell
# پیدا کردن process روی port 3000
netstat -ano | findstr :3000

# Kill کردن process (PID رو از خروجی بالا بگیرید)
taskkill /PID <PID> /F
```

### پاک کردن cache و شروع مجدد:
```powershell
pnpm clean
pnpm install
pnpm dev
```

## ✨ بعد از اجرای صحیح:

GitHub OAuth باید بدون مشکل کار کنه و بعد از login:
1. ✅ Session در database ذخیره میشه
2. ✅ User redirect میشه به dashboard
3. ✅ Auth logs کامل ثبت میشن

