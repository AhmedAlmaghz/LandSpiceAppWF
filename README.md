This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# نظام إدارة لاند سبايس

نظام متكامل لإدارة تصنيع وتوزيع عبوات الشطة والكاتشب المخصصة للمطاعم مع إدارة العقود والضمانات البنكية وسير العمل المتقدم.

## 🚀 المزايا الرئيسية

- **إدارة المستخدمين**: نظام أدوار وصلاحيات متقدم للمطاعم والبنوك والموردين
- **سير العمل الذكي**: محرك workflow متقدم لإدارة العمليات خطوة بخطوة
- **إدارة العقود**: تتبع العقود والضمانات البنكية مع التجديد التلقائي
- **إدارة المخزون**: تتبع المخزون والتنبيهات الذكية عند النقص
- **النظام المالي**: فوترة تلقائية وإدارة المدفوعات والأقساط البنكية
- **التقارير والإحصائيات**: لوحات معلومات شاملة وتقارير تفصيلية

## 🛠️ المكدس التقني

### Frontend
- **Next.js** 15.5.3 (App Router)
- **React** 19.1.1 مع TypeScript 5.9.2
- **Tailwind CSS** 4.1.13 للتصميم المتجاوب
- **Zustand** 5.0.8 لإدارة الحالة
- **Cairo Font** للدعم العربي المتقدم

### Backend & Database
- **Prisma** 6.16.1 كـ ORM
- **PostgreSQL** قاعدة البيانات الرئيسية
- **NextAuth** 5 للمصادقة والتفويض
- **bcryptjs** 3.0.2 لتشفير كلمات المرور
- **Zod** 4.1.8 للتحقق من البيانات

## 📁 هيكل المشروع

```
├── prisma/                 # مخططات قاعدة البيانات
│   ├── schema.prisma       # نماذج البيانات
│   └── seed.ts            # البيانات الأولية
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API Routes
│   │   ├── auth/         # صفحات المصادقة
│   │   └── globals.css   # الأنماط العامة
│   ├── components/        # المكونات القابلة لإعادة الاستخدام
│   │   ├── ui/           # مكونات واجهة المستخدم
│   │   └── layout/       # مكونات التخطيط
│   └── lib/              # المكتبات والأدوات
│       ├── auth.ts       # إعدادات NextAuth
│       ├── prisma.ts     # إعداد Prisma Client
│       ├── store.ts      # متاجر Zustand
│       ├── utils.ts      # دوال مساعدة
│       └── validations.ts # مخططات التحقق
├── Plan/                  # وثائق التخطيط
│   ├── product-roadmap.md # خارطة طريق المنتج
│   └── detailed-tasks.md  # المهام التفصيلية
└── env.example           # مثال على متغيرات البيئة
```

## 🚀 البدء السريع

### 1. تحضير البيئة

```bash
# نسخ متغيرات البيئة
cp env.example .env

# تحرير متغيرات البيئة المطلوبة
# DATABASE_URL, NEXTAUTH_SECRET, etc.
```

### 2. تثبيت التبعيات

```bash
npm install
```

### 3. إعداد قاعدة البيانات

```bash
# إنشاء قاعدة البيانات والجداول
npx prisma db push

# تشغيل البيانات الأولية
npm run db:seed

# (اختياري) فتح Prisma Studio
npm run db:studio
```

### 4. تشغيل الخادم المحلي

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في متصفحك.

## 🔐 بيانات الدخول الافتراضية

### مدير النظام
- **اسم المستخدم:** `admin`
- **كلمة المرور:** `Admin@123456`

### بيانات تجريبية (في بيئة التطوير فقط)
- **البنك:** `alqasemi_bank` / `Bank@123456`
- **المورد:** `print_supplier` / `Supplier@123456`
- **المسوق:** `ahmed_marketer` / `Marketer@123456`
- **المطعم:** `albaik_rest` / `Restaurant@123456`

## 🏗️ الوحدات الوظيفية

| الأولوية | الوحدة | الحالة | الوصف |
|----------|---------|-------|-------|
| 1 | البنية التحتية | ✅ مكتملة | Next.js + Prisma + NextAuth |
| 2 | إدارة المستخدمين | 🔄 قيد التطوير | الأدوار والصلاحيات |
| 3 | لوحات التحكم | ⏳ مخططة | Dashboards مخصصة |
| 4 | محرك Workflow | ⏳ مخططة | إدارة سير العمل |
| 5 | إدارة المطاعم | ⏳ مخططة | العقود والتسجيل |

## 📊 قاعدة البيانات

النظام يستخدم PostgreSQL مع 15+ جدول رئيسي:

- **Users & Roles**: إدارة المستخدمين والصلاحيات
- **Restaurants**: بيانات المطاعم وحالتها  
- **Contracts & Guarantees**: العقود والضمانات البنكية
- **Designs**: تصاميم العبوات ومراحل الموافقة
- **Print Orders**: أوامر الطباعة الجماعية
- **Invoices & Payments**: الفواتير والمدفوعات
- **Workflow Engine**: محرك سير العمل والحالات

## 🔧 أوامر مفيدة

```bash
# التطوير
npm run dev              # تشغيل خادم التطوير
npm run build           # بناء المشروع للإنتاج
npm run start           # تشغيل المشروع في بيئة الإنتاج

# قاعدة البيانات
npm run db:generate     # توليد Prisma Client
npm run db:push         # دفع التغييرات لقاعدة البيانات
npm run db:migrate      # إنشاء migration جديد
npm run db:studio       # فتح Prisma Studio
npm run db:seed         # تشغيل البيانات الأولية

# جودة الكود
npm run lint           # فحص الأخطاء
```

## 🌐 الدعم متعدد اللغات

النظام مصمم للدعم الكامل للغة العربية:
- **RTL Layout**: تخطيط من اليمين لليسار
- **Arabic Typography**: خط Cairo المحسن
- **Localized UI**: واجهة مستخدم باللغة العربية
- **Arabic Validation Messages**: رسائل خطأ عربية

## 🔒 الأمان والصلاحيات

- **Row Level Security (RLS)**: أمان على مستوى الصف
- **Role-based Access Control**: التحكم بناء على الأدوار
- **JWT Authentication**: مصادقة آمنة بـ JWT
- **Password Encryption**: تشفير كلمات المرور
- **Audit Logging**: تسجيل جميع العمليات

## 📝 المساهمة

1. Fork المشروع
2. إنشاء feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للـ branch (`git push origin feature/AmazingFeature`)
5. إنشاء Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT. راجع ملف `LICENSE` للتفاصيل.

## 🆘 الدعم

لأي استفسارات أو مشاكل:
- افتح Issue في GitHub
- راجع [التوثيق التفصيلي](./Plan/detailed-tasks.md)
- تواصل مع فريق التطوير

---

**طُور بـ ❤️ لشركة لاند سبايس**
