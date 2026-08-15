// =====================================
// Cafe Arab Admin
// لوحة الإدارة
// =====================================

import { auth, db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// =====================================
// UID المدير
// =====================================
// هنحط UID حساب المدير هنا لاحقًا
// مؤقتًا سيظهر لك تنبيه لو لم يتم وضعه
// =====================================

const ADMIN_UIDS = [
  "dokedbcqRSgR4ZAbI50IAgm8St32"
];

// =====================================
// عناصر الصفحة
// =====================================

const adminArea =
    document.getElementById("adminArea");

const adminMessage =
    document.getElementById("adminMessage");

const usersTable =
    document.getElementById("usersTable");

const usersCount =
    document.getElementById("usersCount");

const onlineCount =
    document.getElementById("onlineCount");

const messagesCount =
    document.getElementById("messagesCount");

const notificationsCount =
    document.getElementById("notificationsCount");

const userSearch =
    document.getElementById("userSearch");

const refreshBtn =
    document.getElementById("refreshBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const loading =
    document.getElementById("loading");

// =====================================
// متغيرات
// =====================================

let allUsers = [];

// =====================================
// رسالة الإدارة
// =====================================

function showMessage(
    text,
    type = "warning"
) {

    if (!adminMessage) return;

    adminMessage.textContent =
        text;

    adminMessage.style.display =
        "block";

    if (type === "error") {

        adminMessage.style.background =
            "#f8d7da";

        adminMessage.style.color =
            "#842029";

    } else {

        adminMessage.style.background =
            "#fff3cd";

        adminMessage.style.color =
            "#664d03";

    }

}

// =====================================
// التحقق من المدير
// =====================================

function isAdmin(user) {

    if (!user) return false;

    return ADMIN_UIDS.includes(
        user.uid
    );

}

// =====================================
// تسجيل الدخول
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;

        }

        // =================================
        // التحقق من صلاحية المدير
        // =================================

        if (!isAdmin(user)) {

            showMessage(
                "⛔ ليس لديك صلاحية الدخول إلى لوحة الإدارة.",
                "error"
            );

            setTimeout(
                () => {

                    window.location.href =
                        "index.html";

                },
                1500
            );

            return;

        }

        // =================================
        // المدير مسموح له
        // =================================

        if (adminMessage) {

            adminMessage.style.display =
                "none";

        }

        if (adminArea) {

            adminArea.style.display =
                "block";

        }

        await loadDashboard();

    }
);

// =====================================
// تحميل لوحة الإدارة
// =====================================

async function loadDashboard() {

    try {

        await loadUsers();

        await loadMessagesCount();

        await loadNotificationsCount();

    } catch (error) {

        console.error(
            "Admin Dashboard Error:",
            error
        );

        showMessage(
            "حدث خطأ أثناء تحميل بيانات لوحة الإدارة.",
            "error"
        );

    }

}

// =====================================
// تحميل المستخدمين
// =====================================

async function loadUsers() {

    if (loading) {

        loading.textContent =
            "جاري تحميل المستخدمين...";

    }

    const snapshot =
        await getDocs(
            collection(
                db,
                "users"
            )
        );

    allUsers = [];

    snapshot.forEach(
        (userDoc) => {

            allUsers.push({

                id:
                    userDoc.id,

                ...userDoc.data()

            });

        }
    );

    // =================================
    // عدد المستخدمين
    // =================================

    if (usersCount) {

        usersCount.textContent =
            allUsers.length;

    }

    // =================================
    // عدد المتصلين
    // =================================

    if (onlineCount) {

        onlineCount.textContent =
            allUsers.filter(
                user =>
                    user.online === true
            ).length;

    }

    renderUsers();

    if (loading) {

        loading.textContent =
            allUsers.length
                ? ""
                : "لا يوجد مستخدمون حاليًا.";

    }

}

// =====================================
// عرض المستخدمين
// =====================================

function renderUsers() {

    if (!users
        
