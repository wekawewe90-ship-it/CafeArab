import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const usersList = document.getElementById("usersList");
const search = document.getElementById("search");

let allUsers = [];

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    await loadUsers(user.uid);

});

async function loadUsers(currentUid) {

    usersList.innerHTML = "جاري تحميل المستخدمين...";

    const snapshot = await getDocs(collection(db, "users"));

    allUsers = [];

    snapshot.forEach((doc) => {

        if (doc.id !== currentUid) {

            allUsers.push({
                id: doc.id,
                ...doc.data()
            });

        }

    });

    renderUsers(allUsers);

}

function renderUsers(users) {

    usersList.innerHTML = "";

    if (users.length === 0) {
        usersList.innerHTML = "<p>لا يوجد مستخدمون.</p>";
        return;
    }

    users.forEach((user) => {

        usersList.innerHTML += `

        <div class="card" style="margin-bottom:15px;">

            <h3>👤 ${user.name}</h3>

            <p>@${user.username}</p>

            <a href="private-chat.html?uid=${user.id}" class="btn" target="_self">
💬 بدء محادثة
</a> 
        </div>

        `;

    });

}

search.addEventListener("input", () => {

    const value = search.value.toLowerCase();

    const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(value) ||
        user.username.toLowerCase().includes(value)
    );

    renderUsers(filtered);

});
