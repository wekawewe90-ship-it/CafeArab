import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc
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

        where("read","==",false)

    );

    onSnapshot(q,(snapshot)=>{

        notificationsList.innerHTML="";

        const count = snapshot.size;

        notificationBtn.innerHTML =
        count > 0
        ? `🔔 <span style="
            background:red;
            color:white;
            border-radius:50%;
            padding:2px 7px;
            font-size:12px;
        ">${count}</span>`
        : "🔔";
        if(count===0){

            notificationsList.innerHTML =
            "<div style='padding:12px;text-align:center'>لا توجد إشعارات</div>";

            return;

        }

        snapshot.forEach((docItem)=>{

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

            item.onclick = async()=>{

                try{

                    await updateDoc(docItem.ref,{
                        read:true
                    });

                }catch(error){

                    console.error(error);

                }

                notificationsMenu.style.display="none";

                window.location.href =
                `private-chat.html?uid=${data.fromUid}`;

            };

            notificationsList.appendChild(item);

        });

    });

}notificationBtn.addEventListener("click",(e)=>{

    e.stopPropagation();

    if(notificationsMenu.style.display==="block"){

        notificationsMenu.style.display="none";

    }else{

        notificationsMenu.style.display="block";

    }

});

document.addEventListener("click",(e)=>{

    if(

        !notificationsMenu.contains(e.target) &&

        e.target!==notificationBtn

    ){

        notificationsMenu.style.display="none";

    }

});
