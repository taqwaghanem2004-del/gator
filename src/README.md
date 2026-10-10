# Gator - Blog Aggregator CLI

أداة تتبع وإدارة مدونات ومقالات RSS من خلال سطر الأوامر (CLI) مصممة بلغة TypeScript وقاعدة بيانات PostgreSQL.

## طريقة التشغيل:
1. تثبيت الحزم: `npm install`
2. تشغيل الأوامر (مثل تسجيل مستخدم جديد أو إضافة مصدر مدونة):
   - تسجيل مستخدم: `npm run start register <username>`
   - تسجيل دخول: `npm run start login <username>`
   - بدء جمع المقالات: `npm run start agg 30s`