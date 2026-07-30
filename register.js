import { auth, db } from "./firebase.js"; 
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
  const name = document.getElementById("name").value.trim();
const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {

        await createUserWithEmailAndPassword(auth, email, password);

        alert("🎉 تم إنشاء الحساب بنجاح");

        window.location.href = "login.html";

    } catch (error) {

        alert(error.message);

        console.error(error);

    }

});
