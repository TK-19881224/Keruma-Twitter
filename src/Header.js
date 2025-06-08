import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from './FireBase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, query, where, orderBy, onSnapshot, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import useAuth from "./useAuth";
import { Menu, X } from "lucide-react";
import { Bell } from "lucide-react";

function Header() {
  const navigate = useNavigate();
  const user = useAuth();
  const currentUserId = user?.uid;

  const [profileName, setProfileName] = useState('ゲスト');
  const [profilePhotoURL, setProfilePhotoURL] = useState("/default-icon.png");
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);


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

  const sendLikeNotification = async ({ toUserId, fromUserId, postId }) => {
    try {
      await addDoc(collection(db, "notifications"), {
        toUserId,       // いいねを受けるユーザーID
        fromUserId,     // いいねしたユーザーID
        postId,         // 関連投稿ID
        type: "like",   // 通知タイプ
        message: "あなたの投稿にいいねが付きました！",
        read: false,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("通知の追加に失敗しました", error);
    }
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

  const markAsRead = async (notifId) => {
    const notifRef = doc(db, "notifications", notifId);
    await updateDoc(notifRef, { read: true });
  };

  useEffect(() => {
    if (!currentUserId) return;
    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", currentUserId),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [currentUserId]);

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white shadow-md px-4 py-3">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between">
        {/* ロゴ */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <img src={`${process.env.PUBLIC_URL}/SNS_logo.png`} alt="SNS Logo" className="h-16 w-auto" onClick={() => navigate('/')} />
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/profile/${currentUserId}`)}>
            {user ? (
              <>
                <img src={profilePhotoURL} alt="アイコン" className="w-8 h-8 rounded-full border" />
                <span className="text-blue-600 text-sm font-medium hover:underline" >
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
          {/* 通知ベル */}
          <div className="relative">
            <button onClick={() => setNotifOpen(prev => !prev)} className="text-gray-600">
              <Bell size={24} />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2"></span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white border shadow-lg rounded-lg z-50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">通知はありません</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.type === "post") {
                          navigate(`/post/${notif.postId}`);
                        } else if (notif.type === "profile") {
                          navigate(`/profile/${notif.fromUserId}`);
                        }
                        setNotifOpen(false);
                      }}
                      className={`p-3 border-b hover:bg-gray-50 text-sm cursor-pointer ${notif.read ? "text-gray-500" : "text-black"}`}
                    >
                      {notif.message}
                    </div>
                  ))
                )}
              </div>
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
              onClick={() => navigate(`/profile/${currentUserId}`)}
              className="bg-blue-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-600 transition shadow"
            >
              👤 プロフィール
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
              onClick={() => navigate('/likeranking')}
              className="bg-blue-500 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-600 transition shadow"
            >
              👑 いいねランキング
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