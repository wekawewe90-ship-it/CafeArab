// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";

// Firebase Auth
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// إعدادات المشروع
const firebaseConfig = {
  apiKey: "AIzaSyCc2LiujPKNiSaMHi6btRkfP-sB4DnRM5Q",
  authDomain: "cafearab-c6f0b.firebaseapp.com",
  projectId: "cafearab-c6f0b",
  storageBucket: "cafearab-c6f0b.firebasestorage.app",
  messagingSenderId: "155925331863",
  appId: "1:155925331863:web:10a5f1959ccfdc56fc0ed2"
};

// تشغيل Firebase
const app = initializeApp(firebaseConfig);

// الخدمات
const auth = getAuth(app);
const db = getFirestore(app);

// تصدير الخدمات
export { auth, db };
