# راهنمای Regenerate کردن Prisma Client

## مشکل:
بعد از آپدیت schema، Prisma Client هنوز schema جدید رو نداره و خطای `Unknown argument isPublic` میده.

## راه حل:

### 1. Dev server رو متوقف کنید (Ctrl+C)

### 2. Prisma Client رو regenerate کنید:
```bash
cd apps/web
npx prisma generate
```

### 3. اگر خطای EPERM گرفتید، این دستورات رو به ترتیب اجرا کنید:
```powershell
# از دایرکتوری apps/web
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
npx prisma generate
```

### 4. Dev server رو دوباره start کنید:
```bash
npm run dev
```

## یا به صورت خلاصه (PowerShell):
```powershell
# در دایرکتوری apps/web
# 1. توقف dev server با Ctrl+C
# 2. اجرای این دستورات:
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
npx prisma generate
npm run dev
```

## تایید موفقیت:
بعد از regenerate، صفحه `/collections/configs` (یا هر collection دیگه) باید بدون خطا کار کنه.

## توضیح:
- فیلد `isPublic` به schema اضافه شد و با `prisma db push` به دیتابیس اضافه شد
- ولی TypeScript types و Prisma Client هنوز schema قدیمی رو دارن
- با `prisma generate` این فایل‌های type و client به‌روز میشن

