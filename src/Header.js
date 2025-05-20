import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from './FireBase';  // dbもここでimport
import { signOut } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import useAuth from "./useAuth";

function Header() {
  const navigate = useNavigate();
  const user = useAuth(); // Firebase認証情報
  

  const currentUserId = user?.uid;
  const [profileName, setProfileName] = useState('ゲスト');
  const [profilePhotoURL, setProfilePhotoURL] = useState("/default-icon.png");

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileName(data.name || user.displayName || 'ゲスト');
            setProfilePhotoURL(data.photoURL || user.photoURL || "/default-icon.png");
          } else {
            // Firestoreにドキュメントがない場合はFirebase Authの情報を使用
            setProfileName(user.displayName || 'ゲスト');
            setProfilePhotoURL(user.photoURL || "/default-icon.png");
          }
        } catch (error) {
          console.error("プロフィール情報の取得に失敗しました", error);
          setProfileName(user.displayName || 'ゲスト');
          setProfilePhotoURL(user.photoURL || "/default-icon.png");
        }
      } else {
        setProfileName('ゲスト');
        setProfilePhotoURL("/default-icon.png");
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('ログアウト失敗:', error);
      });
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md px-4 py-2">
    <div className="max-w-screen-lg mx-auto flex flex-wrap items-center justify-between gap-y-2">
      {/* ロゴ */}
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <img
          src="/Tomomitsu_keruma_SNS_logo.png"
          alt="SNS Logo"
          className="h-10 w-auto"
        />
        <h1 className="text-lg sm:text-xl font-bold text-gray-700 whitespace-nowrap">
          Tomomitsu SNS
        </h1>
      </div>
  
      {/* プロフィール・操作 */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
        <img
          src={profilePhotoURL}
          alt="アイコン"
          className="w-9 h-9 rounded-full border"
        />
        <span
          className="text-blue-600 font-medium text-sm sm:text-base cursor-pointer hover:underline"
          onClick={() => navigate(`/profile/${currentUserId}`)}
        >
          {profileName}さん
        </span>
  
        {/* ログアウトボタン */}
        {user && (
          <button
            onClick={handleLogout}
            className="bg-blue-500 text-white text-sm px-3 py-1.5 rounded-xl hover:bg-blue-600 transition shadow"
          >
            ログアウト
          </button>
        )}
      </div>
    </div>
  </header>
  );
}

export default Header;