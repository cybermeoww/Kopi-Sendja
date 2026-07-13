// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// PERHATIKAN: arrayUnion ditambahkan di baris bawah ini
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMZQxV-xPgwFMY91stnnNu_sjkxzIPmug",
  authDomain: "kriyanusantara-6fbf0.firebaseapp.com",
  projectId: "kriyanusantara-6fbf0",
  storageBucket: "kriyanusantara-6fbf0.firebasestorage.app",
  messagingSenderId: "333235907007",
  appId: "1:333235907007:web:29393d6e17925a0546190a",
  measurementId: "G-0XFM5F7YQV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export semua fungsi agar bisa dipakai di file lain
export { 
    auth, db, 
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification,
    collection, doc, setDoc, getDoc, addDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, 
    arrayUnion // <--- INI KUNCI PERBAIKANNYA
};
  
  