import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBbcPEmCBb9KMoUCXzs-oxVHqRo5XNAwJs",
  authDomain: "aetria-ee1f5.firebaseapp.com",
  projectId: "aetria-ee1f5",
  storageBucket: "aetria-ee1f5.firebasestorage.app",
  messagingSenderId: "1089203847310",
  appId: "1:1089203847310:web:de5c87081240021e3549df"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
