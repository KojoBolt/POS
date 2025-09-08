// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDfAaGeWrQwFJIyQ7DtWrACpMrvk0gpnFI",
  authDomain: "sauber-aab03.firebaseapp.com",
  projectId: "sauber-aab03",
  storageBucket: "sauber-aab03.firebasestorage.app",
  messagingSenderId: "249259340408",
  appId: "1:249259340408:web:150ef71df80b0c5493738d",
  measurementId: "G-HCQ2433KY4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export auth and db
export const auth = getAuth(app);
export const db = getFirestore(app);