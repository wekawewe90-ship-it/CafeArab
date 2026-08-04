import { db, storage, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, ref, uploadBytes, getDownloadURL } from './firebase.js';

const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const sendBtn = document.getElementById('send-btn');

// 1. الاستماع للرسائل في الوقت الفعلي (Real-time)
const q = query(collection(db, "public_messages"), orderBy("timestamp", "asc"));

onSnapshot(q, (snapshot) => {
    chatBox.innerHTML = ''; // تنظيف الشاشة لإعادة الرسم
    snapshot.forEach((doc) => {
        const data = doc.data();
        renderMessage(data);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
});

// 2. دالة إرسال الرسالة
async function sendMessage() {
    const text = messageInput.value.trim();
    const file = fileInput.files[0];

    if (!text && !file) return;

    let mediaUrl = '';

    // تقييد رفع الميديا بالصور فقط للشات العام
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('عفواً، مسموح بإرسال الصور فقط في الشات العام!');
            fileInput.value = '';
            return;
        }

        const storageRef = ref(storage, `public_images/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        mediaUrl = await getDownloadURL(snapshot.ref);
    }

    // حفظ الرسالة في Firestore
    await addDoc(collection(db, "public_messages"), {
        text: text,
        imageUrl: mediaUrl,
        timestamp: serverTimestamp()
    });

    // إعادة تصفير المدخلات
    messageInput.value = '';
    fileInput.value = '';
}

// 3. عرض الرسالة على الشاشة
function renderMessage(data) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message my-message';

    if (data.text) {
        const p = document.createElement('p');
        p.textContent = data.text;
        msgDiv.appendChild(p);
    }

    if (data.imageUrl) {
        const img = document.createElement('img');
        img.src = data.imageUrl;
        img.style.maxWidth = '100%';
        img.style.borderRadius = '8px';
        msgDiv.appendChild(img);
    }

    chatBox.appendChild(msgDiv);
}

// ربط الأزرار والأحداث
if (sendBtn) sendBtn.addEventListener('click', sendMessage);
if (messageInput) {
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}
