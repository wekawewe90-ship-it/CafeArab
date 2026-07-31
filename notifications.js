import { auth, db } from "./firebase.js";

import {
    collection,
    query,
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
        )

    );

    onSnapshot(q,(snapshot)=>{

        let unread = 0;

        notificationsList.innerHTML = "";

           snapshot.forEach((docItem)=>{

            const data = docItem.data();

            if(data.read === false){

                unread++;

            }

            const item = document.createElement("div");

            item.className = "card";

            item.style.marginBottom = "10px";

            item.style.cursor = "pointer";

            item.innerHTML = `

                <b>${data.fromName}</b>

                <br>

                ${data.text}

            `;

            item.onclick = async()=>{

                try{

                    await updateDoc(docItem.ref,{

                        read:true

                    });

                }catch(e){

                    console.error(e);

                }

                notificationsMenu.style.display="none";

                window.location.href=
                `private-chat.html?uid=${data.fromUid}`;

            };

            notificationsList.appendChild(item);

        });

        if(unread>0){

            notificationBtn.innerHTML=
            `🔔 <span style="
            background:red;
            color:white;
            border-radius:50%;
            padding:2px 7px;
            font-size:12px;
            ">${unread}</span>`;

        }else{

            notificationBtn.innerHTML="🔔";

        }

    });

                }

notificationBtn.addEventListener("click",(e)=>{

    e.stopPropagation();

    notificationsMenu.style.display =
    notificationsMenu.style.display==="block"
    ? "none"
    : "block";

});

document.addEventListener("click",(e)=>{

    if(

        !notificationsMenu.contains(e.target) &&

        e.target!==notificationBtn

    ){

        notificationsMenu.style.display="none";

    }

});
