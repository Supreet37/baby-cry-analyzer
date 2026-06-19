import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBmSxwA-8_hbeagh8MQ-o-EnT2PR9DfFUs",
  authDomain: "baby-cry-pattern-analyzer.firebaseapp.com",
  projectId: "baby-cry-pattern-analyzer",
  storageBucket: "baby-cry-pattern-analyzer.firebasestorage.app",
  messagingSenderId: "451548812466",
  appId: "1:451548812466:web:3a169b502d55185b15a5ab",
  measurementId: "G-GK9RH4GR6J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);