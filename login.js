import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {

        const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        await updateDoc(
            doc(db, "users", userCredential.user.uid),
            {
                online: true,
                lastSeen: serverTimestamp()
            }
        );

        window.location.href = "chat.html";

    } catch (error) {

        alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");

        console.error(error);

    }

});
