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
const input = document.getElementById("messageInput");
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

async function sendMessage() {

    const text = input.value.trim();

    if (text === "") return;

    await addDoc(collection(db, "messages"), {

        user: currentUser.email,

        text: text,

        createdAt: serverTimestamp()

    });

    input.value = "";

}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

function loadMessages() {

    const q = query(
        collection(db, "messages"),
        orderBy("createdAt")
    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((doc) => {

            const data = doc.data();

            messages.innerHTML += `
            <div style="
            background:#222;
            padding:12px;
            margin-bottom:10px;
            border-radius:12px;
            ">
                <b style="color:#d4af37">
                ${data.user}
                </b>

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
