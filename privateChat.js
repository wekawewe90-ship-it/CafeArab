import { auth, db, storage } from "./firebase.js";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

const messagesBox = document.getElementById("privateMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const chatUser = document.getElementById("chatUser");
const backBtn = document.getElementById("backBtn");

let currentUser = null;
let roomId = "";
let otherUid = "";
let otherName = "";
let unsubscribe = null;

const params = new URLSearchParams(location.search);

otherUid = params.get("uid");
otherName = params.get("name") || "مستخدم";

if (chatUser) {
    chatUser.textContent = otherName;
}

if (backBtn) {
    backBtn.onclick = () => history.back();
}

function getRoomId(uid1, uid2) {
    return [uid1, uid2].sort().join("_");
}

onAuthStateChanged(auth, (user) => {

    if (!user) {
        location.href = "login.html";
        return;
    }

    currentUser = user;
    roomId = getRoomId(user.uid, otherUid);

    startChat();
  });
function startChat() {
    loadMessages();
}

// =========================
// تحميل الرسائل
// =========================

function loadMessages() {

    const q = query(
        collection(db, "privateChats", roomId, "messages"),
        orderBy("createdAt", "asc")
    );

    if (unsubscribe) {
        unsubscribe();
    }

    unsubscribe = onSnapshot(q, (snapshot) => {

        messagesBox.innerHTML = "";

        snapshot.forEach((doc) => {

            drawMessage(doc.data());

        });

        scrollBottom();

    });

}



// =========================
// النزول لآخر رسالة
// =========================

function scrollBottom() {

    setTimeout(() => {

        messagesBox.scrollTop =
            messagesBox.scrollHeight;

    }, 100);

}

// =========================
// إرسال رسالة نصية
// =========================

async function sendMessage() {

    if (!currentUser) return;

    const text = messageInput.value.trim();

    if (text.length === 0) return;

    try {

        sendBtn.disabled = true;

        await addDoc(
            collection(db, "privateChats", roomId, "messages"),
            {
                senderId: currentUser.uid,
                receiverId: otherUid,
                senderName: currentUser.displayName || "مستخدم",
                text: text,
                type: "text",
                createdAt: serverTimestamp()
            }
        );

        messageInput.value = "";
        messageInput.focus();

    } catch (err) {

        console.error("Send Error:", err);

        alert("حدث خطأ أثناء إرسال الرسالة.");

    } finally {

        sendBtn.disabled = false;

    }

}

// =========================
// زر الإرسال
// =========================

if (sendBtn) {

    sendBtn.addEventListener("click", sendMessage);

}

// =========================
// Enter للإرسال
// Shift + Enter لسطر جديد
// =========================

if (messageInput) {

    messageInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter" && !e.shiftKey) {

            e.preventDefault();

            sendMessage();

        }

    });

}

// =========================
// تفعيل وتعطيل زر الإرسال
// =========================

if (messageInput && sendBtn) {

    sendBtn.disabled = true;

    messageInput.addEventListener("input", () => {

        sendBtn.disabled =
            messageInput.value.trim().length === 0;

    });

}
    // =========================
// إرسال صورة
// =========================

async function sendImage(file) {

    if (!file || !currentUser) return;

    try {

        imageBtn.disabled = true;

        const fileName =
            `${Date.now()}_${currentUser.uid}_${file.name}`;

        const storageRef = ref(
            storage,
            `privateChats/${roomId}/${fileName}`
        );

        await uploadBytes(storageRef, file);

        const imageUrl = await getDownloadURL(storageRef);

        await addDoc(
            collection(db, "privateChats", roomId, "messages"),
            {
                senderId: currentUser.uid,
                receiverId: otherUid,
                senderName: currentUser.displayName || "مستخدم",
                type: "image",
                imageUrl: imageUrl,
                createdAt: serverTimestamp()
            }
        );

    } catch (err) {

        console.error("Image Upload Error:", err);

        alert("تعذر إرسال الصورة");

    } finally {

        imageBtn.disabled = false;

        imageInput.value = "";

    }

}

// =========================
// اختيار الصورة
// =========================

if (imageBtn) {

    imageBtn.addEventListener("click", () => {

        imageInput.click();

    });

}

if (imageInput) {

    imageInput.addEventListener("change", (e) => {

        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            alert("الرجاء اختيار صورة فقط.");

            return;

        }

        sendImage(file);

    });

}// =========================
// تنسيق الوقت
// =========================

function formatTime(timestamp) {

    if (!timestamp) return "";

    try {

        return timestamp.toDate().toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit"
        });

    } catch {

        return "";

    }

}

// =========================
// استبدل drawMessage بهذه النسخة
// =========================

function drawMessage(data) {

    const wrapper = document.createElement("div");

    wrapper.className =
        data.senderId === currentUser.uid
            ? "message me"
            : "message other";

    const bubble = document.createElement("div");

    bubble.className = "bubble";

  if (data.type === "image" && data.imageUrl) {

        const img = document.createElement("img");

        img.src = data.imageUrl;
        img.className = "chat-image";
        img.loading = "lazy";

        img.addEventListener("click", () => {

            window.open(data.imageUrl, "_blank");

        });

        bubble.appendChild(img);

    } else {

        bubble.textContent = data.text || "";

    }

    wrapper.appendChild(bubble);

    const time = document.createElement("small");

    time.className = "message-time";

    time.textContent = formatTime(data.createdAt);

    wrapper.appendChild(time);

    messagesBox.appendChild(wrapper);

}// =========================
// تنظيف الموارد
// =========================

window.addEventListener("beforeunload", () => {

    if (unsubscribe) {

        unsubscribe();

    }

});

// =========================
// التركيز على مربع الكتابة
// =========================

window.addEventListener("load", () => {

    if (messageInput) {

        messageInput.focus();

    }

});

// =========================
// معالجة الأخطاء العامة
// =========================

window.addEventListener("error", (event) => {

    console.error("Private Chat Error:", event.error || event.message);

});

// =========================
// إنهاء الملف
// =========================

console.log("✅ privateChat.js Loaded Successfully");
    
    

