import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// ======================
// عناصر الصفحة
// ======================

const chatTitle = document.getElementById("chatTitle");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

// ======================

const params = new URLSearchParams(window.location.search);

const otherUid = params.get("uid");

let currentUid = "";
let chatId = "";

let currentUserData = null;
let otherUserData = null;

// ======================
// إنشاء رقم المحادثة
// ======================

function createChatId(uid1, uid2) {

    return [uid1, uid2].sort().join("_");

}

// ======================
// تسجيل الدخول
// ======================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    currentUid = user.uid;

    chatId = createChatId(currentUid, otherUid);

    try {

        const mySnap = await getDoc(doc(db, "users", currentUid));

        if (mySnap.exists()) {

            currentUserData = mySnap.data();

        }

        const otherSnap = await getDoc(doc(db, "users", otherUid));

        if (otherSnap.exists()) {

            otherUserData = otherSnap.data();

     chatTitle.innerHTML = `
💬 ${otherUserData.name}
<br>
<span id="userStatus"
style="
font-size:13px;
color:#999;
">
جارى التحميل...
</span>
`;       

    } catch (e) {

        console.error(e);

    }

    loadMessages();

});

// ======================
// إرسال رسالة
// ======================

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

        // حفظ الرسالة
        await addDoc(
            collection(db, "privateChats", chatId, "messages"),
            {
                sender: currentUid,
                receiver: otherUid,
                senderName: currentUserData?.name || auth.currentUser.email,
                text: text,
                createdAt: serverTimestamp()
            }
        );

        // إنشاء إشعار
        await addDoc(
            collection(db, "notifications", otherUid, "items"),
            {
                fromUid: currentUid,
                fromName: currentUserData?.name || auth.currentUser.email,
                text: text,
                read: false,
                createdAt: serverTimestamp()
            }
        );

        messageInput.value = "";

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

                }

// ======================
// تحميل الرسائل
// ======================

function loadMessages() {

    const q = query(
        collection(db, "privateChats", chatId, "messages"),
        orderBy("createdAt", "asc")
    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            const mine = data.sender === currentUid;

            const bubble = document.createElement("div");

            bubble.style.background =
                mine ? "#d4af37" : "#333";

            bubble.style.color =
                mine ? "#000" : "#fff";

            bubble.style.padding = "12px";
            bubble.style.margin = "10px 0";
            bubble.style.borderRadius = "12px";
            bubble.style.maxWidth = "75%";
            bubble.style.wordBreak = "break-word";

            if (mine) {

                bubble.style.marginLeft = "auto";
                bubble.style.textAlign = "left";

            } else {

                bubble.style.marginRight = "auto";
                bubble.style.textAlign = "right";

            }

            bubble.innerHTML = data.text;

            messages.appendChild(bubble);

        });

        messages.scrollTop = messages.scrollHeight;

    });

            }

