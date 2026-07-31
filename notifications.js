import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const notificationBtn = document.getElementById("notificationBtn");
const notificationsMenu = document.getElementById("notificationsMenu");
const notificationsList = document.getElementById("notificationsList");

onAuthStateChanged(auth, (user) => {

    if (!user) return;

    loadNotifications(user.uid);

});

function loadNotifications(uid) {

    const q = query(

        collection(db, "notifications", uid, "items"),

        where("read", "==", false),

        orderBy("createdAt", "desc")

    );

    onSnapshot(q, (snapshot) => {

        const count = snapshot.size;

        notificationBtn.textContent =
            count > 0 ? `🔔 ${count}` : "🔔";

        notificationsList.innerHTML = "";

        if (count === 0) {

            notificationsList.innerHTML =
                "<p>لا توجد إشعارات</p>";

            return;

        }

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            notificationsList.innerHTML += `

            <div class="card"
            style="margin-bottom:10px;cursor:pointer"
            onclick="location.href='private-chat.html?uid=${data.fromUid}'">

                <b>${data.fromName}</b>

                <br>

                ${data.text}

            </div>

            `;

        });

    });

}

notificationBtn.addEventListener("click", () => {

    if (notificationsMenu.style.display === "block") {

        notificationsMenu.style.display = "none";

    } else {

        notificationsMenu.style.display = "block";

    }

});
