// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
// PERHATIKAN: arrayUnion ditambahkan di baris bawah ini
import { getFirestore, collection, doc, setDoc, getDoc, addDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCZMqJkonPZZd8CqvGC91BxmJ_-bUrp_K8",
    authDomain: "perkopian-e7151.firebaseapp.com",
    projectId: "perkopian-e7151",
    storageBucket: "perkopian-e7151.firebasestorage.app",
    messagingSenderId: "1078014660908",
    appId: "1:1078014660908:web:10a94dba61fbe23a499c89",
    measurementId: "G-1MMDP9WW0B"
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
  
  