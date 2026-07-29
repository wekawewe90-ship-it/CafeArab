import { db } from "./firebase.js";

import {
collection,
addDoc,
query,
orderBy,
onSnapshot,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

const input = document.getElementById("messageInput");
const button = document.getElementById("sendBtn");
const box = document.getElementById("messages");

button.onclick = async () => {

const text = input.value.trim();

if(text==="") return;

await addDoc(collection(db,"messages"),{

user:"مستخدم",

text:text,

createdAt:serverTimestamp()

});

input.value="";

};

const q=query(collection(db,"messages"),orderBy("createdAt"));

onSnapshot(q,(snapshot)=>{

box.innerHTML="";

snapshot.forEach((doc)=>{

const data=doc.data();

box.innerHTML+=`

<div class="msg">

<b>${data.user}</b><br>

${data.text}

</div>

`;

});

box.scrollTop=box.scrollHeight;

});
