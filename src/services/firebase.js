import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyB5FsixZ8GEkKDueEcYWZCoX5RcHKEOXPM",
    authDomain: "krissype-f4eb6.firebaseapp.com",
    projectId: "krissype-f4eb6",
    storageBucket: "krissype-f4eb6.appspot.com",
    //storageBucket: "krissype-f4eb6.firebasestorage.app",
    messagingSenderId: "899868246190",
    appId: "1:899868246190:web:7ed3cbbfdd336d1fb22d3f",
    measurementId: "G-EP4XW1MKP4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };