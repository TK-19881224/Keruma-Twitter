import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from './FireBase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import useAuth from "./useAuth";
import { Menu, X } from "lucide-react";

function Header() {
  const navigate = useNavigate();
  const user = useAuth();
  const currentUserId = user?.uid;

  const [profileName, setProfileName] = useState('ゲスト');
  const [profilePhotoURL, setProfilePhotoURL] = useState("/default-icon.png");
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ toggleMenu 関数を明示的に定義
  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

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
            setProfileName(user.displayName || 'ゲスト');
            setProfilePhotoURL(user.photoURL || "/default-icon.png");
          }
        } catch (error) {
          console.error("プロフィール情報の取得に失敗しました", error);
        }
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
    <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md px-4 py-3">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between">
        {/* ロゴ */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/Tomomitsu_keruma_SNS_logo.png" alt="SNS Logo" className="h-10 w-auto" />
          <h1 className="text-lg font-bold text-gray-700 whitespace-nowrap">Tomomitsu SNS</h1>
        </div>

        {/* ハンバーガーアイコン（モバイル） */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-gray-600">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* メニュー（PC） */}
        <div className="hidden md:flex items-center space-x-4">
          <img src={profilePhotoURL} alt="アイコン" className="w-9 h-9 rounded-full border" />
          <span
            className="text-blue-600 font-medium text-sm cursor-pointer hover:underline"
            onClick={() => navigate(`/profile/${currentUserId}`)}
          >
            {profileName}さん
          </span>
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

      {/* モバイル用メニュー */}
      {menuOpen && (
        <div className="md:hidden mt-2 px-2 space-y-2">
          <div className="flex items-center space-x-3">
            <img src={profilePhotoURL} alt="アイコン" className="w-8 h-8 rounded-full border" />
            <span
              className="text-blue-600 text-sm font-medium cursor-pointer hover:underline"
              onClick={() => {
                toggleMenu();
                navigate(`/profile/${currentUserId}`);
              }}
            >
              {profileName}さんのプロフィール
            </span>
          </div>
          {user && (
            <button
              onClick={() => {
                toggleMenu();
                handleLogout();
              }}
              className="w-full bg-blue-500 text-white text-sm px-3 py-2 rounded-xl hover:bg-blue-600 transition shadow"
            >
              ログアウト
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;