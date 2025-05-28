import React, { useState, useEffect } from 'react';
import { PostProvider } from './PostContext';
import Home from './Home';
import Profile from './Profile';
import EditProfile from './EditProfile';
import Login from './Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PostPage from './PostPage';
import { auth } from './FireBase';
import { onAuthStateChanged } from 'firebase/auth';
import NewsPage from './NewsPage';
import Terms from './Terms';
import Privacy from './Privacy';
import Layout from './Layout'; // ✅ Layout をインポート

function AppRouter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
          {/* ✅ Layoutを親ルートにして、共通レイアウトを提供 */}
          <Route path="/" element={<Layout user={user} setUser={setUser} />}>
            <Route index element={<Home user={user} setUser={setUser} />} />
            <Route path="post" element={<PostPage user={user} setUser={setUser} />} />
            <Route path="profile/:uid" element={<Profile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
          </Route>

          {/* ✅ Loginはレイアウトに含めない（ログイン前なので） */}
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    </PostProvider>
  );
}

export default AppRouter;