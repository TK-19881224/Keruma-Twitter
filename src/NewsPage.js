import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from './Header';
import { auth, db } from './FireBase';
import { doc, getDoc } from 'firebase/firestore';

function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: '', photoURL: '' });

  useEffect(() => {
    const fetchNews = async () => {
      const API_KEY = process.env.REACT_APP_GNEWS_API_KEY;
      const endpoint = `https://gnews.io/api/v4/top-headlines?lang=ja&country=jp&max=20&token=${API_KEY}`;
      console.log("APIキー:", API_KEY);
      console.log("エンドポイント:", endpoint);

      try {
        const response = await axios.get(endpoint);
        console.log("レスポンス:", response.data);
        setArticles(response.data.articles);
      } catch (error) {
        console.error("ニュースの取得に失敗しました:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            name: data.name || '',
            photoURL: data.photoURL || '',
          });
        }
      }
    };

    fetchNews();
    fetchProfile();
  }, []);

  return (
    <div className="max-w-4xl mx-auto pt-24 p-4">
      <Header profileName={profile.name} profilePhotoURL={profile.photoURL} />
      <h1 className="text-2xl font-bold mb-4">最新ニュース（日本）</h1>
      {loading ? (
        <p>読み込み中...</p>
      ) : articles.length === 0 ? (
        <p>ニュースが見つかりませんでした。</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article, idx) => (
            <li key={idx} className="bg-white p-4 rounded shadow">
              <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold text-blue-600 hover:underline">
                {article.title}
              </a>
              {article.image && (
                <img src={article.image} alt="" className="my-2 rounded max-h-60 object-cover w-full" />
              )}
              <p className="text-sm text-gray-700">{article.description}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(article.publishedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NewsPage;