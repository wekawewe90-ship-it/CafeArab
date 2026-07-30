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
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// عناصر الصفحة
const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userName = document.getElementById("userName");

let currentUser = null;

// التحقق من تسجيل الدخول
onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    currentUser = user;
    userName.textContent = "👤 " + user.email;

    loadMessages();
});

// إرسال رسالة
sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {

    const text = messageInput.value.trim();

    if (text === "") return;

    try {

        await addDoc(collection(db, "messages"), {
            user: currentUser.email,
            text: text,
            createdAt: serverTimestamp()
        });

        messageInput.value = "";

    } catch (error) {

        console.error(error);
        alert("حدث خطأ أثناء إرسال الرسالة");

    }

}

// تحميل الرسائل
function loadMessages() {

    const q = query(
        collection(db, "messages"),
        orderBy("createdAt")
    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((doc) => {

            const data = doc.data();

            messages.innerHTML += `

            <div style="
                background:#222;
                padding:12px;
                margin-bottom:10px;
                border-radius:12px;
                color:white;
            ">

                <b style="color:#d4af37;">
                    ${data.user}
                </b>

                <br><br>

                ${data.text}

            </div>

            `;

        });

        messages.scrollTop = messages.scrollHeight;

    });

}
<a href="users.html" class="btn" style="width:auto;padding:10px 18px;">
👥 المستخدمون
</a>
// تسجيل الخروج
logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});
