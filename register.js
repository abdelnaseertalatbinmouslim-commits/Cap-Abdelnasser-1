import { db } from "./firebase-config.js";
import { ref, push, get } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
const form=document.getElementById("registerForm"),msg=document.getElementById("registerMsg");
const normalize=p=>String(p||"").replace(/\D/g,"");
form.addEventListener("submit",async e=>{e.preventDefault();msg.textContent="جاري إرسال الطلب...";
 const name=document.getElementById("name").value.trim(),phone=normalize(document.getElementById("phone").value),grade=document.getElementById("grade").value,pin=document.getElementById("pin").value.trim(),pin2=document.getElementById("pin2").value.trim();
 if(!document.getElementById("channelGate").checked){msg.textContent="لازم تؤكد الانضمام لقناة WhatsApp أولًا.";return}
 if(name.length<3){msg.textContent="اكتب الاسم بالكامل.";return} if(!/^01\d{9}$/.test(phone)){msg.textContent="رقم الهاتف غير صحيح.";return} if(pin!==pin2){msg.textContent="الـPIN غير متطابق.";return} if(!/^\d{4,8}$/.test(pin)){msg.textContent="الـPIN لازم يكون من 4 إلى 8 أرقام.";return}
 try{const snap=await get(ref(db,"students"));let active=false,pending=false;snap.forEach(c=>{const s=c.val()||{};if(normalize(s.phone)===phone){if(s.status==="approved")active=true;if(s.status==="pending")pending=true}});if(active){msg.textContent="رقم الهاتف لديه حساب معتمد بالفعل.";return}if(pending){msg.textContent="لديك طلب تسجيل قيد المراجعة بالفعل.";return}
 await push(ref(db,"students"),{name,phone,grade,pin:Number(pin),status:"pending",channelConfirmed:true,createdAt:new Date().toISOString(),lastActive:null});
 msg.textContent="تم إرسال الطلب بنجاح. ستصلك حالة الطلب بعد المراجعة.";form.reset();localStorage.setItem("coachChannelConfirmed","1");}
 catch(err){console.error(err);msg.textContent="تعذر إرسال الطلب. تأكد من Firebase Rules واتصال الإنترنت."}});
