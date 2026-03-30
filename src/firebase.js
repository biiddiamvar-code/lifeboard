import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDJYVNu01WsPfcbaC-axl8Hq0j56dIOxm4",
  authDomain: "lifeboard-aile.firebaseapp.com",
  projectId: "lifeboard-aile",
  storageBucket: "lifeboard-aile.firebasestorage.app",
  messagingSenderId: "797902218356",
  appId: "1:797902218356:web:b2f9e787127065916b5d21",
  databaseURL: "https://lifeboard-aile-default-rtdb.europe-west1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);