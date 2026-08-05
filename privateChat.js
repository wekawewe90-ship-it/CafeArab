// =====================================
// Cafe Arab Private Chat
// Part 1
// =====================================

import { auth, db, storage } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// =====================================
// عناصر الصفحة
// =====================================

const messages = document.getElementById("privateMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const chatUser = document.getElementById("chatUser");
const backBtn = document.getElementById("backBtn");

// =====================================

let currentUser = null;
let roomId = "";

// =====================================
// بيانات المستخدم الآخر
// =====================================

const params = new URLSearchParams(location.search);

const otherUid = params.get("uid");
const otherName = params.get("name") || "مستخدم";

if (chatUser) {
    chatUser.textContent = "👤 " + otherName;
}

// =====================================
// زر الرجوع
// =====================================

if (backBtn) {
    backBtn.onclick = () => {
        location.href = "users.html";
    };
}

// =====================================
// إنشاء معرف ثابت للمحادثة
// =====================================

function createRoom(uid1, uid2) {

    return [uid1, uid2].sort().join("_");

}

// =====================================
// التحقق من تسجيل الدخول
// =====================================

onAuthStateChanged(auth, (user) => {

    if (!user) {
        location.href = "login.html";
        return;
    }

    currentUser = user;

    roomId = createRoom(user.uid, otherUid);

    startPrivateChat();

});

// =====================================

function startPrivateChat() {

    loadMessages();

}
// =====================================
// تحميل الرسائل لحظياً
// =====================================

function loadMessages() {

    const messagesRef = collection(
        db,
        "privateChats",
        roomId,
        "messages"
    );

    const q = query(
        messagesRef,
        orderBy("createdAt", "asc")
    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((doc) => {

            const data = doc.data();

            drawMessage(data);

        });

        scrollToBottom();

    });

}

// =====================================
// رسم الرسالة
// =====================================

function drawMessage(data) {

    const item = document.createElement("div");

    item.classList.add("message");

    if (data.senderId === currentUser.uid) {
        item.classList.add("me");
    } else {
        item.classList.add("other");
    }

    // صورة
    if (data.type === "image") {

        const img = document.createElement("img");

        img.src = data.imageUrl;
        img.className = "chat-image";

        img.loading = "lazy";

        img.onclick = () => {
            window.open(data.imageUrl, "_blank");
        };

        item.appendChild(img);

    }

    // رسالة نصية
    else {

        item.textContent = data.text || "";

    }

    messages.appendChild(item);

}

// =====================================
// النزول لآخر رسالة
// =====================================

function scrollToBottom() {

    setTimeout(() => {

        messages.scrollTop = messages.scrollHeight;

    }, 100);

                }
// =====================================
// إرسال رسالة نصية
// =====================================

async function sendMessage() {

    if (!currentUser) return;

    const text = messageInput.value.trim();

    if (text === "") return;

    sendBtn.disabled = true;

    try {

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

    } catch (error) {

        console.error("Send Message Error:", error);
        alert("حدث خطأ أثناء إرسال الرسالة.");

    } finally {

        sendBtn.disabled = false;

    }

}

// =====================================
// زر الإرسال
// =====================================

if (sendBtn) {

    sendBtn.addEventListener("click", () => {

        sendMessage();

    });

}

// =====================================
// Enter للإرسال
// Shift + Enter لسطر جديد
// =====================================

if (messageInput) {

    messageInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter" && !e.shiftKey) {

            e.preventDefault();

            sendMessage();

        }

    });

}

// =====================================
// منع الفراغات فقط
// =====================================

messageInput?.addEventListener("input", () => {

    if (messageInput.value.trim() === "") {

        sendBtn.disabled = true;

    } else {

        sendBtn.disabled = false;

    }

});

// الحالة الابتدائية للزر
if (sendBtn) {
    sendBtn.disabled = true;
}
// =====================================
// Firebase Storage
// =====================================

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// =====================================
// إرسال صورة
// =====================================

async function sendImage(file) {

    if (!file || !currentUser) return;

    try {

        imageBtn.disabled = true;

        const fileName =
            Date.now() + "_" + currentUser.uid + "_" + file.name;

        const storageRef = ref(
            storage,
            "privateChats/" + roomId + "/" + fileName
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

        console.error(err);

        alert("فشل رفع الصورة");

    } finally {

        imageBtn.disabled = false;

        imageInput.value = "";

    }

}

// =====================================
// اختيار صورة
// =====================================

if (imageBtn) {

    imageBtn.addEventListener("click", () => {

        imageInput.click();

    });

}

// =====================================

if (imageInput) {

    imageInput.addEventListener("change", (e) => {

        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            alert("الملف المختار ليس صورة.");

            return;

        }

        sendImage(file);

    });

}// =====================================
// تنسيق الوقت
// =====================================

function formatTime(timestamp) {

    if (!timestamp) return "";

    const date = timestamp.toDate();

    return date.toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit"
    });

}

// =====================================
// تحديث drawMessage
// =====================================

function drawMessage(data) {

    const wrapper = document.createElement("div");
    wrapper.className =
        data.senderId === currentUser.uid
            ? "message me"
            : "message other";

    // محتوى الرسالة
    const bubble = document.createElement("div");
    bubble.className = "bubble";

    if (data.type === "image") {

        const img = document.createElement("img");

        img.src = data.imageUrl;
        img.className = "chat-image";
        img.loading = "lazy";

        img.onclick = () => {
            window.open(data.imageUrl, "_blank");
        };

        bubble.appendChild(img);

    } else {

        bubble.textContent = data.text || "";

    }

    wrapper.appendChild(bubble);

    // الوقت
    const time = document.createElement("div");
    time.className = "message-time";
    time.textContent = formatTime(data.createdAt);

    wrapper.appendChild(time);

    messages.appendChild(wrapper);

}

// =====================================
// حفظ Listener لإيقافه لاحقاً
// =====================================

let unsubscribeMessages = null;

function loadMessages() {

    const q = query(
        collection(db, "privateChats", roomId, "messages"),
        orderBy("createdAt", "asc")
    );

    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

    unsubscribeMessages = onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((doc) => {

            drawMessage(doc.data());

        });

        scrollToBottom();

    });

}

// =====================================
// تنظيف عند مغادرة الصفحة
// =====================================

window.addEventListener("beforeunload", () => {

    if (unsubscribeMessages) {

        unsubscribeMessages();

    }
// =====================================
// إنهاء تهيئة الصفحة
// =====================================

// التركيز على مربع الكتابة عند فتح الشات
window.addEventListener("load", () => {

    if (messageInput) {
        messageInput.focus();
    }

});

// =====================================
// معالجة الأخطاء العامة
// =====================================

window.addEventListener("error", (e) => {

    console.error("Private Chat Error:", e.error || e.message);

});

// =====================================
// تنظيف الموارد قبل مغادرة الصفحة
// =====================================

window.addEventListener("beforeunload", () => {

    if (unsubscribeMessages) {
        unsubscribeMessages();
    }

});

// =====================================
// تصدير (اختياري)
// =====================================

export {
    sendMessage,
    sendImage,
    loadMessages
};

// =====================================
// End Of File
// =====================================
});
