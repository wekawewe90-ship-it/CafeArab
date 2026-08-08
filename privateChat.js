// =====================================
// Cafe Arab Private Chat
// Cloudinary + Notifications Version
// =====================================

import { auth, db } from "./firebase.js";

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

const messagesBox = document.getElementById("privateMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const chatUser = document.getElementById("chatUser");
const backBtn = document.getElementById("backBtn");

// =====================================
// متغيرات
// =====================================

let currentUser = null;
let roomId = "";
let otherUid = "";
let otherName = "";
let unsubscribe = null;

// =====================================
// بيانات المستخدم الآخر
// =====================================

const params = new URLSearchParams(location.search);

otherUid = params.get("uid");
otherName = params.get("name") || "مستخدم";

if (chatUser) {
    chatUser.textContent = "👤 " + otherName;
}

// =====================================
// زر الرجوع
// =====================================

if (backBtn) {

    backBtn.onclick = () => {
        history.back();
    };

}

// =====================================
// إنشاء Room ID ثابت
// =====================================

function getRoomId(uid1, uid2) {

    return [uid1, uid2].sort().join("_");

}

// =====================================
// تسجيل الدخول
// =====================================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        location.href = "login.html";
        return;

    }

    currentUser = user;

    if (!otherUid) {

        alert("لم يتم تحديد المستخدم.");
        return;

    }

    roomId = getRoomId(
        currentUser.uid,
        otherUid
    );

    startChat();

});

// =====================================
// تشغيل المحادثة
// =====================================

function startChat() {

    loadMessages();

}

// =====================================
// تحميل الرسائل لحظيًا
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

    if (unsubscribe) {
        unsubscribe();
    }

    unsubscribe = onSnapshot(
        q,
        (snapshot) => {

            messagesBox.innerHTML = "";

            snapshot.forEach((doc) => {

                drawMessage(doc.data());

            });

            scrollBottom();

        },
        (error) => {

            console.error(
                "Load Private Messages Error:",
                error
            );

        }
    );

}

// =====================================
// النزول لآخر رسالة
// =====================================

function scrollBottom() {

    if (!messagesBox) return;

    setTimeout(() => {

        messagesBox.scrollTop =
            messagesBox.scrollHeight;

    }, 100);

}

// =====================================
// تنسيق الوقت
// =====================================

function formatTime(timestamp) {

    if (!timestamp) return "";

    try {

        return timestamp
            .toDate()
            .toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit"
            });

    } catch (error) {

        return "";

    }

}

// =====================================
// رسم الرسالة
// =====================================

function drawMessage(data) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        data.senderId === currentUser.uid
            ? "message me"
            : "message other";

    const bubble =
        document.createElement("div");

    bubble.className = "bubble";

    // =================================
    // صورة
    // =================================

    if (
        data.type === "image" &&
        data.imageUrl
    ) {

        const img =
            document.createElement("img");

        img.src = data.imageUrl;

        img.className = "chat-image";

        img.loading = "lazy";

        img.alt = "صورة";

        img.addEventListener(
            "click",
            () => {

                window.open(
                    data.imageUrl,
                    "_blank"
                );

            }
        );

        bubble.appendChild(img);

    }

    // =================================
    // نص
    // =================================

    else {

        bubble.textContent =
            data.text || "";

    }

    wrapper.appendChild(bubble);

    // =================================
    // الوقت
    // =================================

    const time =
        document.createElement("small");

    time.className =
        "message-time";

    time.textContent =
        formatTime(data.createdAt);

    wrapper.appendChild(time);

    messagesBox.appendChild(wrapper);

}

// =====================================
// إنشاء إشعار للمستخدم الآخر
// =====================================

async function createNotification(text) {

    if (!otherUid) return;

    if (!currentUser) return;

    try {

        await addDoc(
            collection(
                db,
                "notifications",
                otherUid,
                "items"
            ),
            {

                fromUid:
                    currentUser.uid,

                fromName:
                    currentUser.displayName ||
                    "مستخدم",

                text: text,

                read: false,

                createdAt:
                    serverTimestamp()

            }
        );

    } catch (error) {

        console.error(
            "Create Notification Error:",
            error
        );

    }

}

// =====================================
// إرسال رسالة نصية
// =====================================

