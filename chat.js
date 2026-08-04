// ========================================
// Cafe Arab Chat.js V2
// الجزء الأول
// ========================================

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

// ==========================
// عناصر الصفحة
// ==========================

const messages = document.getElementById("messages");

const messageInput = document.getElementById("messageInput");

const sendBtn = document.getElementById("sendBtn");

const imageBtn = document.getElementById("imageBtn");

const imageInput = document.getElementById("imageInput");

const logoutBtn = document.getElementById("logoutBtn");

const userName = document.getElementById("userName");

// ==========================

let currentUser = null;

// ==========================
// تسجيل الدخول
// ==========================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

    userName.textContent =
        "👤 " + (user.displayName || user.email);

    initializeChat();

});

// ==========================

function initializeChat() {

    loadMessages();

}

// ==========================
// تسجيل الخروج
// ==========================

logoutBtn.addEventListener("click", () => {

    signOut(auth);

});

// ==========================
// فتح معرض الصور
// ==========================

imageBtn.addEventListener("click", () => {

    imageInput.click();

});
// ========================================
// إرسال الرسائل النصية
// ========================================

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text) return;

    try {

        await addDoc(collection(db, "messages"), {

            uid: currentUser.uid,

            user: currentUser.displayName || currentUser.email,

            type: "text",

            text: text,

            createdAt: serverTimestamp()

        });

        messageInput.value = "";

    } catch (err) {

        console.error("Send Error:", err);

        alert("حدث خطأ أثناء إرسال الرسالة");

    }

}

// ========================================
// رفع الصور
// ========================================

imageInput.addEventListener("change", async () => {

    if (!imageInput.files.length) return;

    const file = imageInput.files[0];

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", "ml_default");

    try {

        const response = await fetch(

            "https://api.cloudinary.com/v1_1/vqwksojr/image/upload",

            {

                method: "POST",

                body: formData

            }

        );

        const data = await response.json();

        await addDoc(collection(db, "messages"), {

            uid: currentUser.uid,

            user: currentUser.displayName || currentUser.email,

            type: "image",

            image: data.secure_url,

            createdAt: serverTimestamp()

        });

        imageInput.value = "";

    } catch (err) {

        console.error("Upload Error:", err);

        alert("فشل رفع الصورة");

    }

});
// ========================================
// تحميل الرسائل
// ========================================

function loadMessages() {

    const q = query(

        collection(db, "messages"),

        orderBy("createdAt", "asc")

    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((doc) => {

            const data = doc.data();

            const box = document.createElement("div");

            box.className = "message";

            if (data.uid === currentUser.uid) {

                box.classList.add("me");

            } else {

                box.classList.add("other");

            }

            let content = "";

            if (data.type === "text") {

                content = `
                    <div class="sender"
                         style="font-weight:bold;color:#d4af37;cursor:pointer"
                         onclick="openPrivateChat('${data.uid}','${data.user}')">
                        ${data.user}
                    </div>

                    <div class="text">
                        ${data.text}
                    </div>
                `;

            }

            if (data.type === "image") {

                content = `
                    <div class="sender"
                         style="font-weight:bold;color:#d4af37;cursor:pointer"
                         onclick="openPrivateChat('${data.uid}','${data.user}')">
                        ${data.user}
                    </div>

                    <img
                    // ========================================
// فتح المحادثة الخاصة
// ========================================

window.openPrivateChat = function(uid, name) {

    // لا تفتح محادثة مع نفسك
    if (uid === currentUser.uid) return;

    window.location.href =
        "private-chat.html?uid=" +
        encodeURIComponent(uid) +
        "&name=" +
        encodeURIComponent(name);

};

// ========================================
// إعادة التمرير لآخر الرسائل
// ========================================

function scrollToBottom() {

    messages.scrollTop = messages.scrollHeight;

}

setInterval(() => {

    scrollToBottom();

}, 1000);
