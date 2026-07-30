import { auth, db } from "./firebase.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
    userName.textContent = "👤 " + user.email;

    loadMessages();

});

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});
async function sendMessage() {

    alert("1 - دخلنا الدالة");

    const text = messageInput.value.trim();

    if (text === "") {
        alert("2 - الرسالة فاضية");
        return;
    }

    alert("3 - الرسالة: " + text);

    alert("4 - currentUser: " + (currentUser ? currentUser.email : "null"));

    try {

        await addDoc(collection(db, "messages"), {
            user: currentUser.email,
            text: text,
            createdAt: serverTimestamp()
        });

        alert("5 - تم الإرسال");

        messageInput.value = "";

    } catch (error) {

        alert("خطأ: " + error.message);

    }

}

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((doc) => {

            const data = doc.data();

            messages.innerHTML += `
            <div style="background:#222;padding:12px;margin-bottom:10px;border-radius:12px;color:white;">

                <b style="color:#d4af37;">${data.user}</b>

                <br><br>

                ${data.text}

            </div>
            `;

        });

        messages.scrollTop = messages.scrollHeight;

    });

}

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});