async function sendMessage() {

    if (!currentUser) return;

    if (!messageInput) return;

    const text =
        messageInput.value.trim();

    if (!text) return;

    try {

        if (sendBtn) {
            sendBtn.disabled = true;
        }

        await addDoc(
            collection(
                db,
                "privateChats",
                roomId,
                "messages"
            ),
            {

                senderId:
                    currentUser.uid,

                receiverId:
                    otherUid,

                senderName:
                    currentUser.displayName ||
                    "مستخدم",

                text:
                    text,

                type:
                    "text",

                createdAt:
                    serverTimestamp()

            }
        );

        // =================================
        // إنشاء الإشعار
        // =================================

        await createNotification(text);

        messageInput.value = "";

        messageInput.focus();

    } catch (error) {

        console.error(
            "Send Message Error:",
            error
        );

        alert(
            "حدث خطأ أثناء إرسال الرسالة."
        );

    } finally {

        if (sendBtn) {
            sendBtn.disabled = false;
        }

    }

}

// =====================================
// زر إرسال الرسالة
// =====================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}

// =====================================
// Enter للإرسال
// Shift + Enter سطر جديد
// =====================================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        (e) => {

            if (
                e.key === "Enter" &&
                !e.shiftKey
            ) {

                e.preventDefault();

                sendMessage();

            }

        }
    );

}

// =====================================
// حالة زر الإرسال
// =====================================

if (
    messageInput &&
    sendBtn
) {

    sendBtn.disabled = true;

    messageInput.addEventListener(
        "input",
        () => {

            sendBtn.disabled =
                messageInput.value
                    .trim()
                    .length === 0;

        }
    );

}

// =====================================
// رفع صورة إلى Cloudinary
// =====================================

async function sendImage(file) {

    if (!file) return;

    if (!currentUser) return;

    try {

        if (imageBtn) {

            imageBtn.disabled = true;

        }

        // =================================
        // تجهيز Cloudinary
        // =================================

        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );

        formData.append(
            "upload_preset",
            "ml_default"
        );

        // =================================
        // رفع الصورة
        // =================================

        const response =
            await fetch(
                "https://api.cloudinary.com/v1_1/vqwksojr/image/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

        if (!response.ok) {

            throw new Error(
                "Cloudinary Upload Failed: " +
                response.status
            );

        }

        const data =
            await response.json();

        if (!data.secure_url) {

            throw new Error(
                "لم يتم الحصول على رابط الصورة."
            );

        }

        // =================================
        // حفظ رسالة الصورة
        // =================================

        await addDoc(
            collection(
                db,
                "privateChats",
                roomId,
                "messages"
            ),
            {

                senderId:
                    currentUser.uid,

                receiverId:
                    otherUid,

                senderName:
                    currentUser.displayName ||
                    "مستخدم",

                type:
                    "image",

                imageUrl:
                    data.secure_url,

                createdAt:
                    serverTimestamp()

            }
        );

        // =================================
        // إنشاء إشعار للصورة
        // =================================

        await createNotification(
            "📷 أرسل لك صورة"
        );

    } catch (error) {

        console.error(
            "Private Image Error:",
            error
        );

        alert(
            "فشل إرسال الصورة:\n" +
            error.message
        );

    } finally {

        if (imageBtn) {

            imageBtn.disabled = false;

        }

        if (imageInput) {

            imageInput.value = "";

        }

    }

}

// =====================================
// زر اختيار الصورة
// =====================================

if (imageBtn) {

    imageBtn.addEventListener(
        "click",
        () => {

            if (imageInput) {

                imageInput.click();

            }

        }
    );

}

// =====================================
// اختيار الصورة
// =====================================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        (event) => {

            const file =
                event.target.files[0];

            if (!file) return;

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "الرجاء اختيار صورة فقط."
                );

                imageInput.value = "";

                return;

            }

            sendImage(file);

        }
    );

}

// =====================================
// تنظيف Listener
// =====================================

window.addEventListener(
    "beforeunload",
    () => {

        if (unsubscribe) {

            unsubscribe();

        }

    }
);

// =====================================
// التركيز على الكتابة
// =====================================

window.addEventListener(
    "load",
    () => {

        if (messageInput) {

            messageInput.focus();

        }

    }
);

// =====================================
// معالجة الأخطاء العامة
// =====================================

window.addEventListener(
    "error",
    (event) => {

        console.error(
            "Private Chat Error:",
            event.error ||
            event.message
        );

    }
);

// =====================================
// نهاية الملف
// =====================================

console.log(
    "✅ privateChat.js Loaded Successfully"
);
