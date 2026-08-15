// =====================================
// Cafe Arab Chat V3
// Registered Users + Guest Users
// Admin Warning + Ban
// Notifications Receiver
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
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";


// =====================================
// UID المدير
// =====================================

const ADMIN_UIDS = [
    "dokedbcqRSgR4ZAbI50IAgm8St32"
];


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

let notificationsUnsubscribe = null;


// =====================================
// التحقق هل المستخدم أدمن
// =====================================

function isAdmin() {

    if (!currentUser) {
        return false;
    }

    return ADMIN_UIDS.includes(
        currentUser.uid
    );

}


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

                    await signOut(
                        auth
                    );

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


            // =================================
            // تسجيل الضيف في لوحة الإدارة
            // =================================

            try {

                await setDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    ),
                    {

                        name:
                            guestData.name ||
                            "ضيف",

                        country:
                            guestData.country ||
                            "",

                        isGuest:
                            true,

                        online:
                            true,

                        lastSeen:
                            serverTimestamp()

                    },
                    {
                        merge: true
                    }
                );

            } catch (error) {

                console.error(
                    "Guest Profile Save Error:",
                    error
                );

            }


        } else {

            // =================================
            // عضو مسجل
            // =================================

            try {

                const userDoc =
                    await getDoc(
                        doc(
                            db,
                            "users",
                            user.uid
                        )
                    );


                if (userDoc.exists()) {

                    const userData =
                        userDoc.data();


                    // =============================
                    // التحقق من الحظر
                    // =============================

                    if (
                        userData.banned === true
                    ) {

                        alert(
                            "🚫 حسابك محظور.\n\n" +
                            "لا يمكنك استخدام الموقع حاليًا."
                        );


                        await signOut(
                            auth
                        );


                        window.location.href =
                            "login.html";

                        return;

                    }


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


        // =================================
        // تشغيل استقبال الإشعارات
        // =================================

        startNotifications();

    }
);


// =====================================
// تشغيل الشات
// =====================================

function startChat() {

    loadMessages();

}


// =====================================
// استقبال إشعارات الإدارة
// =====================================

function startNotifications() {

    if (!currentUser) {
        return;
    }


    // =================================
    // إلغاء Listener قديم
    // =================================

    if (notificationsUnsubscribe) {

        notificationsUnsubscribe();

        notificationsUnsubscribe =
            null;

    }


    const notificationsRef =
        collection(
            db,
            "notifications",
            currentUser.uid,
            "items"
        );


    const notificationsQuery =
        query(
            notificationsRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );


    notificationsUnsubscribe =
        onSnapshot(
            notificationsQuery,
            (snapshot) => {

                snapshot.docChanges()
                    .forEach(
                        (change) => {

                            // =========================
                            // نهتم بالإشعار الجديد فقط
                            // =========================

                            if (
                                change.type !==
                                "added"
                            ) {

                                return;

                            }


                            const data =
                                change.doc.data();


                            // =========================
                            // لا نكرر إشعار مقروء
                            // =========================

                            if (
                                data.read === true
                            ) {

                                return;

                            }


                            // =========================
                            // عرض الإشعار
                            // =========================

                            showNotification(
                                data
                            );

                        }
                    );

            },

            (error) => {

                console.error(
                    "Notifications Listener Error:",
                    error
                );

            }
        );

}


// =====================================
// عرض الإشعار للمستخدم
// =====================================

function showNotification(data) {

    const title =
        data.title ||
        "🔔 إشعار جديد";


    const message =
        data.message ||
        "لديك إشعار جديد من إدارة Cafe Arab.";


    // =================================
    // لو حظر
    // =================================

    if (
        data.type ===
        "admin_ban"
    ) {

        alert(
            "🚫 " +
            title +
            "\n\n" +
            message
        );


        // =================================
        // تسجيل الخروج بعد الحظر
        // =================================

        if (
            currentUser &&
            data.type === "admin_ban"
        ) {

            setTimeout(
                async () => {

                    try {

                        await signOut(
                            auth
                        );

                        if (isGuest) {

                            sessionStorage.removeItem(
                                "cafeArabGuest"
                            );

                        }

                        window.location.href =
                            "login.html";

                    } catch (error) {

                        console.error(
                            "Ban Logout Error:",
                            error
                        );

                    }

                },
                1000
            );

        }

        return;

    }


    // =================================
    // تنبيه عادي من الإدارة
    // =================================

    alert(
        "⚠️ " +
        title +
        "\n\n" +
        message
    );

}


// =====================================
// تسجيل الخروج
// =====================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(
                    auth
                );


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
                        // الضغط على اسم المستخدم
                        // =================================

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


                            if (isAdmin()) {

                                sender.title =
                                    "خيارات الإدارة";


                                sender.addEventListener(
                                    "click",
                                    (event) => {

                                        event.stopPropagation();


                                        showAdminMenu(
                                            event,
                                            data.uid,
                                            data.user ||
                                            "مستخدم"
                                        );

                                    }
                                );


                            } else {

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
// قائمة إدارة الأدمن
// =====================================

function showAdminMenu(
    event,
    uid,
    name
) {

    const oldMenu =
        document.getElementById(
            "adminUserMenu"
        );

    if (oldMenu) {

        oldMenu.remove();

    }


    const menu =
        document.createElement(
            "div"
        );


    menu.id =
        "adminUserMenu";


    menu.style.position =
        "fixed";

    menu.style.zIndex =
        "99999";

    menu.style.background =
        "#fff";

    menu.style.border =
        "1px solid #ddd";

    menu.style.borderRadius =
        "12px";

    menu.style.padding =
        "8px";

    menu.style.minWidth =
        "180px";

    menu.style.boxShadow =
        "0 5px 25px rgba(0,0,0,.20)";


    const title =
        document.createElement(
            "div"
        );


    title.textContent =
        "👤 " + name;


    title.style.fontWeight =
        "bold";

    title.style.padding =
        "8px";

    title.style.borderBottom =
        "1px solid #eee";

    title.style.marginBottom =
        "5px";


    menu.appendChild(
        title
    );


    // =================================
    // زر التنبيه
    // =================================

    const warningBtn =
        document.createElement(
            "button"
        );


    warningBtn.type =
        "button";


    warningBtn.textContent =
        "⚠️ إرسال تنبيه";


    warningBtn.style.display =
        "block";

    warningBtn.style.width =
        "100%";

    warningBtn.style.background =
        "#fff3cd";

    warningBtn.style.color =
        "#664d03";

    warningBtn.style.marginBottom =
        "5px";


    warningBtn.addEventListener(
        "click",
        async () => {

            menu.remove();

            await sendAdminWarning(
                uid,
                name
            );

        }
    );


    menu.appendChild(
        warningBtn
    );


    // =================================
    // زر الحظر
    // =================================

    const banBtn =
        document.createElement(
            "button"
        );


    banBtn.type =
        "button";


    banBtn.textContent =
        "🚫 حظر المستخدم";


    banBtn.style.display =
        "block";

    banBtn.style.width =
        "100%";

    banBtn.style.background =
        "#b42318";

    banBtn.style.color =
        "#fff";


    banBtn.addEventListener(
        "click",
        async () => {

            menu.remove();

            await banUser(
                uid,
                name
            );

        }
    );


    menu.appendChild(
        banBtn
    );


    // =================================
    // إلغاء
    // =================================

    const cancelBtn =
        document.createElement(
            "button"
        );


    cancelBtn.type =
        "button";


    cancelBtn.textContent =
        "❌ إلغاء";


    cancelBtn.style.display =
        "block";

    cancelBtn.style.width =
        "100%";

    cancelBtn.style.background =
        "#eee";

    cancelBtn.style.color =
        "#333";

    cancelBtn.style.marginTop =
        "5px";


    cancelBtn.addEventListener(
        "click",
        () => {

            menu.remove();

        }
    );


    menu.appendChild(
        cancelBtn
    );


    document.body.appendChild(
        menu
    );


    let left =
        event.clientX;

    let top =
        event.clientY;


    const menuWidth =
        180;

    const menuHeight =
        150;


    if (
        left + menuWidth >
        window.innerWidth
    ) {

        left =
            window.innerWidth -
            menuWidth -
            10;

    }


    if (
        top + menuHeight >
        window.innerHeight
    ) {

        top =
            window.innerHeight -
            menuHeight -
            10;

    }


    menu.style.left =
        Math.max(
            10,
            left
        ) + "px";


    menu.style.top =
        Math.max(
            10,
            top
        ) + "px";


    setTimeout(
        () => {

            document.addEventListener(
                "click",
                function closeMenu(e) {

                    if (
                        menu &&
                        !menu.contains(e.target)
                    ) {

                        menu.remove();

                        document.removeEventListener(
                            "click",
                            closeMenu
                        );

                    }

                }
            );

        },
        0
    );

}


// =====================================
// إرسال تنبيه للمستخدم
// =====================================

async function sendAdminWarning(
    uid,
    name
) {

    try {

        await addDoc(
            collection(
                db,
                "notifications",
                uid,
                "items"
            ),
            {

                type:
                    "admin_warning",

                title:
                    "⚠️ تنبيه من الإدارة",

                message:
                    "تم إرسال تنبيه لك من إدارة Cafe Arab.",

                fromAdmin:
                    true,

                read:
                    false,

                createdAt:
                    serverTimestamp()

            }
        );


        alert(
            "⚠️ تم إرسال تنبيه إلى " +
            name
        );


    } catch (error) {

        console.error(
            "Admin Warning Error:",
            error
        );


        alert(
            "❌ تعذر إرسال التنبيه.\n" +
            error.message
        );

    }

}


// =====================================
// حظر المستخدم
// =====================================

async function banUser(
    uid,
    name
) {

    const confirmed =
        confirm(
            "🚫 هل أنت متأكد من حظر:\n\n" +
            name +
            "\n\nلن يستطيع استخدام الموقع بعد الحظر."
        );


    if (!confirmed) {

        return;

    }


    try {

        // =================================
        // تسجيل الحظر
        // =================================

        await setDoc(
            doc(
                db,
                "users",
                uid
            ),
            {

                banned:
                    true,

                bannedAt:
                    serverTimestamp(),

                bannedBy:
                    currentUser.uid,

                isGuest:
                    false

            },
            {
                merge: true
            }
        );


        // =================================
        // إرسال إشعار الحظر
        // =================================

        try {

            await addDoc(
                collection(
                    db,
                    "notifications",
                    uid,
                    "items"
                ),
                {

                    type:
                        "admin_ban",

                    title:
                        "🚫 تم حظرك",

                    message:
                        "تم حظر حسابك من إدارة Cafe Arab.",

                    fromAdmin:
                        true,

                    read:
                        false,

                    createdAt:
                        serverTimestamp()

                }
            );

        } catch (notificationError) {

            console.error(
                "Ban Notification Error:",
                notificationError
            );

        }


        alert(
            "🚫 تم حظر " +
            name +
            " بنجاح."
        );


    } catch (error) {

        console.error(
            "Ban User Error:",
            error
        );


        alert(
            "❌ تعذر حظر المستخدم.\n\n" +
            error.message
        );

    }

}


// =====================================
// فتح المحادثة الخاصة
// =====================================

window.openPrivateChat =
    function(uid, name) {

        if (!currentUser) {

            return;

        }


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
// تنظيف Listeners
// =====================================

window.addEventListener(
    "beforeunload",
    () => {

        if (messagesUnsubscribe) {

            messagesUnsubscribe();

        }


        if (notificationsUnsubscribe) {

            notificationsUnsubscribe();

        }

    }
);


// =====================================
// نهاية الملف
// =====================================

console.log(
    "✅ Cafe Arab Chat - Notifications Receiver Ready"
); 
