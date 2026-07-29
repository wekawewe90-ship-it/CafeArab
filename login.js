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

        window.location.href = "chat.html";

    } catch (error) {

        alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");

        console.error(error);

    }

});
