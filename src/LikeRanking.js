import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './FireBase';
import { Timestamp, serverTimestamp, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth } from './FireBase';
import { onAuthStateChanged } from 'firebase/auth';
import { Helmet } from 'react-helmet';

import Header from './Header';
import PostCard from './PostCard';

const getTopLikedPosts = async (period = 'daily') => {
  const now = new Date();
  let start;

  switch (period) {
    case 'weekly': start = new Date(now.setDate(now.getDate() - 7)); break;
    case 'monthly': start = new Date(now.setMonth(now.getMonth() - 1)); break;
    case 'yearly': start = new Date(now.setFullYear(now.getFullYear() - 1)); break;
    case 'daily':
    default: start = new Date(now.setDate(now.getDate() - 1)); break;
  }

  const q = query(
    collection(db, 'posts'),
    where('time', '>=', Timestamp.fromDate(start)),
    orderBy('likes', 'desc'),
    orderBy('time', 'desc'),
  );

  const snapshot = await getDocs(q);
  return await Promise.all(snapshot.docs.map(async docSnap => {
    const data = docSnap.data();
    const userDoc = await getDoc(doc(db, 'users', data.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};

    return {
      id: docSnap.id,
      ...data,
      time: data.time?.toDate?.() || null,
      displayName: userData.name || data.displayName || '匿名',
      photoURL: userData.photoURL || data.photoURL || '/default-icon.png',
      commentCount: 0, // ランキングではコメント数非表示でもOK
      draftComment: '',
    };
  }));
};

const periods = ['daily', 'weekly', 'monthly', 'yearly'];

export default function LikeRanking() {
  const [posts, setPosts] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [profilePhotoURL, setProfilePhotoURL] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const baseUrl = window.location.origin;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const data = profileDoc.exists() ? profileDoc.data() : {};
        setProfileName(data.name || currentUser.displayName || '匿名');
        setProfilePhotoURL(data.photoURL || currentUser.photoURL || '');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await getTopLikedPosts(selectedPeriod);
      setPosts(result);
      setLoading(false);
    };
    fetchData();
  }, [selectedPeriod]);

  const handleReport = async (post) => {
    if (!user) return;
    await addDoc(collection(db, "reports"), {
      reporterId: user.uid,
      reportedUserId: post.uid,
      postId: post.id,
      reason: "不適切な投稿", // ←固定でもOK（ダイアログつけても良い）
      createdAt: serverTimestamp()
    });
    alert("通報が送信されました。ご協力ありがとうございます。");
  };

  return (
    <>
      <Helmet>
        <title>いいねランキング</title>
        <meta name="description" content="最もいいねされた人気投稿のランキング一覧です。" />
        <link rel="canonical" href={`${baseUrl}/ranking`} />
      </Helmet>

      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-200 via-orange-100 to-white p-8 font-sans pt-20">
          <Header
            profilePhotoURL={profilePhotoURL}
            profileName={profileName}
            user={user}
            setUser={setUser}
            onPostClick={() => { }}
            activeTab="ranking"
            setActiveTab={() => { }}
          />

          <div className="bg-white p-4 rounded-lg shadow-md mb-4 mt-6">
            <h2 className="text-xl font-bold mb-4">👑 いいねランキング（{selectedPeriod}）</h2>

            <div className="mb-4 space-x-2">
              {periods.map(p => (
                <button
                  key={p}
                  className={`px-3 py-1 rounded ${selectedPeriod === p ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}
                  onClick={() => setSelectedPeriod(p)}
                >
                  {p === 'daily' && '1日'}
                  {p === 'weekly' && '週間'}
                  {p === 'monthly' && '月間'}
                  {p === 'yearly' && '年間'}
                </button>
              ))}
            </div>

            {loading ? (
              <p>読み込み中...</p>
            ) : posts.length === 0 ? (
              <p>ランキング対象の投稿がありません。</p>
            ) : (
              posts.map((post, index) => (
                <div key={post.id} className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">#{index + 1} ❤️ {post.likes ?? 0}</div>
                  <PostCard
                    post={post}
                    index={index}
                    user={user}
                    profileName={profileName}
                    onLike={() => { }}
                    onDelete={() => { }}
                    onBlock={() => { }}
                    onReport={() => handleReport(post)}
                    onAddComment={() => { }}
                    navigate={navigate}
                    baseUrl={baseUrl}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}