# 🚀 راهنمای دیپلوی در Vercel - مامی‌لند

## 📋 پیش‌نیازها

### 1. Repository در GitHub
- کد پروژه باید در GitHub باشد
- Branch اصلی: `main`

### 2. حساب Vercel
- ثبت نام در [vercel.com](https://vercel.com)
- اتصال به GitHub account

## 🔧 مراحل دیپلوی

### مرحله 1: ایجاد پروژه در Vercel

1. **وارد Vercel شوید**
2. **New Project** کلیک کنید
3. **Repository** خود را انتخاب کنید
4. **Import** کلیک کنید

### مرحله 2: تنظیمات Build

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Root Directory: ./
```

### مرحله 3: Environment Variables

در بخش **Environment Variables** این متغیرها را اضافه کنید:

```env
DB_HOST=217.144.107.147
DB_USER=hxkxytfs_ahmad
DB_PASSWORD=Avan.1386
DB_NAME=hxkxytfs_mami
JWT_SECRET=mamiland_secret_key_2024
LANGCHAIN_API_URL=https://mine-gpt-alpha.vercel.app/proxy
NODE_ENV=production
```

**⚠️ مهم:** هر متغیر را برای هر سه محیط تنظیم کنید:
- ✅ Production
- ✅ Preview
- ✅ Development

### مرحله 4: Deploy

- **Deploy** کلیک کنید
- منتظر بمانید تا build تمام شود

## 🔍 تست عملکرد

### پس از دیپلوی موفق:

1. **تست API:** `https://your-app.vercel.app/api/test`
2. **تست دیتابیس:** `https://your-app.vercel.app/api/test-db`
3. **مقداردهی دیتابیس:** `POST https://your-app.vercel.app/api/init-db`

### ورود ادمین:

- **URL:** `https://your-app.vercel.app/admin`
- **نام کاربری:** `admin`
- **رمز عبور:** `1`

## 🐛 عیب‌یابی

### مشکلات رایج:

#### 1. Build Error
```
Error: Could not read package.json
```
**حل:** بررسی کنید که `package.json` در root directory باشد

#### 2. Database Connection Error
```
Error: Connection refused
```
**حل:** Environment Variables را بررسی کنید

#### 3. Function Timeout
```
Error: Function timeout
```
**حل:** در `vercel.json` timeout افزایش یافته (30s)

### مشاهده Logs:

1. **Functions Tab** در Vercel Dashboard
2. **Real-time logs** در Runtime
3. **Build logs** در Deployments

## 📊 بررسی نهایی

### ✅ Checklist:

- [ ] Repository در GitHub موجود است
- [ ] Environment Variables تنظیم شده
- [ ] Build موفق بوده
- [ ] `/api/test` کار می‌کند
- [ ] `/api/test-db` اتصال دیتابیس را تأیید می‌کند
- [ ] ورود ادمین با `admin` / `1` کار می‌کند
- [ ] صفحه اصلی لود می‌شود

## 🎯 نکات مهم

1. **رمز ادمین:** `1` (یک کاراکتر)
2. **Timeout:** 30 ثانیه برای API calls
3. **Database:** MySQL external
4. **SSL:** خودکار توسط Vercel

## 📞 پشتیبانی

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Developer:** Ahmadreza.Avandi@gmail.com

---

**تمامی حقوق محفوظ است مامی‌لند © 2025**