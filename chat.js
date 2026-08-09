// =====================================
// Cafe Arab Chat V3
// Registered Users + Guest Users
// Firebase Anonymous Auth for Guests
// Cloudinary Images
// Private Chat Support
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
// بيانات الضيف من sessionStorage
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
            "Guest Data Error:",
            error
        );

        return null;

    }

}


// =====================================
// عرض اسم المستخدم
// =====================================

function updateUserName() {

    if (!userName) return;

    if (isGuest) {

        userName.textContent =
            "👤 " + currentUserName;

        return;

    }

    userName.textContent =
        "👤 " + currentUserName;

}


// =====================================
// جلب بيانات المستخدم المسجل
// =====================================

async function loadRegisteredUserData(
    uid,
    firebaseUser
) {

    currentUserName =
        firebaseUser.displayName ||
        firebaseUser.email ||
        "مستخدم";

    try {

        const userRef =
            doc(
                db,
                "users",
                uid
            );

        const userSnap =
            await getDoc(
                userRef
            );

        if (userSnap.exists()) {

            const data =
                userSnap.data();

            currentUserName =
                data.name ||
                data.username ||
                firebaseUser.displayName ||
                firebaseUser.email ||
                "مستخدم";

            currentUserCountry =
                data.country ||
                "";

        }

    } catch (error) {

        console.error(
            "Load User Data Error:",
            error
        );

    }

}


// =====================================
// التحقق من المستخدم
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        // =================================
        // لو مفيش مستخدم
        // =================================

        if (!user) {

            const guestData =
                getGuestData();

            // =============================
            // يوجد ضيف
            // =============================

            if (guestData) {

                try {

                    console.log(
                        "👤 Guest detected - signing in anonymously..."
                    );

                    await signInAnonymously(
                        auth
                    );

                    return;

                } catch (error) {

                    console.error(
                        "Anonymous Login Error:",
                        error
                    );

                    alert(
                        "❌ تعذر دخول الضيف.\n\n" +
                        "تأكد أن Anonymous Authentication مفعلة في Firebase."
                    );

                    return;

                }

            }

            // =============================
            // لا يوجد ضيف ولا عضو
            // =============================

            location.href =
                "login.html";

            return;

        }


        // =================================
        // عندنا مستخدم Firebase
        // =================================

        currentUser =
            user;


        // =================================
        // تحديد هل هو ضيف
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

                // مستخدم Anonymous بدون بيانات ضيف
                // نخرجه من الشات

                try {

                    await signOut(auth);

                } catch (error) {

                    console.error(error);

                }

                location.href =
                    "login.html";

                return;

            }


            currentUserName =
                guestData.name ||
                "ضيف";

            currentUserCountry =
                guestData.country ||
                "";

            updateUserName();

            startChat();

            return;

        }


        // =================================
        // عضو مسجل
        // =================================

        await loadRegisteredUserData(
            user.uid,
            user
        );

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

                // =========================
                // لو كان ضيف
                // =========================

                if (isGuest) {

                    sessionStorage.removeItem(
                        "cafeArabGuest"
                    );

                }

                location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Logout Error:",
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
// زر إرسال
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


    if (!messageInput) return;


    const text =
        messageInput.value.trim();


    if (text === "") {

        return;

    }


    try {

        if (sendBtn) {

            sendBtn.disabled =
                true;

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


    } catch (err) {

        console.error(
            "Send Message Error:",
            err
        );

        alert(
            "حدث خطأ أثناء إرسال الرسالة."
        );

    } finally {

        if (sendBtn) {

            sendBtn.disabled =
                false;

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
    // التأكد من أنها صورة
    // =================================

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "الرجاء اختيار صورة فقط."
        );

        imageInput.value =
            "";

        return;

    }


    try {

        if (imageBtn) {

            imageBtn.disabled =
                true;

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
                "Cloudinary upload failed: " +
                response.status
            );

        }


        const data =
            await response.json();


        if (!data.secure_url) {

            throw new Error(
                "لم يتم الحصول على رابط الصورة."
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


    } catch (err) {

        console.error(
            "Upload Image Error:",
            err
        );

        alert(
            "فشل رفع الصورة."
        );

    } finally {

        if (imageBtn) {

            imageBtn.disabled =
                false;

        }

        if (imageInput) {

            imageInput.value =
                "";

        }

    }

}


// =====================================
// تحميل الرسائل
// =====================================

function loadMessages() {

    if (!messages) {

        console.error(
            "Messages element not found."
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


    // =================================
    // إلغاء Listener قديم
    // =================================

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


                        // =================================
                        // تحديد رسالتي
                        // =================================

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


                        // =================================
                        // اسم المرسل
                        // =================================

                        const sender =
                            document.createElement(
                                "div"
                            );


                        sender.className =
                            "sender";


                        sender.textContent =
                            data.user ||
                            "مستخدم";


                        // =================================
                        // جعل اسم العضو المسجل قابل للضغط
                        // =================================

                        if (
                            !data.isGuest &&
                            data.uid &&
                            currentUser &&
                            !isGuest &&
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


                        // =================================
                        // رسالة نصية
                        // =================================

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


                        // =================================
                        // صورة
                        // =================================

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


                // =================================
                // النزول لآخر رسالة
                // =================================

                setTimeout(
                    scrollBottom,
                    100
                );

            },

            (error) => {

                console.error(
                    "Messages Listener Error:",
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

        // ==============================
        // لا يوجد مستخدم
        // ==============================

        if (!currentUser) {

            return;

        }


        // ==============================
        // الضيف لا يفتح Private Chat
        // ==============================

        if (isGuest) {

            alert(
                "👤 المحادثات الخاصة متاحة للأعضاء المسجلين فقط."
            );

            return;

        }


        // ==============================
        // لا يمكن فتح محادثة مع نفسك
        // ==============================

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
            encodeURIComponent(name);

    };


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
// زر المستخدمين
// =====================================

if (usersBtn) {

    usersBtn.addEventListener(
        "click",
        () => {

            // ==========================
            // الضيف لا يحتاج users
            // ==========================

            if (isGuest) {

                alert(
                    "👤 قائمة الأعضاء متاحة للمستخدمين المسجلين فقط."
                );

                return;

            }


            window.location.href =
                "users.html";

        }
    );

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
    "✅ Cafe Arab Chat V3 Loaded"
); 
