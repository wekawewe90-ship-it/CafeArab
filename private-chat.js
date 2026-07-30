import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const chatTitle = document.getElementById("chatTitle");

// قراءة uid من الرابط
const params = new URLSearchParams(window.location.search);
const otherUid = params.get("uid");
let currentUid = "";
let chatId = "";

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

function createChatId(uid1, uid2) {

    return [uid1, uid2].sort().join("_");

}

onAuthStateChanged(auth, async (user) => {
currentUid = user.uid;

chatId = createChatId(currentUid, otherUid);

console.log("Chat ID:", chatId);
    
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // قراءة بيانات المستخدم الآخر
    const docRef = doc(db, "users", otherUid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

        const data = docSnap.data();

        chatTitle.innerHTML = "💬 " + data.name;

    } else {

        chatTitle.innerHTML = "المستخدم غير موجود";

    }

});
sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {

    const text = messageInput.value.trim();

    if (text === "") return;

    try {

        await addDoc(
            collection(db, "privateChats", chatId, "messages"),
            {
                sender: currentUid,
                receiver: otherUid,
                text: text,
                createdAt: serverTimestamp()
            }
        );

        messageInput.value = "";

    } catch (error) {

        console.error(error);
        alert(error.message);

    }

}
