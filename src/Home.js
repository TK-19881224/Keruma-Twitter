import React, { useState, useEffect, useContext } from 'react';
import { PostContext } from './PostContext';
import { auth } from './FireBase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from './FireBase'; // Firestoreのインポート
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'; // Firestoreの関数
import './index.css';
import Header from './Header';
import { deleteDoc } from 'firebase/firestore';
import { recordPageView } from './recordPageView';
import ShareButtons from "./ShareButtons";

function Home() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();
  const { posts, setPosts } = useContext(PostContext);
  const [profileName, setProfileName] = useState('');
  const [profilePhotoURL, setProfilePhotoURL] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const baseUrl = window.location.origin;  // ✅ 現在のページURL
  const title = "Keruma SNSで面白い投稿を見つけました！"; // ✅ 任意のタイトル

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        console.log('ログインユーザーのUID:', currentUser.uid);

        (async () => {
          try {
            const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (profileDoc.exists()) {
              const data = profileDoc.data();
              setProfileName(data.name || currentUser.displayName || '匿名');
              setProfilePhotoURL(data.photoURL || currentUser.photoURL || '');
            }
          } catch (err) {
            console.warn("プロフィール情報の取得に失敗しました", err);
          }
        })();
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
        const postsData = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const postData = docSnap.data();

          const userDoc = await getDoc(doc(db, 'users', postData.uid));

          let nameFromUserCollection = postData.displayName;
          let profilePhotoURL = postData.photoURL || '';

          if (userDoc.exists()) {
            const userData = userDoc.data();
            nameFromUserCollection = userData.name || nameFromUserCollection;
            profilePhotoURL = userData.photoURL || profilePhotoURL;
          }

          return {
            id: docSnap.id,
            ...postData,
            displayName: nameFromUserCollection,
            photoURL: profilePhotoURL || postData.photoURL || ''
          };
        }));

        setPosts(postsData);
      } catch (err) {
        console.error("Error getting posts:", err);
      }
    };

    fetchPosts();
  }, [setPosts]); // userが変わる度に投稿取得


  const handleLike = (index) => {
    const updated = [...posts];
    updated[index].likes += 1;
    setPosts(updated);
  };

  const handleDelete = async (index) => {
    const postToDelete = posts[index];
    if (!postToDelete?.id) return;

    try {
      await deleteDoc(doc(db, 'posts', postToDelete.id));
      setPosts(posts.filter((_, i) => i !== index));
    } catch (err) {
      console.error("削除失敗:", err);
    }
  };

  const handleAddComment = (postIndex, commentText) => {
    const updatedPosts = [...posts];
    updatedPosts[postIndex].comments.push(commentText);
    updatedPosts[postIndex].draftComment = '';
    setPosts(updatedPosts);
  };

  useEffect(() => {
    recordPageView();
  }, []);



  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-200 via-blue-100 to-white p-8 font-sans pt-20">
        {/* ロゴを左上に固定表示 */}
        <Header
          profilePhotoURL={profilePhotoURL}
          profileName={profileName}
          user={user}
          setUser={setUser}
          onPostClick={() => setShowPostForm(!showPostForm)} // ← 新たに追加
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="bg-white p-4 rounded-lg shadow-md mb-4 mt-6">
          <h2>投稿一覧</h2>
          {posts.map((post, index) => (
            <div key={index} style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
              <div className="flex items-center mb-2">
                <div
                  className="flex items-center cursor-pointer text-blue-500"
                  onClick={() => post.uid && navigate(`/profile/${post.uid}`)} // UID（ドキュメントID）を使ってプロフィールページへ
                >
                  <img
                    src={post.photoURL || "/default-icon.png"}
                    alt="アイコン"
                    className='w-8 h-8 rounded-full inline-block mr-2'
                  />
                  <p className="font-semibold text-sm">{post.displayName}</p>
                </div>
                <p className="text-xs text-gray-500 ml-2">{post.time} - {post.user}</p>
              </div>

              {/* 🔽 投稿内容クリックで遷移 */}
              <div
                className="cursor-pointer"
                onClick={() => navigate(`/post/${post.id}`)}
              >

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
                    ❤️ {post.likes}
                  </button>
                  <button onClick={() => handleDelete(index)} className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-200 shadow-md">
                    🗑️
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
                    rows={1}
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
                  <ShareButtons
                    url={`${baseUrl}/post/${post.id}`}  // ← ここを投稿IDごとに
                    title={`Keruma SNSで面白い投稿を見つけました！「${post.text.slice(0, 30)}...」`}
                  />
                </div>

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
    </div>
  );
}

export default Home;