import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
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

const chatTitle = document.getElementById("chatTitle");
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const params = new URLSearchParams(window.location.search);
const otherUid = params.get("uid");

let currentUid = "";
let chatId = "";
let currentUserData = null;
let otherUserData = null;

function createChatId(uid1, uid2) {
    return [uid1, uid2].sort().join("_");
}

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    currentUid = user.uid;

    chatId = createChatId(currentUid, otherUid);

    // بيانات المستخدم الحالي
    const mySnap = await getDoc(doc(db, "users", currentUid));

    if (mySnap.exists()) {
        currentUserData = mySnap.data();
    }

    // بيانات المستخدم الآخر
    const otherSnap = await getDoc(doc(db, "users", otherUid));

    if (otherSnap.exists()) {

        otherUserData = otherSnap.data();

        chatTitle.innerHTML = "💬 " + otherUserData.name;

    } else {

        chatTitle.innerHTML = "المستخدم غير موجود";

    }

    loadMessages();

});

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
                senderName: currentUserData?.name || 
                auth.currentUser.email,
                text: text,
                createdAt: serverTimestamp()
            }
        );

        // إنشاء إشعار للطرف الآخر
        await addDoc(
            collection(db, "notifications", otherUid, "items"),
            {
                fromUid: currentUid,
                fromName: currentUserData.name,
                text: text,
                chatId: chatId,
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

// تحميل الرسائل
function loadMessages() {

    const q = query(
        collection(db, "privateChats", chatId, "messages"),
        orderBy("createdAt")
    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            const mine = data.sender === currentUid;

            messages.innerHTML += `

            <div style="
                background:${mine ? "#d4af37" : "#333"};
                color:${mine ? "#000" : "#fff"};
                padding:12px;
                margin:10px 0;
                border-radius:12px;
                text-align:${mine ? "left" : "right"};
                max-width:75%;
                margin-${mine ? "left" : "right"}:auto;
                word-break:break-word;
            ">

                ${data.text}

            </div>

            `;

        });

        messages.scrollTop = messages.scrollHeight;

    });

}
