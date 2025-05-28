import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from './FireBase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import useAuth from "./useAuth";
import { Menu, X } from "lucide-react";

function Header() {
  const navigate = useNavigate();
  const user = useAuth();
  const currentUserId = user?.uid;

  const [profileName, setProfileName] = useState('ゲスト');
  const [profilePhotoURL, setProfilePhotoURL] = useState("/default-icon.png");
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('ログアウト失敗:', error);
      });
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

  useEffect(() => {
    const fetchViews = async () => {
      try {
        const collectionRef = collection(db, 'pageViews');
        const querySnapshot = await getDocs(collectionRef);
        setViewCount(querySnapshot.size);
      } catch (error) {
        console.error("ビュー数の取得に失敗しました", error);
        setViewCount(0);
      }
    };
    fetchViews();
  }, [user]);

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md px-4 py-3">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between">
        {/* ロゴ */}
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/Tomomitsu_keruma_SNS_logo.png" alt="SNS Logo" className="h-10 w-auto" />
                    <div className="items-center space-x-3 cursor-pointer">
            {user ? (
              <>
                <img src={profilePhotoURL} alt="アイコン" className="w-8 h-8 rounded-full border" />
                <span className="text-blue-600 text-sm font-medium hover:underline" onClick={() => navigate(`/profile/${currentUserId}`)}>
                  {profileName}
                </span>
              </>
            ) : (
              <>
                <img src="/default-icon.png" alt="ゲストアイコン" className="w-8 h-8 rounded-full border" />
                <span className="text-gray-600 text-sm font-medium">
                  ゲスト
                </span>
              </>
            )}
          </div>
          
        </div>

        {/* ハンバーガーアイコン */}
        <div className="flex items-center space-x-4">
          <span className="whitespace-nowrap text-xs text-gray-500">views: {viewCount}</span>
          {/* ハンバーガーボタン */}
          <button onClick={toggleMenu} className="text-gray-600">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* メニュー */}
      {menuOpen && (
        <div className="mt-2 px-2 py-3 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-center md:space-x-6 space-y-3 md:space-y-0">
            <button
              onClick={() => {
                toggleMenu();
                navigate('/post');
              }}
              className="bg-blue-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-600 transition shadow"
            >
              ✏️ 投稿
            </button>
            <button
              onClick={() => {
                toggleMenu();
                navigate('/');
              }}
              className="bg-blue-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-600 transition shadow"
            >
              📢 投稿一覧
            </button>
            <button
            onClick={() => navigate('/news')}
            className="bg-blue-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-600 transition shadow"
            >
              📰 ニュース
            </button>
            {user ? (
              <button
                onClick={() => {
                  toggleMenu();
                  handleLogout();
                }}
                className="bg-blue-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-600 transition shadow"
              >
                ログアウト
              </button>
            ) : (
              <button
                onClick={() => {
                  toggleMenu();
                  navigate('/login');
                }}
                className="bg-blue-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-600 transition shadow"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;