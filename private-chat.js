import { auth, db } from "./firebase.js";

import {
collection,
addDoc,
query,
where,
orderBy,
onSnapshot,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// عناصر الصفحة

const messages = document.getElementById("privateMessages");

const messageInput = document.getElementById("messageInput");

const sendBtn = document.getElementById("sendBtn");

const imageBtn = document.getElementById("imageBtn");

const imageInput = document.getElementById("imageInput");

const chatUser = document.getElementById("chatUser");

const backBtn = document.getElementById("backBtn");

// بيانات المستخدم

let currentUser = null;

// قراءة uid من الرابط

const params = new URLSearchParams(window.location.search);

const otherUid = params.get("uid");

const otherName = params.get("name");

chatUser.innerHTML = "👤 " + (otherName || "مستخدم");

// رجوع

backBtn.addEventListener("click", () => {

    window.location.href = "chat.html";

});

// التحقق من تسجيل الدخول

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

});
// ==========================
// إنشاء معرف المحادثة
// ==========================

function getChatId() {

    return [currentUser.uid, otherUid].sort().join("_");

}

// ==========================
// إرسال رسالة نصية
// ==========================

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

async function sendMessage() {

    const text = messageInput.value.trim();

    if (text === "") return;

    try {

        await addDoc(collection(db, "privateMessages"), {

            chatId: getChatId(),

            sender: currentUser.uid,

            receiver: otherUid,

            user: currentUser.email,

            type: "text",

            text: text,

            createdAt: serverTimestamp(),

            likes: 0

        });

        messageInput.value = "";

    } catch (err) {

        console.error(err);

    }

}

// ==========================
// فتح معرض الصور
// ==========================

imageBtn.addEventListener("click", () => {

    imageInput.click();

});// ==========================
// رفع صورة إلى Cloudinary
// ==========================

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

        await addDoc(collection(db, "privateMessages"), {

            chatId: getChatId(),

            sender: currentUser.uid,

            receiver: otherUid,

            user: currentUser.email,

            type: "image",

            image: data.secure_url,

            createdAt: serverTimestamp(),

            likes: 0

        });

        imageInput.value = "";

    } catch (err) {

        console.error(err);

        alert("فشل رفع الصورة");

    }

});

// ==========================
// تحميل الرسائل الخاصة
// ==========================

function loadPrivateMessages() {

    const q = query(

        collection(db, "privateMessages"),

        where("chatId", "==", getChatId()),

        orderBy("createdAt", "asc")

    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            const box = document.createElement("div");

            box.className = "message";

            if (data.sender === currentUser.uid) {

                box.classList.add("me");

            } else {

                box.classList.add("other");

            }

            if (data.type === "text") {

                box.innerHTML = `
                    <div class="sender">${data.user}</div>
                    <div>${data.text}</div>
                `;

            } else {

                box.innerHTML = `
                    <div class="sender">${data.user}</div>

                    <img
                        src="${data.image}"
                        style="
                            max-width:220px;
                            border-radius:12px;
                        "
                    >
                `;

            }

            messages.appendChild(box);

        });

        messages.scrollTop = messages.scrollHeight;

    });

}

// تشغيل المحادثة

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "login.html";

        return;

    }

    currentUser = user;

    loadPrivateMessages();

});
