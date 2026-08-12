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
// Ø¹Ù†Ø§ØµØ± Ø§Ù„ØµÙØ­Ø©
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
// Ù…ØªØºÙŠØ±Ø§Øª Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
// =====================================

let currentUser = null;

let currentUserName = "Ù…Ø³ØªØ®Ø¯Ù…";

let currentUserCountry = "";

let isGuest = false;

let messagesUnsubscribe = null;


// =====================================
// Ø§Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¶ÙŠÙ
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
// Ø¹Ø±Ø¶ Ø§Ø³Ù… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…
// =====================================

function updateUserName() {

    if (!userName) {
        return;
    }

    userName.textContent =
        "ðŸ‘¤ " + currentUserName;
}


// =====================================
// Ø§Ù„ØªØ­Ù‚Ù‚ Ù…Ù† ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        // =================================
        // Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ù…Ø³ØªØ®Ø¯Ù… Firebase
        // =================================

        if (!user) {

            const guestData =
                getGuestData();

            // =============================
            // ÙŠÙˆØ¬Ø¯ Ø¨ÙŠØ§Ù†Ø§Øª Ø¶ÙŠÙ
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
                        "ØªØ¹Ø°Ø± Ø¯Ø®ÙˆÙ„ Ø§Ù„Ø¶ÙŠÙ. ØªØ£ÙƒØ¯ Ø£Ù† Anonymous Authentication Ù…ÙØ¹Ù„Ø© ÙÙŠ Firebase."
                    );

                    return;
                }
            }


            // =============================
            // Ù„Ø§ Ø¶ÙŠÙ ÙˆÙ„Ø§ Ø¹Ø¶Ùˆ
            // =============================

            window.location.href =
                "login.html";

            return;
        }


        // =================================
        // Ø­ÙØ¸ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø­Ø§Ù„ÙŠ
        // =================================

        currentUser =
            user;


        // =================================
        // Ù‡Ù„ Ù‡Ùˆ Ø¶ÙŠÙØŸ
        // =================================

        isGuest =
            user.isAnonymous === true;


        // =================================
        // Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¶ÙŠÙ
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
                "Ø¶ÙŠÙ";

            currentUserCountry =
                guestData.country ||
                "";

        } else {

            // =================================
            // Ø¹Ø¶Ùˆ Ù…Ø³Ø¬Ù„
            // =================================

            try {

                const userRef =
                    doc(
                        db,
                        "users",
                        user.uid
                    );

                const userSnap =
                    await getDoc(
                        userRef
                    );

                if (
                    userSnap.exists()
                ) {

                    const userData =
                        userSnap.data();

                    currentUserName =
                        userData.name ||
                        user.displayName ||
                        "Ù…Ø³ØªØ®Ø¯Ù…";

                    currentUserCountry =
                        userData.country ||
                        "";

                } else {

                    currentUserName =
                        user.displayName ||
                        "Ù…Ø³ØªØ®Ø¯Ù…";

                }

            } catch (error) {

                console.error(
                    "Load user profile error:",
                    error
                );

                currentUserName =
                    user.displayName ||
                    "Ù…Ø³ØªØ®Ø¯Ù…";

            }

        }


        // =================================
        // Ø¹Ø±Ø¶ Ø§Ù„Ø§Ø³Ù…
        // =================================

        updateUserName();


        // =================================
        // ØªØ´ØºÙŠÙ„ Ø§Ù„Ø´Ø§Øª
        // =================================

        startChat();

    }
);


// =====================================
// ØªØ´ØºÙŠÙ„ Ø§Ù„Ø´Ø§Øª
// =====================================

function startChat() {

    loadMessages();

}


// =====================================
// ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬
// =====================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await signOut(auth);


                // =========================
                // Ù„Ùˆ Ø¶ÙŠÙ
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
                    "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬."
                );

            }

        }
    );

}


// =====================================
// Ø²Ø± Ø§Ù„ØµÙˆØ±
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
// Ø²Ø± Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø³Ø§Ù„Ø©
// =====================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


