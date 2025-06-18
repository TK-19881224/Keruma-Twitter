// src/PostPage.js
import React, { useState } from 'react';
import Header from './Header';
import { db, storage } from './FireBase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { serverTimestamp } from "firebase/firestore";
import { updateEnglishPostBadge, isEnglish } from './badgeUtils';

function PostPage({ profilePhotoURL, profileName, user, setUser }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [showPostForm, setShowPostForm] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ user が未定義なら投稿禁止
    if (!user || !user.uid) {
      alert("ログインしていません。投稿できません。");
      return;
    }

    if (text.trim() === '') return;

    const now = new Date();

    let imageUrl = null;
    let videoUrl = null;

    if (image) {
      const safeFileName = `${Date.now()}_${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const imageRef = ref(storage, `images/${safeFileName}`);
      const snapshot = await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    if (video) {
      const safeVideoName = `${Date.now()}_${video.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const videoRef = ref(storage, `videos/${safeVideoName}`);
      const snapshot = await uploadBytes(videoRef, video);
      videoUrl = await getDownloadURL(snapshot.ref);
    }

    let resolvedName = '匿名';
    let resolvedPhoto = '';

    try {
      const profileDoc = await getDoc(doc(db, 'users', user.uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        resolvedName = data.name || user.displayName || '匿名';
        resolvedPhoto = data.photoURL || user.photoURL || '';
      }
    } catch (err) {
      console.warn("プロフィール取得失敗:", err);
    }

    const newPost = {
      uid: user.uid,  // ← 必ず存在する状態で代入
      text,
      time: serverTimestamp(), // ← 追加（投稿日時）
      likes: 0,
      user: user.email,
      displayName: resolvedName,
      photoURL: resolvedPhoto,
      imageUrl,
      videoUrl,
      comments: [],
      draftComment: ''
    };

    try {
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      console.log('投稿がFirestoreに保存されました。ID:', docRef.id);

      // 英語判定してバッジ更新を呼ぶ
      if (isEnglish(text)) {
        await updateEnglishPostBadge(user.uid);
      }

      alert("投稿しました！");
      setText('');
      setImage(null);
      setVideo(null);
      navigate('/');
    } catch (error) {
      console.error('投稿失敗:', error);
      alert("投稿に失敗しました");
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-200 via-orange-100 to-white p-8 font-sans pt-10">
        <Header
          profilePhotoURL={profilePhotoURL}
          profileName={profileName}
          user={user}
          setUser={setUser}
          onPostClick={() => setShowPostForm(!showPostForm)}
        />
        <main className="pt-20">
          {user ? (
            showPostForm && (
              <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md space-y-4 mt-4">
                <h2>投稿しましょう</h2>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="今なにしてる?"
                  rows="4"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                />

                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    if (file.type.startsWith("image/")) {
                      setImage(file);
                      setVideo(null);
                    } else if (file.type.startsWith("video/")) {
                      setVideo(file);
                      setImage(null);
                    }
                  }}
                  className="block"
                />

                <button
                  type="submit"
                  className="bg-orange-500 text-white px-4 py-2 rounded-2xl hover:bg-orange-600 transition duration-200 shadow-md"
                >
                  投稿する
                </button>
              </form>
            )
          ) : (
            <div className="text-center text-gray-600 mt-10">
              投稿するにはログインしてください。
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default PostPage;