import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const notificationBtn = document.getElementById("notificationBtn");

onAuthStateChanged(auth, (user) => {

    if (!user) return;

    loadNotifications(user.uid);

});

function loadNotifications(uid) {

    const q = query(

        collection(db, "notifications", uid, "items"),

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
