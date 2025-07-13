# 🚀 راهنمای کامل دیپلوی در Vercel

## 📋 مشخصات پروژه

### Framework: Next.js 14
### Database: MySQL (External)
### Deployment Platform: Vercel

---

## 🔧 تنظیمات Build در Vercel

### 1. **Framework Preset**
```
Next.js
```

### 2. **Build Command**
```bash
npm run build
```

### 3. **Output Directory**
```
.next
```

### 4. **Install Command**
```bash
npm install
```

### 5. **Development Command**
```bash
npm run dev
```

---

## 🌍 Environment Variables

در بخش **Settings > Environment Variables** این متغیرها را اضافه کنید:

```env
DB_HOST=217.144.107.147
DB_USER=hxkxytfs_ahmad
DB_PASSWORD=Avan.1386
DB_NAME=hxkxytfs_mami
JWT_SECRET=mamiland_secret_key_2024
LANGCHAIN_API_URL=https://mine-gpt-alpha.vercel.app/proxy
NODE_ENV=production
```

**نکته مهم:** هر متغیر را در سه محیط اضافه کنید:
- ✅ Production
- ✅ Preview  
- ✅ Development

---

## 📂 ساختار فایل‌های مهم

```
project/
├── app/                    # Next.js App Router
├── lib/                    # کتابخانه‌ها و utilities
├── vercel.json            # تنظیمات Vercel
├── next.config.js         # تنظیمات Next.js
├── package.json           # Dependencies
└── .env.example           # نمونه متغیرهای محیطی
```

---

## 🎯 مراحل دیپلوی قدم به قدم

### مرحله 1: آماده‌سازی Repository

```bash
# 1. اضافه کردن تمام فایل‌ها
git add .

# 2. Commit کردن تغییرات
git commit -m "Ready for Vercel deployment"

# 3. Push به GitHub
git push origin main
```

### مرحله 2: ایجاد پروژه در Vercel

1. **وارد Vercel شوید:**
   - به [vercel.com](https://vercel.com) بروید
   - با GitHub account وارد شوید

2. **پروژه جدید ایجاد کنید:**
   - روی **"New Project"** کلیک کنید
   - Repository خود را پیدا کنید
   - **"Import"** کلیک کنید

### مرحله 3: تنظیمات Build

در صفحه **Configure Project**:

```
Project Name: mamiland-chatbot
Framework Preset: Next.js
Root Directory: ./
Build and Output Settings: (Default)
```

**Build Settings:**
- Build Command: `npm run build` (پیش‌فرض)
- Output Directory: `.next` (پیش‌فرض)
- Install Command: `npm install` (پیش‌فرض)

### مرحله 4: تنظیم Environment Variables

در همین صفحه، بخش **Environment Variables** را باز کنید:

```
Key: DB_HOST
Value: 217.144.107.147

Key: DB_USER  
Value: hxkxytfs_ahmad

Key: DB_PASSWORD
Value: Avan.1386

Key: DB_NAME
Value: hxkxytfs_mami

Key: JWT_SECRET
Value: mamiland_secret_key_2024

Key: LANGCHAIN_API_URL
Value: https://mine-gpt-alpha.vercel.app/proxy

Key: NODE_ENV
Value: production
```

### مرحله 5: Deploy

- **"Deploy"** کلیک کنید
- منتظر بمانید تا build تمام شود (معمولاً 2-3 دقیقه)

---

## 🔍 بررسی عملکرد

### پس از دیپلوی موفق:

1. **صفحه اصلی:** `https://your-project.vercel.app`
2. **ثبت نام:** `/register`
3. **ورود:** `/login`
4. **چت:** `/chat`
5. **پنل ادمین:** `/admin`

### تست کردن:

```
✅ صفحه اصلی لود می‌شود
✅ کد دسترسی کار می‌کند
✅ ثبت نام کار می‌کند
✅ ورود کار می‌کند
✅ چت با AI کار می‌کند
✅ پنل ادمین کار می‌کند
```

---

## 🐛 عیب‌یابی

### مشکلات رایج:

#### 1. Database Connection Error
```
خطا: Connection refused
حل: بررسی Environment Variables
```

#### 2. Build Error
```
خطا: Module not found
حل: بررسی dependencies در package.json
```

#### 3. API Timeout
```
خطا: Function timeout
حل: افزایش timeout در vercel.json
```

### مشاهده Logs:

1. **Functions Tab** در Vercel Dashboard
2. **Real-time logs** در حین استفاده
3. **Build logs** در تب Deployments

---

## ⚙️ تنظیمات پیشرفته

### Custom Domain:
1. **Settings > Domains**
2. اضافه کردن domain سفارشی
3. تنظیم DNS records

### Performance:
- **Edge Functions** برای سرعت بیشتر
- **Image Optimization** خودکار
- **CDN** جهانی

---

## 📞 پشتیبانی

### مشکل داشتید؟
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs:** [nextjs.org/docs](https://nextjs.org/docs)
- **Developer:** Ahmadreza.Avandi@gmail.com

---

## 🎉 تبریک!

پروژه مامی‌لند شما با موفقیت در Vercel دیپلوی شد!

**URL پروژه:** `https://your-project-name.vercel.app`

---

**تمامی حقوق محفوظ است مامی‌لند © 2025**
**Developed by Ahmadreza.Avandi@gmail.com**