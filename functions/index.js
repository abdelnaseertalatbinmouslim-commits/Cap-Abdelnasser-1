const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const normalize = p => String(p || "").replace(/\D/g, "");
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "5926610601";

async function telegram(method, body){
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if(!token) throw new Error("Missing TELEGRAM_BOT_TOKEN secret");
    const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body)
    });
    const data = await r.json().catch(()=>({}));
    if(!r.ok || data.ok===false) throw new Error(`Telegram API error: ${r.status} ${JSON.stringify(data)}`);
    return data;
}

async function sendTelegram(text, keyboard){
    return telegram("sendMessage", {
        chat_id: CHAT_ID,
        text,
        reply_markup: keyboard ? {inline_keyboard: keyboard} : undefined
    });
}

exports.studentLogin = functions.region("us-central1").https.onCall(async (data, context) => {
    const phone = normalize(data?.phone);
    const pin = String(data?.pin || "");
    if(!/^01\d{9}$/.test(phone) || !/^\d{4,8}$/.test(pin)) {
        throw new functions.https.HttpsError("invalid-argument","Invalid credentials");
    }
    const snap = await admin.database().ref("students").get(); 
    let found = null;
    snap.forEach(child => {
        const s = child.val() || {};
        if(normalize(s.phone) !== phone || String(s.pin) !== pin) return;
        const candidate = {id: child.key, ...s};
        if(!found || (candidate.status === "approved" && found.status !== "approved") || String(candidate.createdAt||"") > String(found.createdAt||"")) {
            found = candidate;
        }
    });
    if(!found) throw new functions.https.HttpsError("unauthenticated","Invalid credentials");
    if(found.status !== "approved") {
        throw new functions.https.HttpsError("permission-denied", found.status === "pending" ? "pending" : "rejected");
    }
    const uid = `student_${found.id}`;
    const token = await admin.auth().createCustomToken(uid, {role: "student", studentId: found.id});
    await admin.database().ref(`students/${found.id}`).update({lastActive: new Date().toISOString()});
    return {token, studentId: found.id, studentName: found.name || ""};
});

exports.telegramNewRegistration = functions.region("us-central1").database.ref("/students/{studentId}").onCreate(async (snapshot, context) => {
    const s = snapshot.val() || {};
    if(s.status !== "pending") return;
    await sendTelegram([
        "🟡 Coach",
        "طلب تسجيل جديد",
        `الاسم: ${s.name || "-"}`,
        `الهاتف: ${s.phone || "-"}`,
        `الفرقة: ${s.grade || "-"}`,
        `القناة: ${s.channelConfirmed ? "تم التأكيد" : "غير مؤكد"}`,
        `الوقت: ${new Date().toLocaleString("ar-EG")}`
    ].join("\n"), [[
        {text:"✅ قبول", callback_data:`approve:${context.params.studentId}`},
        {text:"❌ رفض", callback_data:`reject:${context.params.studentId}`}
    ]]);
});

exports.telegramStudentDecision = functions.region("us-central1").database.ref("/students/{studentId}/status").onWrite(async (change, context) => {
    if(!change.after.exists()) return;
    const before = change.before.val();
    const after = change.after.val();
    if(before === after || !["approved","rejected"].includes(after)) return;
    const s = (await admin.database().ref(`students/${context.params.studentId}`).get()).val() || {};
    await sendTelegram([
        "🔔 Coach",
        after === "approved" ? "تم قبول الطالب" : "تم رفض الطالب",
        `الاسم: ${s.name || "-"}`,
        `الهاتف: ${s.phone || "-"}`,
        `الفرقة: ${s.grade || "-"}`,
        `الوقت: ${new Date().toLocaleString("ar-EG")}`
    ].join("\n"));
});

exports.telegramWebhook = functions.region("us-central1").https.onRequest(async (req, res) => {
    try{
        if(req.method !== "POST"){ res.status(405).send("Method Not Allowed"); return; }
        const update = req.body || {};
        const cb = update.callback_query;
        if(!cb){ res.status(200).send("ok"); return; }
        const chatId = String(cb.message?.chat?.id || "");
        if(chatId !== String(CHAT_ID)){
            await telegram("answerCallbackQuery", {callback_query_id: cb.id, text: "غير مصرح بهذا الحساب.", show_alert: true});
            res.status(403).send("forbidden");
            return;
        }
        const [action, studentId] = String(cb.data || "").split(":");
        if(!studentId || !["approve","reject"].includes(action)){ res.status(400).send("bad callback"); return; }
        const status = action === "approve" ? "approved" : "rejected";
        await admin.database().ref(`students/${studentId}`).update({status, updatedAt: new Date().toISOString(), decisionSource: "telegram"});
        await telegram("answerCallbackQuery", {callback_query_id: cb.id, text: status === "approved" ? "تم قبول الطالب" : "تم رفض الطالب"});
        try{ await telegram("editMessageReplyMarkup", {chat_id: chatId, message_id: cb.message.message_id, reply_markup: {inline_keyboard: []}}) }catch(_){ }
        res.status(200).send("ok");
    }catch(err){
        console.error(err);
        res.status(500).send("error");
    }
});
