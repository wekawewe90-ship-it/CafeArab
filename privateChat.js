// =====================================
// Cafe Arab Private Chat
// Cloudinary + Real Name + Notifications
// + Online / Offline
// + Message Read Status
// =====================================

import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    getDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// =====================================
// عناصر الصفحة
// =====================================

const messagesBox =
    document.getElementById("privateMessages");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const imageBtn =
    document.getElementById("imageBtn");

const imageInput =
    document.getElementById("imageInput");

const chatUser =
    document.getElementById("chatUser");

const backBtn =
    document.getElementById("backBtn");

// =====================================
// متغيرات
// =====================================

let currentUser = null;

let currentUserName = "مستخدم";

let roomId = "";

let otherUid = "";

let otherName = "مستخدم";

let unsubscribe = null;

let unsubscribeOtherUser = null;

// =====================================
// بيانات المستخدم الآخر من الرابط
// =====================================

const params =
    new URLSearchParams(location.search);

otherUid =
    params.get("uid");

otherName =
    params.get("name") || "مستخدم";

// =====================================
// عرض الاسم
// =====================================

if (chatUser) {

    chatUser.textContent =
        "👤 " + otherName;

}

// =====================================
// إنشاء مكان للحالة تحت الاسم
// =====================================

let statusElement = null;

function createStatusElement() {

    if (!chatUser) return;

    if (statusElement) return;

    statusElement =
        document.createElement("div");

    statusElement.id =
        "privateUserStatus";

    statusElement.style.fontSize =
        "13px";

    statusElement.style.marginTop =
        "4px";

    statusElement.style.fontWeight =
        "normal";

    statusElement.style.opacity =
        "0.85";

    chatUser.parentNode.appendChild(
        statusElement
    );

}

// =====================================
// تنسيق آخر ظهور
// =====================================

function formatLastSeen(timestamp) {

    if (!timestamp) {

        return "آخر ظهور غير معروف";

    }

    try {

        const date =
            timestamp.toDate();

        return (
            "⚪ غير متصل — آخر ظهور " +
            date.toLocaleTimeString(
                "ar-EG",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
        );

    } catch (error) {

        return "⚪ غير متصل";

    }

}

// =====================================
// تحديث حالة المستخدم الآخر
// =====================================

function updateOtherUserStatus(data) {

    if (!statusElement) return;

    if (data.online === true) {

        statusElement.textContent =
            "🟢 متصل الآن";

    } else {

        statusElement.textContent =
            formatLastSeen(
                data.lastSeen
            );

    }

}

// =====================================
// مراقبة حالة المستخدم الآخر
// =====================================

function watchOtherUserStatus() {

    if (!otherUid) return;

    const otherUserRef =
        doc(
            db,
            "users",
            otherUid
        );

    if (unsubscribeOtherUser) {

        unsubscribeOtherUser();

    }

    unsubscribeOtherUser =
        onSnapshot(
            otherUserRef,
            (snapshot) => {

                if (!snapshot.exists()) {

                    if (statusElement) {

                        statusElement.textContent =
                            "⚪ غير متصل";

                    }

                    return;

                }

                updateOtherUserStatus(
                    snapshot.data()
                );

            },
            (error) => {

                console.error(
                    "User Status Error:",
                    error
                );

                if (statusElement) {

                    statusElement.textContent =
                        "";

                }

            }
        );

}

// =====================================
// الحصول على الاسم الحقيقي
// =====================================

async function getRealUserName(uid) {

    if (!uid) {

        return "مستخدم";

    }

    try {

        const userRef =
            doc(
                db,
                "users",
                uid
            );

        const userSnap =
            await getDoc(
                userRef
            );

        if (userSnap.exists()) {

            const data =
                userSnap.data();

            return (
                data.name ||
                data.username ||
                "مستخدم"
            );

        }

    } catch (error) {

        console.error(
            "Get User Name Error:",
            error
        );

    }

    return "مستخدم";

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

    return [
        uid1,
        uid2
    ]
        .sort()
        .join("_");

}

// =====================================
// تسجيل الدخول
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            location.href =
                "login.html";

            return;

        }

        currentUser = user;

        currentUserName =
            await getRealUserName(
                user.uid
            );

        if (!otherUid) {

            alert(
                "لم يتم تحديد المستخدم."
            );

            return;

        }

        roomId =
            getRoomId(
                currentUser.uid,
                otherUid
            );

        createStatusElement();

        watchOtherUserStatus();

        startChat();

    }
);

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

    if (!messagesBox) return;

    const messagesRef =
        collection(
            db,
            "privateChats",
            roomId,
            "messages"
        );

    const q =
        query(
            messagesRef,
            orderBy(
                "createdAt",
                "asc"
            )
        );

    if (unsubscribe) {

        unsubscribe();

    }

    unsubscribe =
        onSnapshot(
            q,
            async (snapshot) => {

                messagesBox.innerHTML =
                    "";

                const unreadMessages = [];

                snapshot.forEach(
                    (messageDoc) => {

                        const data =
                            messageDoc.data();

                        drawMessage(
                            data
                        );

                        // الرسائل التي أرسلها الطرف الآخر
                        // ولم تتم قراءتها بعد
                        if (
                            data.senderId ===
                                otherUid &&
                            data.read !== true
                        ) {

                            unreadMessages.push(
                                messageDoc.id
                            );

                        }

                    }
                );

                scrollBottom();

                // تحويل الرسائل إلى مقروءة
                await markMessagesAsRead(
                    unreadMessages
                );

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
// تحويل الرسائل إلى مقروءة
// =====================================

async function markMessagesAsRead(
    messageIds
) {

    if (!messageIds.length) {
        return;
    }

    try {

        for (
            const messageId
            of messageIds
        ) {

            const messageRef =
                doc(
                    db,
                    "privateChats",
                    roomId,
                    "messages",
                    messageId
                );

            await updateDoc(
                messageRef,
                {
                    read: true
                }
            );

        }

    } catch (error 
