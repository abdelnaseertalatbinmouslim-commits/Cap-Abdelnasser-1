import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
const form=document.getElementById("adminLoginForm"),msg=document.getElementById("adminLoginMsg");
form.addEventListener("submit",async e=>{e.preventDefault();msg.textContent="جاري تسجيل الدخول...";try{await signInWithEmailAndPassword(auth,document.getElementById("adminEmail").value.trim(),document.getElementById("adminPassword").value);location.href="admin.html"}catch(err){console.error(err);msg.textContent="بيانات الإدارة غير صحيحة."}});
