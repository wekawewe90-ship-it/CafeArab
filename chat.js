// =====================================
// Cafe Arab Chat V3
// Registered Users + Guest Users
// =====================================

import { auth, db } from "./firebase.js";

import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


// =====================================
// عناصر الصفحة
// =====================================

const messages =
    document.getElementById("messages");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const imageBtn =
    document.getElementById("imageBtn");

const imageInput =
    document.getElementById("imageInput");

const logoutBtn =
    document.getElementById("logoutBtn");

const userName =
    document.getElementById("userName");

const usersBtn =
    document.getElementById("usersBtn");


// =====================================
// متغيرات المستخدم
// =====================================

let currentUser = null;

let currentUserName = "مستخدم";

let currentUserCountry = "";

let isGuest = false;

let messagesUnsubscribe = null;


// =====================================
// الحصول على بيانات الضيف
// =====================================

function getGuestData() {

    try {

        const raw =
            sessionStorage.getItem(
                "cafeArabGuest"
            );

        if (!raw) {
            return null;
        }

        const data =
            JSON.parse(raw);

        if (
            !data ||
            data.isGuest !== true ||
            !data.name
        ) {
            return null;
        }

        return data;

    } catch (error) {

        console.error(
            "Guest data error:",
            error
        );

        return null;
    }
}


// =====================================
// عرض اسم المستخدم
// =====================================

function updateUserName() {

    if (!userName) {
        return;
    }

    userName.textContent =
        "👤 " + currentUserName;
}


// =====================================
// التحقق من تسجيل الدخول
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            const guestData =
                getGuestData();

            if (guestData) {

                try {

                    await signInAnonymously(
                        auth
                    );

                    return;

                } catch (error) {

                    console.error(
                        "Anonymous login error:",
                        error
                    );

                    alert(
                        "تعذر دخول الضيف. تأكد أن Anonymous Authentication مفعلة في Firebase."
                    );

                    return;
                }
            }

            window.location.href =
                "login.html";

            return;
        }


        currentUser =
            user;


        isGuest =
            user.isAnonymous === true;


        if (isGuest) {

            const guestData =
                getGuestData();

            if (!guestData) {

                try {
                    await signOut(auth);
                } catch (error) {
                    console.error(error);
                }

                window.location.href =
                    "login.html";

                return;
            }


            currentUserName =
                guestData.name ||
                "ضيف";

            currentUserCountry =
                guestData.country ||
                "";

        } else {

            // =================================
            // عضو مسجل
            // =================================

            // الاسم الحقيقي محفوظ في users/{uid}.
            // نقرأ name أولاً، ثم username، ثم displayName.

            try {

                const userDoc =
                    await getDoc(
                        doc(db, "users", user.uid)
                    );

                if (userDoc.exists()) {

                    const userData =
                        userDoc.data();

                    currentUserName =
                        userData.name ||
                        userData.username ||
                        user.displayName ||
                        "مستخدم";

                    currentUserCountry =
                        userData.country ||
                        "";

                } else {

                    currentUserName =
                        user.displayName ||
                        "مستخدم";

                }

            } catch (error) {

                console.error(
                    "Error loading registered user data:",
                    error
                );

                currentUserName =
                    user.displayName ||
                    "مستخدم";
            }

        }


        updateUserName();

        startChat();

    }
);
// =====================================
// تشغيل الشات
// =====================================

function startChat() {

    loadMessages();

}


// =====================================
// تسجيل الخروج
// =====================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);


                if (isGuest) {

                    sessionStorage.removeItem(
                        "cafeArabGuest"
                    );

                }


                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "حدث خطأ أثناء تسجيل الخروج."
                );

            }

        }
    );

}


// =====================================
// زر الصور
// =====================================

if (imageBtn) {

    imageBtn.addEventListener(
        "click",
        () => {

            if (imageInput) {
                imageInput.click();
            }

        }
    );

}


// =====================================
// زر إرسال الرسالة
// =====================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


