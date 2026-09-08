# Setup — Coach

1. Firebase Authentication → Email/Password → Enable.
2. أنشئ حساب Primary وحساب Backup.
3. في Realtime Database: `adminUsers/{uid}/role` = `primary` أو `backup`.
4. في Firebase Functions/Secret Manager أضف `TELEGRAM_BOT_TOKEN` بالتوكن السري للبوت. لا تضعه في HTML/JS.
5. اضبط `TELEGRAM_CHAT_ID` على `5926610601` أو اترك القيمة الافتراضية داخل الدالة.
6. انشر Functions.
7. اضبط Telegram webhook على دالة `telegramWebhook` الخاصة بمشروعك.
8. انشر Realtime Database Rules بعد الاختبار على نسخة احتياطية.

## ملاحظات
- دخول الطالب: رقم الهاتف + PIN من قاعدة `students`.
- التسجيل الجديد يبدأ `pending`.
- Telegram يرسل أزرار قبول/رفض.
- تغيير الحالة إلى `approved` أو `rejected` يرسل رسالة تأكيد ثانية.
- لا يوجد إرسال تلقائي لنتيجة الامتحان للطالب.
