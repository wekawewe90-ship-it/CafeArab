import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    getDoc, 
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// =========================
// عناصر الصفحة
// =========================

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const imageBtn =
document.getElementById("imageBtn");

const imageInput =
document.getElementById("imageInput");
const logoutBtn = document.getElementById("logoutBtn");
const notificationBtn = document.getElementById("notificationBtn");
const userName = document.getElementById("userName");

// =========================

let currentUser = null;
let currentUserData = null;

// =========================
// تسجيل الدخول
// =========================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    currentUser = user;

    try {

        const userRef = doc(db, "users", user.uid);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {

            currentUserData = userSnap.data();

            userName.textContent =
                "👤 " + currentUserData.name;

        } else {

            userName.textContent =
                "👤 " + user.email;

        }

    } catch (error) {

        console.error(error);

        userName.textContent =
            "👤 " + user.email;

    }

    loadMessages();

});



// =========================
// إرسال رسالة
// =========================

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

async function sendMessage() {

    const text = messageInput.value.trim();

    if (text === "") return;

    if (!currentUser) return;

    try {

        await addDoc(collection(db, "messages"), {

            uid: currentUser.uid,

            name: currentUserData?.name || currentUser.email,

            username: currentUserData?.username || "",

            user: currentUser.email,

            text: text,

            createdAt: serverTimestamp()

        });

        messageInput.value = "";

    } catch (error) {

        console.error(error);

        alert(error.message);

    }

}

// =========================
// تحميل الرسائل
// =========================

function loadMessages() {

    const q = query(

        collection(db, "messages"),

        orderBy("createdAt")

    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            let sender = "";

            if (data.uid) {

                sender = `
                <a
                    href="private-chat.html?uid=${data.uid}"
                    style="
                        color:#d4af37;
                        text-decoration:none;
                        font-weight:bold;
                        cursor:pointer;
                    ">
                    ${data.name || data.user}
                </a>
                `;

            } else {

                sender = `
                <b style="color:#d4af37;">
                    ${data.user}
                </b>
                `;

            }

            messages.innerHTML += `

            <div style="
                background:#222;
                padding:12px;
                margin-bottom:10px;
                border-radius:12px;
                color:white;
            ">

                ${sender}

                <br><br>

                ${data.text}

            </div>

            `;

        });

        messages.scrollTop = messages.scrollHeight;

    });

                   }


// =========================
// تسجيل الخروج
// =========================

logoutBtn.addEventListener("click", async () => {

    try {

        if(currentUser){

            await updateDoc(
                doc(db,"users",currentUser.uid),
                {
                    online:false,
                    lastSeen:serverTimestamp()
                }
            );

        }

        await signOut(auth);

        window.location.href = "login.html";

    } catch (error) {

        console.error(error);

        alert("حدث خطأ أثناء تسجيل الخروج");

    }

}); 
