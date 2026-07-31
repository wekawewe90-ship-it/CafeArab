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
  where
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
const notificationBtn = document.getElementById("notificationBtn");
const userName = document.getElementById("userName");

let currentUser = null;
let currentUserData = null;

// التحقق من تسجيل الدخول
onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    currentUser = user;

    // قراءة بيانات المستخدم
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

        currentUserData = userSnap.data();

        userName.textContent = "👤 " + currentUserData.name;

    } else {

        userName.textContent = "👤 " + user.email;

    }

    loadMessages();

    loadNotifications();

});
// =========================
// تحميل الإشعارات
// =========================

function loadNotifications() {

    const q = query(

        collection(db, "notifications", currentUser.uid, "items"),

        where("read", "==", false)

    );

    onSnapshot(q, (snapshot) => {

        const count = snapshot.size;

        if (count === 0) {

            notificationBtn.textContent = "🔔";

        } else {

            notificationBtn.textContent = `🔔 ${count}`;

        }

    });

}

// =========================
// الضغط على زر الإشعارات
// =========================

notificationBtn.addEventListener("click", () => {

    alert("قريبًا: قائمة الإشعارات 📬");

});

const notificationsMenu = document.getElementById("notificationsMenu");
const notificationsList = document.getElementById("notificationsList");

notificationBtn.addEventListener("click", () => {

    if (notificationsMenu.style.display === "block") {

        notificationsMenu.style.display = "none";
        return;

    }

    notificationsMenu.style.display = "block";

    const q = query(

        collection(db, "notifications", currentUser.uid, "items"),

        orderBy("createdAt", "desc")

    );

    onSnapshot(q, (snapshot) => {

        notificationsList.innerHTML = "";

        if (snapshot.empty) {

            notificationsList.innerHTML = "<p style='color:white'>لا توجد إشعارات</p>";
            return;

        }

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            notificationsList.innerHTML += `

            <div
            onclick="window.location='private-chat.html?uid=${data.fromUid}'"
            style="
                background:#333;
                color:white;
                padding:10px;
                margin-bottom:10px;
                border-radius:10px;
                cursor:pointer;
            ">

                <b>${data.fromName}</b>

                <br>

                ${data.text}

            </div>

            `;

        });

    });

});
