// ==========================
// إرسال رسالة نصية
// ==========================

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {

    const text = messageInput.value.trim();

    if (!text) return;

    try {

        await addDoc(

            collection(
                db,
                "privateChats",
                getChatId(),
                "messages"
            ),

            {
                sender: currentUser.uid,
                receiver: otherUid,
                user: currentUser.email,
                type: "text",
                text: text,
                createdAt: serverTimestamp(),
                likes: 0
            }

        );

        messageInput.value = "";

    } catch (err) {

        console.error(err);

    }// ==========================
// رفع صورة إلى Cloudinary
// ==========================

imageBtn.addEventListener("click", () => {

    imageInput.click();

});

imageInput.addEventListener("change", async () => {

    if (!imageInput.files.length) return;

    const file = imageInput.files[0];

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "ml_default");

    try {

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/vqwksojr/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        await addDoc(

            collection(
                db,
                "privateChats",
                getChatId(),
                "messages"
            ),

            {
                sender: currentUser.uid,
                receiver: otherUid,
                user: currentUser.email,
                type: "image",
                image: data.secure_url,
                createdAt: serverTimestamp(),
                likes: 0
            }

        );

        imageInput.value = "";

    } catch (err) {

        console.error(err);

        alert("فشل رفع الصورة");

    }

});
    

}
// ==========================
// تحميل الرسائل الخاصة
// ==========================

function loadPrivateMessages() {

    const q = query(

        collection(
            db,
            "privateChats",
            getChatId(),
            "messages"
        ),

        orderBy("createdAt", "asc")

    );

    onSnapshot(q, (snapshot) => {

        messages.innerHTML = "";

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            const box = document.createElement("div");

            box.className = "message";

            if (data.sender === currentUser.uid) {

                box.classList.add("me");

            } else {

                box.classList.add("other");

            }

            if (data.type === "text") {

                box.innerHTML = `
                    <div class="sender">${data.user}</div>
                    <div class="text">${data.text}</div>
                `;

            } else if (data.type === "image") {

                box.innerHTML = `
                    <div class="sender">${data.user}</div>

                    <img
                        src="${data.image}"
                        style="
                            max-width:220px;
                            border-radius:12px;
                            cursor:pointer;
                        "
                        onclick="window.open('${data.image}','_blank')"
                    >
                `;

            }

            messages.appendChild(box);

        });

        messages.scrollTop = messages.scrollHeight;

    });

                }
// ==========================
// تشغيل المحادثة
// ==========================

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "login.html";
        return;

    }

    currentUser = user;

    if (!otherUid) {

        alert("لم يتم تحديد المستخدم.");

        window.location.href = "users.html";

        return;

    }

    loadPrivateMessages();

});
