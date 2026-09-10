import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { ref, get, update } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

const form = document.getElementById("loginForm"), msg = document.getElementById("loginMsg");
const normalize = p => String(p || "").replace(/\D/g, "");

form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!document.getElementById("channelGate").checked) {
        msg.textContent = "أكد الانضمام لقناة WhatsApp أولًا.";
        return;
    }
    msg.textContent = "جاري التحقق...";
    
    const identity = document.getElementById("identity").value.trim();
    const password = document.getElementById("password").value;

    try {
        // لو الإدخال عبارة عن بريد إلكتروني، يبق ده تسجيل دخول الإدارة
        if (identity.includes("@")) {
            await signInWithEmailAndPassword(auth, identity, password);
            location.href = "admin.html";
            return;
        }

        // لو رقم هاتف، يبقى طالب: نبحث عنه مباشرة في الداتابيس
        const phoneClean = normalize(identity);
        const studentsSnap = await get(ref(db, "students"));
        
        if (!studentsSnap.exists()) {
            throw new Error("بيانات الدخول غير صحيحة");
        }

        let foundStudent = null;
        studentsSnap.forEach(child => {
            const s = child.val() || {};
            if (normalize(s.phone) === phoneClean && String(s.pin) === password) {
                foundStudent = { id: child.key, ...s };
            }
        });

        if (!foundStudent) {
            throw new Error("بيانات الدخول غير صحيحة");
        }

        if (foundStudent.status === "pending") {
            msg.textContent = "الحساب في انتظار موافقة الإدارة.";
            return;
        }
        if (foundStudent.status === "rejected") {
            msg.textContent = "الحساب مرفوض حاليًا.";
            return;
        }
        if (foundStudent.status !== "approved") {
            msg.textContent = "الحساب غير مسموح له بالدخول.";
            return;
        }

        // تحديث آخر نشاط وحفظ بيانات الجلسة
        await update(ref(db, `students/${foundStudent.id}`), { lastActive: new Date().toISOString() });
        sessionStorage.setItem("studentId", foundStudent.id);
        sessionStorage.setItem("studentName", foundStudent.name || "");
        
        location.href = "student.html";

    } catch (err) {
        console.error(err);
        const text = err.message || "";
        if (text.includes("pending")) {
            msg.textContent = "الحساب في انتظار موافقة الإدارة.";
        } else if (text.includes("rejected")) {
            msg.textContent = "الحساب مرفوض حاليًا.";
        } else {
            msg.textContent = "بيانات الدخول غير صحيحة أو رقم الهاتف/الـ PIN غير مطابق.";
        }
    }
});

const helpLink = document.getElementById("helpLink");
if (helpLink) {
    helpLink.onclick = e => {
        e.preventDefault();
        msg.textContent = "الطالب: رقم الهاتف + PIN. الإدارة: البريد + كلمة المرور.";
    };
}

