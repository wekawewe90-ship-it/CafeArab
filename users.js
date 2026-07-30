import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const usersList = document.getElementById("usersList");

async function loadUsers() {

    usersList.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "users"));

    querySnapshot.forEach((doc) => {

        const user = doc.data();

        usersList.innerHTML += `
            <div class="card" style="margin-bottom:15px;">
                <h3>👤 ${user.name}</h3>

                <p>@${user.username}</p>

                <button class="btn">
                    💬 بدء محادثة
                </button>
            </div>
        `;

    });

}

loadUsers();
