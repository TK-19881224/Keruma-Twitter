import React, { useState, useEffect, useContext } from 'react';
import { PostContext } from './PostContext';
import { auth } from './FireBase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './login';
import { storage } from './FireBase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { db } from './FireBase'; // Firestoreのインポート
import { collection, getDocs, addDoc} from 'firebase/firestore'; // Firestoreの関数
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const navigate = useNavigate();
  const { posts, setPosts } = useContext(PostContext);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        console.log('ログインユーザーのUID:', currentUser.uid);
      } else {
        console.log('ユーザーがログインしていません');
      }
    });
    return () => unsub();
  }, []);

  // 投稿をFirestoreから取得する
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, 'posts');
        const snapshot = await getDocs(postsCollection);
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id, // ドキュメントID（UID）を取得
          ...doc.data(), // 他の投稿データを含める
        }));
        setPosts(postsData);
      } catch (err) {
        console.error("Error getting posts:", err);
      }
    };

    fetchPosts();
  }, [setPosts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (text.trim() === '') return;

    const now = new Date();
    const formattedTime = now.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    let imageUrl = null;
    if (image) {
      const safeFileName = `${Date.now()}_${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const imageRef = ref(storage, `images/${safeFileName}`);
      const snapshot = await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(snapshot.ref);
    }


    let videoUrl = null;
    if (video) {
      const safeVideoName = `${Date.now()}_${video.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const videoRef = ref(storage, `videos/${safeVideoName}`);
      const snapshot = await uploadBytes(videoRef, video);
      videoUrl = await getDownloadURL(snapshot.ref);
    }

    const newPost = {
      uid: user?.uid,
      text,
      time: formattedTime,
      likes: 0,
      user: user?.email,
      displayName: user?.displayName || '匿名',
      photoURL: user?.photoURL || '',
      imageUrl,
      videoUrl,
      comments: [],
      draftComment: ''
    };

    try {
      // Firestore に保存
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      console.log('投稿がFirestoreに保存されました。ID:', docRef.id);

      // UIに反映
      setPosts([{ id: docRef.id, ...newPost }, ...posts]);
      setText('');
      setImage(null);
      setVideo(null);
    } catch (error) {
      console.error('投稿の保存に失敗しました:', error);
    }
  };

  const handleLike = (index) => {
    const updated = [...posts];
    updated[index].likes += 1;
    setPosts(updated);
  };

  const handleDelete = (index) => {
    setPosts(posts.filter((_, i) => i !== index));
  };

  const handleAddComment = (postIndex, commentText) => {
    const updatedPosts = [...posts];
    updatedPosts[postIndex].comments.push(commentText);
    updatedPosts[postIndex].draftComment = '';
    setPosts(updatedPosts);
  };

  if (!user) {
    return <Login onLogin={() => { }} />;
  }

  return (
    <div className="min-h-screen bg-blue-100 p-8 font-sans">
      <h1 className="font-audiowide text-3xl">Tomomitsu Keruma SNS</h1>
      <p>

        ようこそ、
        {user.photoURL ? (
          <img src={user.photoURL} alt="アイコン" className='w-8 h-8 rounded-full inline-block mr-2' />
        ) : (
          <img src="/default-icon.png" alt="アイコン" className='w-8 h-8 rounded-full inline-block mr-2' />
        )}
        <span
          onClick={() => navigate(`/profile/${user.uid}`)}
          style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {user.email}
        </span>さん
        <button
          onClick={() => signOut(auth)}
          className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-200 shadow-md ml-4"
        >
          ログアウト
        </button>
      </p>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-md space-y-4 mt-4">
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
          className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-200 shadow-md"
        >
          投稿する
        </button>
      </form>

      <div className="bg-white p-4 rounded-lg shadow-md mb-4 mt-6">
        <h2>投稿一覧</h2>
        {posts.map((post, index) => (
          <div key={index} style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
            <div className="flex items-center mb-2">
              <div
                className="flex items-center cursor-pointer text-blue-500"
                onClick={() => post.uid && navigate(`/profile/${post.uid}`)} // UID（ドキュメントID）を使ってプロフィールページへ
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="アイコン" className='w-8 h-8 rounded-full inline-block mr-2' />
                ) : (
                  <img src="/default-icon.png" alt="アイコン" className='w-8 h-8 rounded-full inline-block mr-2' />
                )}
                <p className="font-semibold text-sm">{post.displayName}</p>
              </div>
              <p className="text-xs text-gray-500 ml-2">{post.time} - {post.user}</p>
            </div>
            <p className="mb-2">{post.text}</p>
            {post.imageUrl && (
              <img src={post.imageUrl} alt="投稿画像" className="rounded-md max-w-full mb-2" />
            )}
            {post.videoUrl && (
              <video controls className="rounded-md max-w-full mb-2">
                <source src={post.videoUrl} type="video/mp4" />
                お使いのブラウザは video タグをサポートしていません。
              </video>
            )}

            <div className="flex space-x-4 mt-2">
              <button onClick={() => handleLike(index)} className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-200 shadow-md">
                ❤️ いいね ({post.likes})
              </button>
              <button onClick={() => handleDelete(index)} className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-200 shadow-md">
                🗑️ 削除
              </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <h4>コメント</h4>
              <ul>
                {post.comments.map((comment, cIndex) => (
                  <li key={cIndex} style={{ fontSize: '0.9rem' }}>{comment}</li>
                ))}
              </ul>
              <textarea
                placeholder='コメントを追加...'
                rows={3}
                onChange={(e) => {
                  const updated = [...posts];
                  updated[index].draftComment = e.target.value;
                  setPosts(updated);
                }}
                value={post.draftComment || ''}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              />
              <button
                onClick={() => {
                  if ((post.draftComment || '').trim()) {
                    handleAddComment(index, post.draftComment);
                  }
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-200 shadow-md"
              >
                コメントする
              </button>

              {(index + 1) % 3 === 0 && (
                <div className="p-4 my-4 bg-gray-100 border text-center">
                  <p className="font-bold">スポンサーリンク</p>
                  <a href="https://qiita.com/Tomomitsu_Keruma" target="_blank" rel="noopener noreferrer">
                    <img src="/Qiita_keruma_image.png" alt="広告" className="mx-auto max-w-full h-auto" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;