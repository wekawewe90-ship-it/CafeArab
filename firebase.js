import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// استبدل الحقول دي ببيانات مشروعك من لوحة تحكم Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCc2LiygPNKc5aWd8tRkfP-sB4OnRNfSQ",
    authDomain: "cafearab-c6f0b.firebaseapp.com",
    projectId: "cafearab-c6f0b",
    storageBucket: "cafearab-c6f0b.firebasestorage.app",
    messagingSenderId: "155925331863",
    appId: "1:155925331863:web:10a5f1955ccfdc56fc0ed2
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    serverTimestamp, 
    ref, 
    uploadBytes, 
    getDownloadURL 
};
