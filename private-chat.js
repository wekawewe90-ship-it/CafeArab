import { auth, db } from "./firebase.js";

import {
collection,
addDoc,
query,
where,
orderBy,
onSnapshot,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// عناصر الصفحة

const messages = document.getElementById("privateMessages");

const messageInput = document.getElementById("messageInput");

const sendBtn = document.getElementById("sendBtn");

const imageBtn = document.getElementById("imageBtn");

const imageInput = document.getElementById("imageInput");

const chatUser = document.getElementById("chatUser");

const backBtn = document.getElementById("backBtn");

// بيانات المستخدم

let currentUser = null;

// قراءة uid من الرابط

const params = new URLSearchParams(window.location.search);

const otherUid = params.get("uid");

const otherName = params.get("name");

chatUser.innerHTML = "👤 " + (otherName || "مستخدم");

// رجوع

backBtn.addEventListener("click", () => {

    window.location.href = "chat.html";

});

// التحقق من تسجيل الدخول

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";

        return;

    }

    currentUser = user;

});
