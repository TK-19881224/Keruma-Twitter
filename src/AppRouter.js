import React, { useState, useEffect } from 'react';
import { PostProvider } from './PostContext';
import App from './App';
import Profile from './Profile';
import EditProfile from './EditProfile';
import Login from './Login';
import {
  BrowserRouter as Router,
  Route,
  Routes
} from 'react-router-dom';
import PostPage from './PostPage';

import { auth } from './FireBase'; // Firebase初期化ファイル
import { onAuthStateChanged } from 'firebase/auth';
import NewsPage from './NewsPage'


function AppRouter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ローディング状態

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔽 useEffectの後に記述する
  const handleLogin = (userData) => {
    setUser(userData);
  };

  if (loading) {
    return <div>読み込み中...</div>;
  }


  return (
    <PostProvider>
      <Router>
        <Routes>
          {/* ルートのAppにはuserやsetUserを渡しておくのがおすすめ */}
          <Route path="/" element={<App user={user} setUser={setUser} />} />

          {/* LoginにonLogin関数を渡す */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/post" element={<PostPage user={user} setUser={setUser} />} />
          <Route path="/profile/:uid" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/news" element={<NewsPage />} />
        </Routes>
      </Router>
    </PostProvider>
  );
}

export default AppRouter;