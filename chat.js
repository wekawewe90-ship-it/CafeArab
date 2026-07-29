import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

alert("chat.js loaded");

const input = document.getElementById("messageInput");
const button = document.getElementById("sendBtn");
const box = document.getElementById("messages");

button.onclick = async () => {

  alert("تم الضغط على زر الإرسال");

  const text = input.value.trim();

  if (text === "") {
    alert("اكتب رسالة");
    return;
  }

  try {

    await addDoc(collection(db, "messages"), {
      user: "مستخدم",
      text: text,
      createdAt: serverTimestamp()
    });

    alert("تم إرسال الرسالة");

    input.value = "";

  } catch (e) {

    alert("خطأ: " + e.message);
    console.error(e);

  }

};

const q = query(collection(db, "messages"), orderBy("createdAt"));

onSnapshot(q, (snapshot) => {

  box.innerHTML = "";

  snapshot.forEach((doc) => {

    const data = doc.data();

    box.innerHTML += `
      <div class="msg">
        <b>${data.user}</b><br>
        ${data.text}
      </div>
    `;

  });

});
