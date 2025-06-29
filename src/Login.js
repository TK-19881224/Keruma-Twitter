import React, { useState } from 'react';
import { auth } from './FireBase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { db } from './FireBase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  if (typeof onLogin !== 'function') {
    throw new Error('LoginコンポーネントにonLoginプロップとして関数を渡してください。');
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const loginEmail = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ログイン成功後にlocalStorageにユーザーIDを保存
      localStorage.setItem('currentUserId', user.uid);

      onLogin(user); // ← userを渡すことでAppRouter側のuser状態も更新
      navigate('/'); // ← ホームへ遷移
    } catch (e) {
      alert(e.message);
    }
  };

  const signupEmail = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestoreにユーザー情報保存
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        name: user.email,
        photoURL: "",
        followers: [],
        following: [],
        createdAt: new Date(),
      });

      // 登録後にlocalStorageにユーザーIDを保存
      localStorage.setItem('currentUserId', user.uid);

      onLogin();
    } catch (e) {
      alert(e.message);
    }
  };

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const user = result.user;

      // Firestoreにユーザーが存在しない場合のみ追加
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || "",
          photoURL: user.photoURL || "",
          followers: [],
          following: [],
          createdAt: new Date(),
        });
      }

      // Googleログイン後にlocalStorageにユーザーIDを保存
      localStorage.setItem('currentUserId', user.uid);

      onLogin(user);  // userを渡すと他関数と統一できて良いです
      navigate('/');  // ここで投稿画面（ホーム）に遷移させる
      onLogin();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-orange-300 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-orange-600">
          Tomomitsu Keruma SNS
        </h2>

        <input
          type="email"
          className="w-full border border-gray-300 rounded-md px-4 py-3 mb-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
        />
        <input
          type="password"
          className="w-full border border-gray-300 rounded-md px-4 py-3 mb-6 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
        />

        <div className="flex flex-col space-y-3">
          <button
            className="bg-orange-500 text-white px-4 py-3 rounded-full text-sm sm:text-base hover:bg-orange-600 transition duration-200 shadow-md"
            onClick={loginEmail}
          >
            ログイン
          </button>
          <button
            className="bg-orange-500 text-white px-4 py-3 rounded-full text-sm sm:text-base hover:bg-orange-600 transition duration-200 shadow-md"
            onClick={signupEmail}
          >
            登録
          </button>
          <button
            className="bg-orange-500 text-white px-4 py-3 rounded-full text-sm sm:text-base hover:bg-orange-600 transition duration-200 shadow-md"
            onClick={loginGoogle}
          >
            Googleでログイン
          </button>
          <button
            className="bg-orange-500 text-white px-4 py-3 rounded-full text-sm sm:text-base hover:bg-orange-600 transition duration-200 shadow-md"
            onClick={() => navigate('/')}
          >
            トップページ
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;