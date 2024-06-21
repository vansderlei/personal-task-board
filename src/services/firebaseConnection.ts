import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyC3Vz0IacfBfBDktgddjFqqgyM1QApkM1k",
  authDomain: "personal-task-board.firebaseapp.com",
  projectId: "personal-task-board",
  storageBucket: "personal-task-board.appspot.com",
  messagingSenderId: "438352665454",
  appId: "1:438352665454:web:e8a2d3b669fff3eee53f7f"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp)

export { db }