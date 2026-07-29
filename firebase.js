// Firebase SDK
const firebaseConfig = {
  apiKey: "AIzaSyCc2LiujPKNiSaMHi6btRkfP-sB4DnRM5Q",
  authDomain: "cafearab-c6f0b.firebaseapp.com",
  projectId: "cafearab-c6f0b",
  storageBucket: "cafearab-c6f0b.firebasestorage.app",
  messagingSenderId: "155925331863",
  appId: "1:155925331863:web:10a5f1959ccfdc56fc0ed2",
  measurementId: "G-Y6MEL4XGVC"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
