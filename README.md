# Coach — AbdelNasser Educational Platform

نسخة موحدة وخفيفة لمنصة Coach، مبنية على Firebase Realtime Database مع صفحات الطالب والإدارة والاختبارات وتكامل Telegram من خلال Cloud Functions.

## الهيكل
- `index.html` — الصفحة الرئيسية + التصميم + قسم Sports Motion + روابط الدعم.
- `login.html` / `register.html` — دخول وتسجيل الطلاب.
- `student.html` — لوحة الطالب.
- `quiz.html` — محرك الاختبارات.
- `admin-login.html` / `admin.html` — لوحة الإدارة.
- `css/index.css` — التصميم الموحد.
- `js/` — منطق Firebase والصفحات.
- `functions/index.js` — دخول الطالب + رسائل Telegram + أزرار قبول/رفض + webhook.

## Firebase الحالي
المشروع مضبوط على Firebase project `abodaa` وRealtime Database الحالية، ويحافظ على العقد القديمة: `students`, `notifications`, `quiz_results`, `quizzes`, `content_views`, `stats`.

## Telegram
التوكن لا يوضع في GitHub أو ملفات الواجهة. ضعه كـFirebase Functions secret باسم `TELEGRAM_BOT_TOKEN`. ويمكن استخدام `TELEGRAM_CHAT_ID=5926610601`. البوت يرسل طلب التسجيل بأزرار Accept/Reject، والضغط عليها يغير حالة الطالب في Firebase. بعد النشر اضبط webhook على endpoint الخاص بالدالة `telegramWebhook`.

## WhatsApp Channel
الواجهة تضع شرط تأكيد الانضمام قبل التسجيل/الدخول وتوفر رابط القناة. هذا تأكيد واجهة فقط؛ الموقع العادي لا يستطيع إثبات عضوية WhatsApp Channel تلقائيًا بدون آلية/API تحقق مدعومة.

## الإدارة
Primary Admin كامل الصلاحيات، وBackup Admin للمحتوى والاختبارات. أنشئ حسابي Firebase Authentication وأضف `adminUsers/{uid}/role` بقيمة `primary` أو `backup`.

## ملاحظة البيانات القديمة
البيانات المصدرة الحالية تحتوي على `quiz_results` كسجلات مسطحة، لذلك لوحة الإدارة تقرأ الشكل القديم والجديد بدل تجاهل النتائج القديمة.
