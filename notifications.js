import { auth, db } from "./firebase.js";

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

const notificationBtn =
document.getElementById("notificationBtn");

const notificationsMenu =
document.getElementById("notificationsMenu");

const notificationsList =
document.getElementById("notificationsList");

let currentUid = "";

onAuthStateChanged(auth,(user)=>{

    if(!user) return;

    currentUid = user.uid;

    loadNotifications();

});

function loadNotifications(){

    const q = query(

        collection(
            db,
            "notifications",
            currentUid,
            "items"
        ),

        where("read","==",false),

        orderBy("createdAt","desc")

    );
console.log("Loading notifications for:", uid);
  onSnapshot(q, (snapshot) => {

    console.log("Notifications:", snapshot.size);
    

        const count = snapshot.size;

        if(count>0){

            notificationBtn.innerHTML =
            `🔔 <span style="
                background:red;
                color:#fff;
                padding:2px 7px;
                border-radius:20px;
                font-size:12px;
            ">${count}</span>`;

        }else{

            notificationBtn.innerHTML="🔔";

        }

        notificationsList.innerHTML="";

        if(count===0){

            notificationsList.innerHTML=
            "<p style='text-align:center'>لا توجد إشعارات</p>";

            return;

        }

               function loadNotifications(uid) {

    const q = query(
        collection(db, "notifications", uid, "items"),
        where("read", "==", false),
        orderBy("createdAt", "desc")
    );

    onSnapshot(q, (snapshot) => {

        const count = snapshot.size;

        notificationBtn.innerHTML =
            count > 0 ? `🔔 <span style="color:red">${count}</span>` : "🔔";

        notificationsList.innerHTML = "";

        if (count === 0) {

            notificationsList.innerHTML =
                "<div style='padding:10px'>لا توجد إشعارات</div>";

            return;

        }

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            const item = document.createElement("div");

            item.className = "card";
            item.style.marginBottom = "10px";
            item.style.cursor = "pointer";

            item.innerHTML = `
                <b>${data.fromName}</b>
                <br>
                ${data.text}
            `;

            item.onclick = () => {

                notificationsMenu.style.display = "none";

                window.location.href =
                    `private-chat.html?uid=${data.fromUid}`;

            };

            notificationsList.appendChild(item);

        });

    });

}

notificationBtn.addEventListener("click", (e) => {

    e.stopPropagation();

    notificationsMenu.style.display =
        notificationsMenu.style.display === "block"
            ? "none"
            : "block";

});

document.addEventListener("click", (e) => {

    if (!notificationsMenu.contains(e.target) &&
        e.target !== notificationBtn) {

        notificationsMenu.style.display = "none";

    }

});
