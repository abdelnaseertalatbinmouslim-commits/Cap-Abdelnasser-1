import { auth, functions } from "./firebase-config.js";
import { signInWithEmailAndPassword, signOut, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { httpsCallable } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";
const form=document.getElementById("loginForm"),msg=document.getElementById("loginMsg");
const normalize=p=>String(p||"").replace(/\D/g,"");
form.addEventListener("submit",async e=>{e.preventDefault();if(!document.getElementById("channelGate").checked){msg.textContent="أكد الانضمام لقناة WhatsApp أولًا.";return}msg.textContent="جاري التحقق...";const identity=document.getElementById("identity").value.trim(),password=document.getElementById("password").value;try{
 if(identity.includes("@")){await signInWithEmailAndPassword(auth,identity,password);location.href="admin.html";return;}
 const call=httpsCallable(functions,"studentLogin");const out=await call({phone:normalize(identity),pin:password});await signInWithCustomToken(auth,out.data.token);sessionStorage.setItem("studentId",out.data.studentId);sessionStorage.setItem("studentName",out.data.studentName||"");location.href="student.html";
 }catch(err){console.error(err);const code=err?.details?.code||err?.code||"";msg.textContent=code.includes("pending")?"الحساب في انتظار موافقة الإدارة.":code.includes("rejected")?"الحساب مرفوض حاليًا.":"بيانات الدخول غير صحيحة أو حدث خطأ في الاتصال."}});
document.getElementById("helpLink").onclick=e=>{e.preventDefault();msg.textContent="الطالب: رقم الهاتف + PIN. الإدارة: البريد + كلمة المرور."};
