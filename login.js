import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);

    alert("✅ تم تسجيل الدخول بنجاح");

    window.location.href = "chat.html";

  } catch (error) {
    let message = "حدث خطأ أثناء تسجيل الدخول";

    switch (error.code) {
      case "auth/invalid-credential":
        message = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        break;

      case "auth/user-not-found":
        message = "الحساب غير موجود";
        break;

      case "auth/wrong-password":
        message = "كلمة المرور غير صحيحة";
        break;

      case "auth/invalid-email":
        message = "البريد الإلكتروني غير صحيح";
        break;

      case "auth/too-many-requests":
        message = "تم إيقاف المحاولات مؤقتًا، حاول لاحقًا";
        break;
    }

    alert(message);
    console.error(error);
  }
});
