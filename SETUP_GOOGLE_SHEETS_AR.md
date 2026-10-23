# KidUp Hub — ربط الفورم بـ Google Sheets مع GitHub Pages

## الاختيار المستخدم
- Frontend: GitHub Pages (HTML/CSS/JS).
- Backend: Google Apps Script Web App.
- Storage: Google Sheets، غير منشور للعامة.
- التكلفة: بدون استضافة مدفوعة للاستخدام العادي، مع مراعاة حدود خدمات Google.

## خطوات الإعداد
1. أنشئ Google Sheet باسم `KidUp School Expo Registrations` واحفظ الرابط (خاص بالمنظمين فقط). انسخ الجزء بين `/d/` و`/edit` من الرابط.
2. من الشيت: **Extensions → Apps Script**.
3. امسح الكود الافتراضي والصق كل ما في `GoogleAppsScript_Code.gs`.
4. غيّر `PASTE_GOOGLE_SHEET_ID_HERE` إلى ID الشيت، واحفظ. من القائمة اختر `setup` ثم **Run** واسمح بالصلاحيات اللازمة. تأكد من ظهور شيت `Registrations` وعناوين الأعمدة.
5. اختر **Deploy → New deployment → Web app**؛ Execute as: **Me**، Access: **Anyone**. وافق على الأذونات وانسخ رابط Web App النهائي المنتهي بـ `/exec` (لا تستخدم `/dev`). هذه الصلاحية تجعل واجهة تسجيل عامة؛ احتفظ بالشيت خاصًا ولا تشارك محرر السكربت.
6. افتح ملف `config.js`، وضع رابط Web App بدل `PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE`.
7. ارفع محتويات المجلد للمستودع GitHub. من **Settings → Pages** اختر Deploy from a branch ثم `main` / `(root)`. انتظر ظهور الرابط.
8. جرّب تسجيلًا حقيقيًا باستخدام بريد ورقم تجريبيين بموافقتك. تأكد من وجود صف جديد في Google Sheets ومن ظهور صفحة `thank-you.html`. اختبر من الموبايل أيضًا، واختبر UTM باستخدام `?utm_source=facebook&utm_medium=paid_social&utm_campaign=kidup_expo_2027`.
9. اختبر إعادة الإرسال والحقول غير الصحيحة. لا تُطلق الحملة قبل التأكد من نجاح الرسالة ووصول التسجيل فعليًا إلى الشيت.

## أمان وخصوصية
- لا تضع Sheet ID في HTML العام ولا تشارك الشيت للعموم؛ هو موجود في Apps Script الخاص بحسابك.
- Google Apps Script Web App العامة قابلة لمحاولات الإرسال الآلي؛ البوابة تحتوي Honeypot والتحقق من المدخلات ومعرفًا لتكرار الطلب. قبل حملات إعلانية كبيرة ينصح ببوابة API بها rate limiting وCaptcha مثل Cloudflare Turnstile للتحكم الأقوى.
- أضف صفحة Privacy Policy وبيانات جهة الاتصال وطريقة طلب حذف البيانات قبل جمع بيانات الأهالي. Checkbox الموافقة موجود لكنه ليس بديلًا عن سياسة الخصوصية.
- هذه نسخة مهيأة للربط ولم تُختبر على نشر حقيقي لأن نشر Apps Script يحتاج تسجيلك وموافقتك على الصلاحيات.
- في حالة تعذّر إظهار رسالة النجاح في GitHub Pages بسبب متصفح/إطارات Google، جرّب المتصفح المنشور، أو انتقل إلى Google Form Embed أو Netlify Forms كحل أكثر استقرارًا دون بناء backend مخصص.
- لا تُعلن إغلاق التسجيل عند اكتمال الأماكن تلقائيًا؛ تحديد السعة القصوى يحتاج منطقًا إضافيًا في السكربت.

## حقول الشيت
Submitted At, Registration ID, Parent Name, Mobile Number, Email, Attendees, Child Age, Current School / Nursery, Parent Questions, Consent, UTM Source, UTM Medium, UTM Campaign, UTM Content, Follow-up Status, Attendance Status.

## بعد الإطلاق
راقب تسجيلات الشيت، احذف الإدخالات التجريبية، وأنشئ صلاحيات Viewer أو Editor فقط لفريق التنظيم الذي يحتاج البيانات. يمكن إضافة QR أو تأكيد واتساب لاحقًا، لكنهما ليسا ضمن النسخة الحالية.