// =====================================
// Enter Ù„Ù„Ø¥Ø±Ø³Ø§Ù„
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
// Ø¥Ø±Ø³Ø§Ù„ Ø±Ø³Ø§Ù„Ø© Ù†ØµÙŠØ©
// =====================================

async function sendMessage() {

    if (!currentUser) {

        alert(
            "Ø¬Ø§Ø±Ù ØªØ¬Ù‡ÙŠØ² Ø§Ù„Ø­Ø³Ø§Ø¨ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰."
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
            "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø³Ø§Ù„Ø©."
        );

    } finally {

        if (sendBtn) {
            sendBtn.disabled = false;
        }

    }

}


// =====================================
// Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±
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
            "Ø¬Ø§Ø±Ù ØªØ¬Ù‡ÙŠØ² Ø§Ù„Ø­Ø³Ø§Ø¨ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰."
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
    // Ø§Ù„ØªØ£ÙƒØ¯ Ø£Ù†Ù‡Ø§ ØµÙˆØ±Ø©
    // =================================

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Ù…Ù† ÙØ¶Ù„Ùƒ Ø§Ø®ØªØ± ØµÙˆØ±Ø© ÙÙ‚Ø·."
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
            "ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©."
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
// Ø²Ø± Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø³Ø§Ù„Ø©
// =====================================

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}


// =====================================
// Enter Ù„Ù„Ø¥Ø±Ø³Ø§Ù„
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
// Ø¥Ø±Ø³Ø§Ù„ Ø±Ø³Ø§Ù„Ø© Ù†ØµÙŠØ©
// =====================================

async function sendMessage() {

    if (!currentUser) {

        alert(
            "Ø¬Ø§Ø±Ù ØªØ¬Ù‡ÙŠØ² Ø§Ù„Ø­Ø³Ø§Ø¨ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰."
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
            "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ø±Ø³Ø§Ù„ Ø§Ù„Ø±Ø³Ø§Ù„Ø©."
        );

    } finally {

        if (sendBtn) {
            sendBtn.disabled = false;
        }

    }

}


// =====================================
// Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±
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
            "Ø¬Ø§Ø±Ù ØªØ¬Ù‡ÙŠØ² Ø§Ù„Ø­Ø³Ø§Ø¨ØŒ Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰."
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
    // Ø§Ù„ØªØ£ÙƒØ¯ Ø£Ù†Ù‡Ø§ ØµÙˆØ±Ø©
    // =================================

    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Ù…Ù† ÙØ¶Ù„Ùƒ Ø§Ø®ØªØ± ØµÙˆØ±Ø© ÙÙ‚Ø·."
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
            "ÙØ´Ù„ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©."
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
// ØªØ­Ù…ÙŠÙ„ Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ø¹Ø§Ù…
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
                        // ØªØ­Ø¯ÙŠØ¯ Ø±Ø³Ø§Ù„ØªÙŠ
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
                        // Ø§Ø³Ù… Ø§Ù„Ù…Ø±Ø³Ù„
                        // =========================

                        const sender =
                            document.createElement(
                                "div"
                            );


                        sender.className =
                            "sender";


                        sender.textContent =
                            data.user ||
                            "Ù…Ø³ØªØ®Ø¯Ù…";


                        // =========================
                        // Ø§Ù„Ø¶ØºØ· Ø¹Ù„Ù‰ Ø§Ø³Ù… Ø§Ù„Ø´Ø®Øµ
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
                                "ÙØªØ­ Ù…Ø­Ø§Ø¯Ø«Ø© Ø®Ø§ØµØ©";


                            sender.addEventListener(
                                "click",
                                () => {

                                    openPrivateChat(
                                        data.uid,
                                        data.user ||
                                        "Ù…Ø³ØªØ®Ø¯Ù…"
                                    );

                                }
                            );

                        }


                        box.appendChild(
                            sender
                        );


                        // =========================
                        // Ø±Ø³Ø§Ù„Ø© Ù†ØµÙŠØ©
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
                        // ØµÙˆØ±Ø©
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
                                "ØµÙˆØ±Ø©";


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
                    "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„."
                );

            }
        );

              }
