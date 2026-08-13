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

const videoBtn =
    document.getElementById("videoBtn");

const videoInput =
    document.getElementById("videoInput");

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

        // =================================
        // لا يوجد مستخدم Firebase
        // =================================

        if (!user) {

            const guestData =
                getGuestData();

            // =============================
            // يوجد بيانات ضيف
            // =============================

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


            // =============================
            // لا ضيف ولا عضو
            // =============================

            window.location.href =
                "login.html";

            return;
        }


        // =================================
        // حفظ المستخدم الحالي
        // =================================

        currentUser =
            user;


        // =================================
        // هل هو ضيف؟
        // =================================

        isGuest =
            user.isAnonymous === true;


        // =================================
        // بيانات الضيف
        // =================================

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

    try {

        const userDoc = await getDoc(
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
            "Error loading user profile:",
            error
        );

        currentUserName =
            user.displayName ||
            "مستخدم";

    }

        }
            

        // =================================
        // عرض الاسم
        // =================================

        updateUserName();


        // =================================
        // تشغيل الشات
        // =================================

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


                // =========================
                // لو ضيف
                // =========================

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
// زر الفيديو
// =====================================

if (videoBtn) {

    videoBtn.addEventListener(
        "click",
        () => {

            if (videoInput) {
                videoInput.click();
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


    // =================================
    // التأكد أنها صورة
    // =================================

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
            (snapshot) => {

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


                        // =========================
                        // تحديد رسالتي
                        // =========================

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


                        // =========================
                        // اسم المرسل
                        // =========================

                        const sender =
                            document.createElement(
                                "div"
                            );


                        sender.className =
                            "sender";


                        sender.textContent =
                            data.user ||
                            "مستخدم";


                        // =========================
                        // الضغط على اسم الشخص
                        // =========================

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


                        // =========================
                        // رسالة نصية
                        // =========================

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


                        // =========================
                        // صورة
                        // =========================

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


        // =================================
        // الضيف مسموح له بالخاص
        // =================================

        // لا يوجد أي شرط يمنع الضيف هنا


        // ================================
        // منع فتح محادثة مع النفس
        // ================================

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

            // ==========================
            // العضو والضيف مسموح لهم
            // ==========================

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
