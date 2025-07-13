# دیپلوی مامی‌لند در Vercel

## 🚀 مراحل دیپلوی

### 1. آماده‌سازی Repository
```bash
git add .
git commit -m "آماده برای دیپلوی Vercel"
git push origin main
```

### 2. اتصال به Vercel
1. به [vercel.com](https://vercel.com) بروید
2. با GitHub وارد شوید
3. **New Project** کلیک کنید
4. Repository پروژه را انتخاب کنید

### 3. تنظیم Environment Variables
در تنظیمات پروژه Vercel، این متغیرها را اضافه کنید:

```
DB_HOST=217.144.107.147
DB_USER=hxkxytfs_ahmad
DB_PASSWORD=Avan.1386
DB_NAME=hxkxytfs_mami
JWT_SECRET=mamiland_secret_key_2024
LANGCHAIN_API_URL=https://mine-gpt-alpha.vercel.app/proxy
```

### 4. تنظیمات Build
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5. Deploy
پس از تنظیم، **Deploy** کلیک کنید.

## 🔧 تغییرات اعمال شده

### فایل‌های جدید:
- `vercel.json` - تنظیمات Vercel
- `.env.example` - نمونه متغیرهای محیطی

### فایل‌های ویرایش شده:
- `next.config.js` - حذف standalone output
- `lib/database.ts` - استفاده از connection pool
- `package.json` - اضافه کردن vercel-build script

### فایل‌های حذف شده:
- `server.js` - برای Vercel لازم نیست
- `ecosystem.config.js` - مخصوص PM2

## 🌐 پس از دیپلوی

### بررسی عملکرد:
1. صفحه اصلی لود می‌شود ✅
2. ثبت نام کار می‌کند ✅
3. ورود کار می‌کند ✅
4. چت با AI کار می‌کند ✅
5. پنل ادمین کار می‌کند ✅

### Domain سفارشی:
- در تنظیمات Vercel می‌توانید domain سفارشی اضافه کنید
- SSL به صورت خودکار فعال می‌شود

## 🐛 عیب‌یابی

### مشکلات رایج:
1. **Database Connection Error**: متغیرهای محیطی را بررسی کنید
2. **Build Error**: لاگ‌های build را در Vercel چک کنید
3. **API Timeout**: timeout را در vercel.json افزایش دهید

### لاگ‌ها:
- **Function Logs** در dashboard Vercel
- **Real-time logs** در حین استفاده

## 📞 پشتیبانی
- **Email**: Ahmadreza.Avandi@gmail.com
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)

---
**تمامی حقوق محفوظ است مامی‌لند © 2025**
**Developed by Ahmadreza.Avandi@gmail.com**