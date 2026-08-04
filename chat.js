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
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "login.html";
        return;

    }

    currentUser = user;

    userName.textContent =
        "👤 " + (user.displayName || user.email);

    loadMessages();

});

logoutBtn.addEventListener("click", () => {

    signOut(auth);

});

imageBtn.addEventListener("click", () => {

    imageInput.click();

});
// =========================
// إرسال رسالة
// =========================

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

async function sendMessage() {

    const text = messageInput.value.trim();

    if (text === "") return;

    await addDoc(collection(db, "messages"), {

        uid: currentUser.uid,

        user: currentUser.email,

        type: "text",

        text: text,

        createdAt: serverTimestamp()

    });

    messageInput.value = "";

}

// =========================
// رفع صورة
// =========================

imageInput.addEventListener("change", async () => {

    if (!imageInput.files.length) return;

    const file = imageInput.files[0];

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", "ml_default");

    try {

        const response = await
            // =========================
// تحميل الرسائل
// =========================

function loadMessages() {

    const q = query(
        collection(db, "messages"),
        orderBy("createdAt", "asc")
    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            const box = document.createElement("div");

            box.className = "message";

            if (data.uid === currentUser.uid) {
                box.classList.add("me");
            } else {
                box.classList.add("other");
            }

            if (data.type === "text") {

                box.innerHTML = `
                    <div class="sender">
                        ${data.user}
                    </div>

                    <div class="text">
                        ${data.text}
                    </div>
                `;

            } else if (data.type === "image") {

                box.innerHTML = `
                    <div class="sender">
                        ${data.user}
                    </div>

                    <img
                        src="${data.image}"
                        style="
                           
