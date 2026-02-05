import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBDRJEuF3j9PYuVleeAX-DZQzsl0VbWGag",
  authDomain: "seckerala-cfbb0.firebaseapp.com",
  projectId: "seckerala-cfbb0",
  storageBucket: "seckerala-cfbb0.firebasestorage.app",
  messagingSenderId: "224811359622",
  appId: "1:224811359622:web:51a1b5965d8195292fe007"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);