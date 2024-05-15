// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "mern-auth-82257.firebaseapp.com",
  projectId: "mern-auth-82257",
  storageBucket: "mern-auth-82257.appspot.com",
  messagingSenderId: "354174433221",
  appId: "1:354174433221:web:cd145a2bf124f207fafdac"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
