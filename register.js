import { auth } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
const confirmPassword = document.getElementById("confirmPassword").value.trim();

if (password !== confirmPassword) {
    alert("كلمتا المرور غير متطابقتين");
    return;
}
    try {
        await createUserWithEmailAndPassword(auth, email, password);

        alert("🎉 تم إنشاء الحساب بنجاح");

        window.location.href = "login.html";

    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
    alert("البريد الإلكتروني مستخدم بالفعل");
} else if (error.code === "auth/weak-password") {
    alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
} else if (error.code === "auth/invalid-email") {
    alert("البريد الإلكتروني غير صحيح");
} else {
    alert(error.message);
        } 
    }
});
