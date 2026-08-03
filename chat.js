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

const messages=document.getElementById("messages");
const messageInput=document.getElementById("messageInput");
const sendBtn=document.getElementById("sendBtn");

const imageBtn=document.getElementById("imageBtn");
const imageInput=document.getElementById("imageInput");

const logoutBtn=document.getElementById("logoutBtn");
const userName=document.getElementById("userName");

// بيانات المستخدم

let currentUser=null;

// تسجيل الدخول

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="login.html";
return;

}

currentUser=user;

userName.innerHTML="👤 "+(user.displayName || user.email);

loadMessages();

});

// تسجيل الخروج

logoutBtn.addEventListener("click",()=>{

signOut(auth);

});

// اختيار صورة

imageBtn.addEventListener("click",()=>{

imageInput.click();

});
// =========================
// إرسال رسالة نصية
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

    try {

        await addDoc(collection(db, "messages"), {

            uid: currentUser.uid,

            user: currentUser.email,

            type: "text",

            text: text,

            createdAt: serverTimestamp()

        });

        messageInput.value = "";

    } catch (error) {

        console.error(error);

        alert("حدث خطأ أثناء إرسال الرسالة");

    }

}

// =========================
// رفع صورة
// =========================

imageInput.addEventListener("change", async () => {

    if (!imageInput.files.length) return;

    const file = imageInput.files[0];

    const formData = new FormData();

    formData.append("file", file);

    formData.append("upload_preset", "ml_default");

    try {

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/vqwksojr/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        await addDoc(collection(db, "messages"), {

            uid: currentUser.uid,

            user: currentUser.email,

            type: "image",

            image: data.secure_url,

            createdAt: serverTimestamp()

        });

        imageInput.value = "";

    } catch (error) {

        console.error(error);

        alert("فشل رفع الصورة");

    }

});
// =========================
// تحميل الرسائل
// =========================

function loadMessages() {

    const q = query(

        collection(db, "messages"),

        orderBy("createdAt", "asc")

    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            const box = document.createElement("div");

            box.className = "message";

            if (data.uid === currentUser.uid) {

                box.classList.add("me");

            } else {

                box.classList.add("other");

            }

            // رسالة نصية
            if (data.type === "text") {

                box.innerHTML = `

                    <div class="sender">
                        ${data.user}
                    </div>

                    <div class="text">
                        ${data.text}
                    </div>

                `;

            }

            // رسالة صورة
            if (data.type === "image") {

                box.innerHTML = `

                    <div class="sender">
                        ${data.user}
                    </div>

                    <img
                        src="${data.image}"
                        style="
                            max-width:220px;
                            border-radius:12px;
                            cursor:pointer;
                        "
                    >

                `;

            }

            messages.appendChild(box);

        });

        messages.scrollTop = messages.scrollHeight;

    });

    }