// =====================================
// Enter للإرسال
// =====================================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        (e) => {

            if (
                e.key === "Enter" &&
                !e.shiftKey
            ) {

                e.preventDefault();

                sendMessage();

            }

        }
    );

}


// =====================================
// إرسال رسالة نصية
// =====================================

async function sendMessage() {

    if (!currentUser) {

        alert(
            "جارٍ تجهيز الحساب، حاول مرة أخرى."
        );

        return;
    }


    if (!messageInput) {
        return;
    }


    const text =
        messageInput.value.trim();


    if (!text) {
        return;
    }


    try {

        if (sendBtn) {
            sendBtn.disabled = true;
        }


        await addDoc(
            collection(
                db,
                "messages"
            ),
            {

                uid:
                    currentUser.uid,

                user:
                    currentUserName,

                name:
                    currentUserName,

                country:
                    currentUserCountry,

                isGuest:
                    isGuest,

                type:
                    "text",

                text:
                    text,

                createdAt:
                    serverTimestamp()

            }
        );


        messageInput.value =
            "";

        messageInput.focus();


    } catch (error) {

        console.error(
            "Send message error:",
            error
        );

        alert(
            "حدث خطأ أثناء إرسال الرسالة."
        );

    } finally {

        if (sendBtn) {
            sendBtn.disabled = false;
        }

    }

                }
// =====================================
// رفع الصور
// =====================================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        uploadImage
    );

}


async function uploadImage() {

    if (!currentUser) {

        alert(
            "جارٍ تجهيز الحساب، حاول مرة أخرى."
        );

        return;
    }


    if (
        !imageInput ||
        !imageInput.files.length
    ) {

        return;
    }


    const file =
        imageInput.files[0];


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "من فضلك اختر صورة فقط."
        );

        imageInput.value =
            "";

        return;
    }


    try {

        if (imageBtn) {
            imageBtn.disabled = true;
        }


        const formData =
            new FormData();


        formData.append(
            "file",
            file
        );


        formData.append(
            "upload_preset",
            "ml_default"
        );


        const response =
            await fetch(
                "https://api.cloudinary.com/v1_1/vqwksojr/image/upload",
                {
                    method:
                        "POST",

                    body:
                        formData
                }
            );


        if (!response.ok) {

            throw new Error(
                "Cloudinary upload failed"
            );
        }


        const data =
            await response.json();


        if (!data.secure_url) {

            throw new Error(
                "No secure URL returned"
            );
        }


        await addDoc(
            collection(
                db,
                "messages"
            ),
            {

                uid:
                    currentUser.uid,

                user:
                    currentUserName,

                name:
                    currentUserName,

                country:
                    currentUserCountry,

                isGuest:
                    isGuest,

                type:
                    "image",

                image:
                    data.secure_url,

                createdAt:
                    serverTimestamp()

            }
        );


        imageInput.value =
            "";


    } catch (error) {

        console.error(
            "Upload image error:",
            error
        );

        alert(
            "فشل رفع الصورة."
        );

    } finally {

        if (imageBtn) {
            imageBtn.disabled = false;
        }

        if (imageInput) {
            imageInput.value = "";
        }

    }

}


// =====================================
// كاش أسماء المستخدمين
// =====================================

const senderNameCache = new Map();

async function getSenderName(data) {

    if (data.isGuest === true) {
        return data.user || data.name || "ضيف";
    }


    if (data.name) {
        return data.name;
    }


    if (!data.uid) {
        return data.user || "مستخدم";
    }


    if (senderNameCache.has(data.uid)) {
        return senderNameCache.get(data.uid);
    }


    try {

        const userDoc = await getDoc(
            doc(db, "users", data.uid)
        );


        if (userDoc.exists()) {

            const userData =
                userDoc.data();


            const name =
                userData.name ||
                userData.username ||
                data.user ||
                "مستخدم";


            senderNameCache.set(
                data.uid,
                name
            );


            return name;
        }

    } catch (error) {

        console.error(
            "Error loading sender name:",
            error
        );
    }


    return data.user || "مستخدم";
}


