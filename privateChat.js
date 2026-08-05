// =====================================
// Cafe Arab Private Chat V2
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
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// ==========================
// عناصر الصفحة
// ==========================

const messages = document.getElementById("privateMessages");

const messageInput = document.getElementById("messageInput");

const sendBtn = document.getElementById("sendBtn");

const imageBtn = document.getElementById("imageBtn");

const imageInput = document.getElementById("imageInput");

const chatUser = document.getElementById("chatUser");

const backBtn = document.getElementById("backBtn");

// ==========================

let currentUser = null;

// ==========================
// بيانات المحادثة
// ==========================

const params = new URLSearchParams(window.location.search);

const otherUid = params.get("uid");

const otherName = params.get("name");

// ==========================

if (chatUser) {

    chatUser.textContent =
        "👤 " + (otherName || "مستخدم");

}

// ==========================
// رجوع
// ==========================

if (backBtn) {

    backBtn.addEventListener("click", () => {

        location.href = "users.html";

    });

}

// ==========================
// إنشاء معرف المحادثة
// ==========================

function getChatId() {

    return [currentUser.uid, otherUid]
        .sort()
        .join("_");

}
// ==========================
// التحقق من تسجيل الدخول
// ==========================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "login.html";
        return;

    }

    currentUser = user;

    if (!otherUid) {

        alert("لم يتم تحديد المستخدم");

        location.href = "users.html";

        return;

    }

    loadPrivateMessages();

});

// ==========================
// إرسال رسالة
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

        await addDoc(

            collection(
                db,
                "privateChats",
                getChatId(),
                "messages"
            ),

            {

                sender: currentUser.uid,

                receiver: otherUid,

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

// ==========================
// رفع الصور
// ==========================

if (imageBtn) {

    imageBtn.addEventListener("click", () => {

        imageInput.click();

    });

}

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

            collection(
                db,
                "privateChats",
                getChatId(),
                "messages"
            ),

            {

                sender: currentUser.uid,

                receiver: otherUid,

                user: currentUser.displayName || currentUser.email,

                type: "image",

                image: data.secure_url,

                createdAt: serverTimestamp()

            }

        );

        imageInput.value = "";

    } catch (err
        // ==========================
// تحميل الرسائل الخاصة
// ==========================

function loadPrivateMessages() {

    const q = query(

        collection(
            db,
            "privateChats",
            getChatId(),
            "messages"
        ),

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

        scrollBottom();

    });

}

// ==========================
// النزول لآخر رسالة
// ==========================

function scrollBottom() {

    setTimeout(() => {

        messages.scrollTop = messages.scrollHeight;

    }, 100);

                                                }
        // ==========================
// تحديث تلقائي للنزول لآخر رسالة
// ==========================

let firstLoad = true;

function autoScroll() {

    if (firstLoad) {

        scrollBottom();

        firstLoad = false;

    }

}

// ==========================
// إعادة تحميل الرسائل عند التحديث
// ==========================

window.addEventListener("load", () => {

    if (messages) {

        scrollBottom();

    }

});

// ==========================
// تحديث تلقائي عند تغيير حجم الشاشة
// ==========================

window.addEventListener("resize", () => {

    scrollBottom();

});

// ==========================
// تنظيف اختيار الصورة بعد الإرسال
// ==========================

if (imageInput) {

    imageInput.value = "";

}

// ==========================
// نهاية الملف
// ==========================
