// =====================================
// Cafe Arab Chat V2
// Part 1
// =====================================

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
// التحقق من تسجيل الدخول
// ==========================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "login.html";

        return;

    }

    currentUser = user;

    if (userName) {

        userName.textContent =
            "👤 " + (user.displayName || user.email);

    }

    startChat();

});

// ==========================

function startChat() {

    loadMessages();

}

// ==========================
// تسجيل الخروج
// ==========================

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        signOut(auth);

    });

}

// ==========================
// زر الصور
// ==========================

if (imageBtn) {

    imageBtn.addEventListener("click", () => {

        imageInput.click();

    });

        }
// =====================================
// إرسال الرسائل النصية
// =====================================

if (sendBtn) {

    sendBtn.addEventListener("click", sendMessage);

}

if (messageInput) {

    messageInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {

            sendMessage();

        }

    });

}

async function sendMessage() {

    const text = messageInput.value.trim();

    if (text === "") return;

    try {

        await addDoc(

            collection(db, "messages"),

            {

                uid: currentUser.uid,

                user: currentUser.displayName || currentUser.email,

                type: "text",

                text: text,

                createdAt: serverTimestamp()

            }

        );

        messageInput.value = "";

    } catch (err) {

        console.error(err);

        alert("حدث خطأ أثناء إرسال الرسالة");

    }

}

// =====================================
// رفع الصور
// =====================================

if (imageInput) {

    imageInput.addEventListener("change", uploadImage);

}

async function uploadImage() {

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

        await addDoc(

            collection(db, "messages"),

            {

                uid: currentUser.uid,

                user: currentUser.displayName || currentUser.email,

                type: "image",

                image: data.secure_url,

                createdAt: serverTimestamp()

            }

        );

        imageInput.value = "";

    } catch (err) {

        console.error(err);

        alert("فشل رفع الصورة");

    }

    }
// =====================================
// تحميل الرسائل
// =====================================

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

            if (data.type === "text") {

                box.innerHTML = `
                    <div class="sender">
                        ${data.user}
                    </div>

                    <div class="text">
                        ${data.text}
                    </div>
                `;

            }

            if (data.type === "image") {

                box.innerHTML = `
                    <div class="sender">
                        ${data.user}
                    </div>

                    <img
                        src="${data.image}"
                        class="chatImage"
                        onclick="window.open('${data.image}','_blank')"
                    >
                `;

            }

            messages.appendChild(box);

        });

        if (
    messages.scrollTop + messages.clientHeight >=
    messages.scrollHeight - 100
) {
    messages.scrollTop = messages.scrollHeight;
        }
// =====================================
// فتح المحادثة الخاصة
// =====================================

window.openPrivateChat = function(uid, name) {

    if (!currentUser) return;

    if (uid === currentUser.uid) return;

    window.location.href =
        "private-chat.html?uid=" +
        encodeURIComponent(uid) +
        "&name=" +
        encodeURIComponent(name);

};

// =====================================
// تحديث التمرير
// =====================================

function scrollBottom() {

    if (messages) {

        messages.scrollTop = messages.scrollHeight;

    }

}

const usersBtn = document.getElementById("usersBtn");

if (usersBtn) {

    usersBtn.addEventListener("click", () => {

        window.location.href = "users.html";

    });

}
// =====================================
// نهاية الملف
// =====================================
