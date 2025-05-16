import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import {
  getFirestore,
  getDocs,
  getDoc,
  setDoc,
  doc,
  collection,
  connectFirestoreEmulator
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

// ✅ Emulator 接続（ローカルでのみ）
if (window.location.hostname === "localhost") {
  console.log("🔥 Connecting to Firebase emulators...");
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}

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

// ログイン後
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("ログイン済み:", user.uid);

    // データが存在しなければ初期データを追加
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || "名無し",
        bio: "よろしくお願いします！",
        photoURL: user.photoURL || "/default-icon.png"
      });
      console.log("✅ Firestore に初期プロフィール追加");
    }
  }
});

export const googleProvider = new GoogleAuthProvider();
export { auth, db, storage, fetchData };