// =====================================
// ØªÙƒÙ…Ù„Ø© ØªØ­Ù…ÙŠÙ„ Ø±Ø³Ø§Ø¦Ù„ Ø§Ù„Ø¹Ø§Ù…
// =====================================

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
        // ØªØ­Ø¯ÙŠØ¯ Ø±Ø³Ø§Ù„ØªÙŠ
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
        // Ø§Ø³Ù… Ø§Ù„Ù…Ø±Ø³Ù„
        // =========================

        const sender =
            document.createElement(
                "div"
            );


        sender.className =
            "sender";


        sender.textContent =
            data.user ||
            "Ù…Ø³ØªØ®Ø¯Ù…";


        // =========================
        // Ø§Ù„Ø¶ØºØ· Ø¹Ù„Ù‰ Ø§Ø³Ù… Ø§Ù„Ø´Ø®Øµ
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
                "ÙØªØ­ Ù…Ø­Ø§Ø¯Ø«Ø© Ø®Ø§ØµØ©";


            sender.addEventListener(
                "click",
                () => {

                    openPrivateChat(
                        data.uid,
                        data.user ||
                        "Ù…Ø³ØªØ®Ø¯Ù…"
                    );

                }
            );

        }


        box.appendChild(
            sender
        );


        // =========================
        // Ø±Ø³Ø§Ù„Ø© Ù†ØµÙŠØ©
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
        // ØµÙˆØ±Ø©
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
                "ØµÙˆØ±Ø©";


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


// =====================================
// Ø®Ø·Ø£ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„
// =====================================

},
(error) => {

    console.error(
        "Messages listener error:",
        error
    );

    alert(
        "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ ØªØ­Ù…ÙŠÙ„ Ø§Ù„Ø±Ø³Ø§Ø¦Ù„."
    );

}

);

}


// =====================================
// ÙØªØ­ Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø© Ø§Ù„Ø®Ø§ØµØ©
// =====================================

window.openPrivateChat =
    function(uid, name) {

        if (!currentUser) {
            return;
        }


        // =================================
        // Ø§Ù„Ø¶ÙŠÙ Ù…Ø³Ù…ÙˆØ­ Ù„Ù‡ Ø¨Ø§Ù„Ø®Ø§Øµ
        // =================================

        // Ù„Ø§ ÙŠÙˆØ¬Ø¯ Ø£ÙŠ Ø´Ø±Ø· ÙŠÙ…Ù†Ø¹ Ø§Ù„Ø¶ÙŠÙ Ù‡Ù†Ø§


        // ================================
        // Ù…Ù†Ø¹ ÙØªØ­ Ù…Ø­Ø§Ø¯Ø«Ø© Ù…Ø¹ Ø§Ù„Ù†ÙØ³
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
                name || "Ù…Ø³ØªØ®Ø¯Ù…"
            );

    };


// =====================================
// Ù‚Ø§Ø¦Ù…Ø© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ÙŠÙ†
// =====================================

if (usersBtn) {

    usersBtn.addEventListener(
        "click",
        () => {

            // ==========================
            // Ø§Ù„Ø¹Ø¶Ùˆ ÙˆØ§Ù„Ø¶ÙŠÙ Ù…Ø³Ù…ÙˆØ­ Ù„Ù‡Ù…
            // ==========================

            window.location.href =
                "users.html";

        }
    );

}


// =====================================
// Ø§Ù„Ù†Ø²ÙˆÙ„ Ù„Ø¢Ø®Ø± Ø±Ø³Ø§Ù„Ø©
// =====================================

function scrollBottom() {

    if (!messages) {
        return;
    }


    messages.scrollTop =
        messages.scrollHeight;

}


// =====================================
// ØªÙ†Ø¸ÙŠÙ Listener
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
// Ù†Ù‡Ø§ÙŠØ© Ø§Ù„Ù…Ù„Ù
// =====================================

console.log(
    "âœ… Cafe Arab Chat - Guest + Registered Users"
);
