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
// تسجيل الدخول والتحقق
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

    try {

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

        // =============================
        // عدد المستخدمين
        // =============================

        if (usersCount) {

            usersCount.textContent =
                allUsers.length;

        }

        // =============================
        // عدد المتصلين
        // =============================

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

    } catch (error) {

        console.error(
            "Load Users Error:",
            error
        );

        if (loading) {

            loading.textContent =
                "حدث خطأ أثناء تحميل المستخدمين.";

        }

        throw error;

    }

}

// =====================================
// عرض المستخدمين
// =====================================

function renderUsers() {

    if (!usersTable) return;

    const search =
        (
            userSearch?.value ||
            ""
        )
        .trim()
        .toLowerCase();

    const filteredUsers =
        allUsers.filter(
            (user) => {

                const name =
                    String(
                        user.name ||
                        user.displayName ||
                        ""
                    )
                    .toLowerCase();

                const username =
                    String(
                        user.username ||
                        ""
                    )
                    .toLowerCase();

                const uid =
                    String(
                        user.id ||
                        ""
                    )
                    .toLowerCase();

                return (
                    !search ||
                    name.includes(search) ||
                    username.includes(search) ||
                    uid.includes(search)
                );

            }
        );

    usersTable.innerHTML =
        "";

    filteredUsers.forEach(
        (user) => {

            const tr =
                document.createElement(
                    "tr"
                );

            const name =
                user.name ||
                user.displayName ||
                "مستخدم";

            const username =
                user.username ||
                "—";

            const country =
                user.country ||
                "—";

            const isOnline =
                user.online === true;

            tr.innerHTML = `

                <td>
                    ${escapeHtml(name)}
                </td>

                <td>
                    ${escapeHtml(username)}
                </td>

                <td>
                    ${escapeHtml(country)}
                </td>

                <td class="${
                    isOnline
                        ? "online"
                        : "offline"
                }">

                    ${
                        isOnline
                            ? "🟢 متصل"
                            : "⚪ غير متصل"
                    }

                </td>

                <td>

                    <div class="uid">
                        ${escapeHtml(user.id)}
                    </div>

                </td>

            `;

            usersTable.appendChild(
                tr
            );

        }
    );

}

// =====================================
// البحث عن المستخدمين
// =====================================

if (userSearch) {

    userSearch.addEventListener(
        "input",
        () => {

            renderUsers();

        }
    );

}

// =====================================
// عداد رسائل الشات العام
// =====================================

async function loadMessagesCount() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "messages"
                )
            );

        if (messagesCount) {

            messagesCount.textContent =
                snapshot.size;

        }

    } catch (error) {

        console.error(
            "Messages Count Error:",
            error
        );

        if (messagesCount) {

            messagesCount.textContent =
                "—";

        }

    }

}

// =====================================
// عداد الإشعارات
// =====================================

async function loadNotificationsCount() {

    try {

        const user =
            auth.currentUser;

        if (!user) return;

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "notifications",
                    user.uid,
                    "items"
                )
            );

        let unread =
            0;

        snapshot.forEach(
            (notificationDoc) => {

                const data =
                    notificationDoc.data();

                if (
                    data.read !== true
                ) {

                    unread++;

                }

            }
        );

        if (notificationsCount) {

            notificationsCount.textContent =
                unread;

        }

    } catch (error) {

        console.error(
            "Notifications Count Error:",
            error
        );

        if (notificationsCount) {

            notificationsCount.textContent =
                "—";

        }

    }

}

// =====================================
// زر تحديث البيانات
// =====================================

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async () => {

            refreshBtn.disabled =
                true;

            try {

                await loadDashboard();

            } catch (error) {

                console.error(
                    "Refresh Error:",
                    error
                );

            } finally {

                refreshBtn.disabled =
                    false;

            }

        }
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

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Admin Logout Error:",
                    error
                );

                showMessage(
                    "حدث خطأ أثناء تسجيل الخروج.",
                    "error"
                );

            }

        }
    );

}

// =====================================
// حماية النصوص من HTML
// =====================================

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}

// =====================================
// نهاية الملف
// =====================================

console.log(
    "✅ admin.js Loaded Successfully"
);
