import { initializeApp } from "firebase/app";
import {getFirestore} from "@firebase/firestore";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHiu8qJW9m6w_kkMs06vNl1RxB9kQ7kjs",
  authDomain: "k-store-38ef4.firebaseapp.com",
  projectId: "k-store-38ef4",
  storageBucket: "k-store-38ef4.firebasestorage.app",
  messagingSenderId: "454527863629",
  appId: "1:454527863629:web:33089715160c8ac6ac0504",
  measurementId: "G-Y3Y7XT2C8V"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);