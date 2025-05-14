import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import {
  getFirestore,
  getDocs,
  collection
} from "firebase/firestore";
import { setLogLevel } from "firebase/app";

setLogLevel("debug");

const firebaseConfig = {
  apiKey: "AIzaSyBstoYk50fGIx2yL8EVDM_ZytO4HXYdq2c",
  authDomain: "keruma-sns-app.firebaseapp.com",
  projectId: "keruma-sns-app",
  storageBucket: "keruma-sns-app.firebasestorage.app",
  messagingSenderId: "425045870454",
  appId: "1:425045870454:web:8aea44efaeb349b447dc57",
  measurementId: "G-273N84EK2L"
};

// ✅ デフォルトで初期化
const app = initializeApp(firebaseConfig);

// 初期化
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Firestoreからユーザーデータを取得
async function fetchData() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });
  } catch (error) {
    console.error("Error fetching documents: ", error.code, error.message);
  }
}

// 認証状態が変わった後に Firestore にアクセス
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("ログイン済みユーザー:", user.uid);
    fetchData();
  } else {
    console.log("ユーザーがログインしていません。");
  }
});

export const googleProvider = new GoogleAuthProvider();
export { auth, db, storage, fetchData };