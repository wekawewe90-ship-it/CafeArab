import { auth, db } from "./firebase.js";

import {
    doc,
    getDoc
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

function createChatId(uid1, uid2) {

    return [uid1, uid2].sort().join("_");

}

onAuthStateChanged(auth, async (user) => {

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
