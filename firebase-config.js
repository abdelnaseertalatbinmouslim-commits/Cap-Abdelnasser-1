import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyD64Zup-c8pXmIeoRCUzSLtiyKJRfvAYbc",
  authDomain: "abodaa.firebaseapp.com",
  databaseURL: "https://abodaa-default-rtdb.firebaseio.com",
  projectId: "abodaa",
  storageBucket: "abodaa.firebasestorage.app",
  messagingSenderId: "489477833785",
  appId: "1:489477833785:web:cf7451889d7e7a5efdf9e8",
  measurementId: "G-GQFLS5HEHZ"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const functions = getFunctions(app, "us-central1");
export const BRAND_IMAGE = "assets/1783950091830.jpg";
export const PRIMARY_ADMIN_PHONE = "01098227150";
export const WHATSAPP_LINK = "https://wa.me/201098227150";
export const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029VbDGX1rJpe8ZM6H5h02T";
export const TELEGRAM_PROFILE = "https://t.me/CapAbdo1";
export const FACEBOOK_PAGE = "https://www.facebook.com/cap.abdelnaseer.talat";
