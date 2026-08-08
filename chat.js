// =====================================
// Cafe Arab Chat V3
// =====================================

import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDoc,
    doc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// =====================================
// عناصر الصفحة
// =====================================

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");
const usersBtn = document.getElementById("usersBtn");

// =====================================
// متغيرات
// =====================================

let currentUser = null;
let currentUserName = "مستخدم";

// =====================================
// الحصول على الاسم الحقيقي
// =====================================

async function getUserName(uid, fallback = "مستخدم") {

    try {

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            const data = userSnap.data();

            return (
                data.name ||
                data.username ||
                fallback
            );

        }

    } catch (error) {

        console.error(
            "Get User Name Error:",
            error
        );

    }

    return fallback;
}

// =====================================
// تسجيل الدخول
// =====================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "login.html";
        return;

    }

    currentUser = user;

    currentUserName =
        await getUserName(
            user.uid,
            user.displayName || "مستخدم"
        );

    if (userName) {

        userName.textContent =
            "👤 " + currentUserName;

    }

    startChat();

});

// =====================================
// تشغيل الشات
// =====================================

function startChat() {

    loadMessages();

}

// =====================================
// تسجيل الخروج
// =====================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            signOut(auth);

        }
    );

}

// =====================================
// زر الصور
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
// إرسال الرسالة النصية
// =====================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}

// =====================================
// Enter للإرسال
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
// إرسال رسالة
// =====================================

async function sendMessage() {

    if (!currentUser) return;

    const text =
        messageInput.value.trim();

    if (!text) return;

    try {

        if (sendBtn) {

            sendBtn.disabled = true;

        }

        await addDoc(
            collection(db, "messages"),
            {
                uid: currentUser.uid,

                user: currentUserName,

                type: "text",

                text: text,

                createdAt:
                    serverTimestamp()
            }
        );

        messageInput.value = "";

    } catch (error) {

        console.error(
            "Send Message Error:",
            error
        );

        alert(
            "حدث خطأ أثناء إرسال الرسالة"
        );

    } finally {

        if (sendBtn) {

            sendBtn.disabled = false;

        }

    }

}

// =====================================
// رفع الصور
// =====================================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        uploadImage
    );

}

// =====================================
// رفع الصورة إلى Cloudinary
// =====================================

async function uploadImage() {

    if (!currentUser) return;

    if (
        !imageInput ||
        !imageInput.files.length
    ) {

        return;

    }

    const file =
        imageInput.files[0];

    try {

        if (imageBtn) {

            imageBtn.disabled = true;

        }

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
                "Cloudinary upload failed"
            );

        }

        const data =
            await response.json();

        if (!data.secure_url) {

            throw new Error(
                "لم يتم الحصول على رابط الصورة"
            );

        }

        await addDoc(
            collection(db, "messages"),
            {
                uid: currentUser.uid,

                user: currentUserName,

                type: "image",

                image: data.secure_url,

                createdAt:
                    serverTimestamp()
            }
        );

        imageInput.value = "";

    } catch (error) {

        console.error(
            "Image Upload Error:",
            error
        );

        alert(
            "فشل رفع الصورة"
        );

    } finally {

        if (imageBtn) {

            imageBtn.disabled = false;

        }

    }

}

// =====================================
// تحميل الرسائل
// =====================================

function loadMessages() {

    if (!messages) return;

    const q = query(
        collection(db, "messages"),
        orderBy("createdAt", "asc")
    );

    onSnapshot(
        q,
        async (snapshot) => {

            messages.innerHTML = "";

            const fragment =
                document.createDocumentFragment();

            for (
                const messageDoc
                of snapshot.docs
            ) {

                const data =
                    messageDoc.data();

                const box =
                    document.createElement("div");

                box.className = "message";

                if (
                    data.uid ===
                    currentUser.uid
                ) {

                    box.classList.add("me");

                } else {

                    box.classList.add("other");

                }

                // =================================
                // اسم المرسل
                // =================================

                const sender =
                    document.createElement("div");

                sender.className =
                    "sender";

                const senderName =
                    data.user ||
                    "مستخدم";

                sender.textContent =
                    senderName;

                // =================================
                // جعل الاسم قابل للضغط
                // =================================

                if (
                    data.uid &&
                    data.uid !== currentUser.uid
                ) {

                    sender.style.cursor =
                        "pointer";

                    sender.title =
                        "فتح المحادثة الخاصة";

                    sender.addEventListener(
                        "click",
                        () => {

                            openPrivateChat(
                                data.uid,
                                senderName
                            );

                        }
                    );

                }

                box.appendChild(sender);

                // =================================
                // رسالة نصية
                // =================================

                if (
                    data.type === "text"
                ) {

                    const text =
                        document.createElement("div");

                    text.className =
                        "text";

                    text.textContent =
                        data.text || "";

                    box.appendChild(text);

                }

                // =================================
                // صورة
                // =================================

                else if (
                    data.type === "image" &&
                    data.image
                ) {

                    const img =
                        document.createElement("img");

                    img.src =
                        data.image;

                    img.className =
                        "chatImage";

                    img.loading =
                        "lazy";

                    img.alt =
                        "صورة";

                    img.addEventListener(
                        "click",
                        () => {

                            window.open(
                                data.image,
                                "_blank"
                            );

                        }
                    );

                    box.appendChild(img);

                }

                fragment.appendChild(box);

            }

            messages.appendChild(
                fragment
            );

            // =================================
            // النزول لآخر رسالة
            // =================================

            setTimeout(
                () => {

                    messages.scrollTop =
                        messages.scrollHeight;

                },
                100
            );

        },
        (error) => {

            console.error(
                "Load Messages Error:",
                error
            );

        }
    );

}

// =====================================
// فتح المحادثة الخاصة
// =====================================

function openPrivateChat(
    uid,
    name
) {

    if (!currentUser) return;

    if (!uid) return;

    if (
        uid === currentUser.uid
    ) {

        return;

    }

    window.location.href =
        "private-chat.html?uid=" +
        encodeURIComponent(uid) +
        "&name=" +
        encodeURIComponent(name);

}

// =====================================
// متاح لو فيه كود HTML بيستدعيها
// =====================================

window.openPrivateChat =
    openPrivateChat;

// =====================================
// زر المستخدمين
// =====================================

if (usersBtn) {

    usersBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "users.html";

        }
    );

}

// =====================================
// نهاية الملف
// =====================================