// =====================================
// تحميل رسائل العام
// =====================================

function loadMessages() {

    if (!messages) {

        console.error(
            "Element #messages not found."
        );

        return;
    }


    const q =
        query(
            collection(
                db,
                "messages"
            ),
            orderBy(
                "createdAt",
                "asc"
            )
        );


    if (messagesUnsubscribe) {
        messagesUnsubscribe();
    }


    messagesUnsubscribe =
        onSnapshot(
            q,
            async (snapshot) => {

                messages.innerHTML =
                    "";


                snapshot.forEach(
                    (messageDoc) => {

                        const data =
                            messageDoc.data();


                        const box =
                            document.createElement(
                                "div"
                            );


                        box.className =
                            "message";


                        if (
                            currentUser &&
                            data.uid ===
                            currentUser.uid
                        ) {

                            box.classList.add(
                                "me"
                            );

                        } else {

                            box.classList.add(
                                "other"
                            );

                        }


                        const sender =
                            document.createElement(
                                "div"
                            );


                        sender.className =
                            "sender";


                        sender.textContent =
                            await getSenderName(data);


                        if (
                            data.uid &&
                            currentUser &&
                            data.uid !==
                            currentUser.uid
                        ) {

                            sender.style.cursor =
                                "pointer";

                            sender.style.textDecoration =
                                "underline";

                            sender.title =
                                "فتح محادثة خاصة";


                            sender.addEventListener(
                                "click",
                                () => {

                                    openPrivateChat(
                                        data.uid,
                                        data.user ||
                                        "مستخدم"
                                    );

                                }
                            );

                        }


                        box.appendChild(
                            sender
                        );


                        if (
                            data.type ===
                            "text"
                        ) {

                            const text =
                                document.createElement(
                                    "div"
                                );


                            text.className =
                                "text";


                            text.textContent =
                                data.text ||
                                "";


                            box.appendChild(
                                text
                            );

                        }


                        if (
                            data.type ===
                                "image" &&
                            data.image
                        ) {

                            const img =
                                document.createElement(
                                    "img"
                                );


                            img.src =
                                data.image;


                            img.className =
                                "chatImage";


                            img.alt =
                                "صورة";


                            img.loading =
                                "lazy";


                            img.style.cursor =
                                "pointer";


                            img.addEventListener(
                                "click",
                                () => {

                                    window.open(
                                        data.image,
                                        "_blank"
                                    );

                                }
                            );


                            box.appendChild(
                                img
                            );

                        }


                        messages.appendChild(
                            box
                        );

                    }
                );


                scrollBottom();

            },

            (error) => {

                console.error(
                    "Messages listener error:",
                    error
                );

                alert(
                    "حدث خطأ أثناء تحميل الرسائل."
                );

            }
        );

    }
// =====================================
// فتح المحادثة الخاصة
// =====================================

window.openPrivateChat =
    function(uid, name) {

        if (!currentUser) {
            return;
        }


        // الضيف مسموح له بالخاص


        if (
            uid ===
            currentUser.uid
        ) {

            return;
        }


        window.location.href =
            "private-chat.html?uid=" +
            encodeURIComponent(uid) +
            "&name=" +
            encodeURIComponent(
                name || "مستخدم"
            );

    };


// =====================================
// قائمة المستخدمين
// =====================================

if (usersBtn) {

    usersBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "users.html";

        }
    );

}


// =====================================
// النزول لآخر رسالة
// =====================================

function scrollBottom() {

    if (!messages) {
        return;
    }


    messages.scrollTop =
        messages.scrollHeight;

}


// =====================================
// تنظيف Listener
// =====================================

window.addEventListener(
    "beforeunload",
    () => {

        if (messagesUnsubscribe) {

            messagesUnsubscribe();

        }

    }
);


// =====================================
// نهاية الملف
// =====================================

console.log(
    "✅ Cafe Arab Chat - Guest + Registered Users"
);
