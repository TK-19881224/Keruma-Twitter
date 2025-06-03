import React, { useState, useEffect, useContext } from 'react';
import { PostContext } from './PostContext';
import { auth } from './FireBase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from './FireBase';
import { collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import './index.css';
import Header from './Header';
import { recordPageView } from './recordPageView';
import ShareButtons from "./ShareButtons";

function Home({ user, setUser }) {
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();
  const { posts, setPosts } = useContext(PostContext);
  const [profileName, setProfileName] = useState('');
  const [profilePhotoURL, setProfilePhotoURL] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(true); // 🔍 ローディング管理追加
  const baseUrl = window.location.origin;

  const title = "Keruma SNSで面白い投稿を見つけました！";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
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

  // 👇 追加: デバッグ表示用
  const [debugInfo, setDebugInfo] = useState('デバッグ情報未取得');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, 'posts');
        const q = query(postsCollection, orderBy("time", "desc"));
        const snapshot = await getDocs(q);

        // ✅ デバッグ: 取得件数確認
        setDebugInfo(`Firestore投稿件数: ${snapshot.size} 件`);

        const postsData = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const postData = docSnap.data();

          // Firestore TimestampからDateへ変換する安全な書き方
          const time = postData.time && postData.time.toDate ? postData.time.toDate() : null;

          const userDoc = await getDoc(doc(db, 'users', postData.uid));
          const commentsSnapshot = await getDocs(collection(db, "posts", docSnap.id, "comments"));
          const commentCount = commentsSnapshot.size;

          let nameFromUserCollection = postData.displayName;
          let profilePhotoURL = postData.photoURL || '';

          if (userDoc.exists()) {
            const userData = userDoc.data();
            nameFromUserCollection = userData.name || nameFromUserCollection;
            profilePhotoURL = userData.photoURL || profilePhotoURL;
          }

          return {
            id: docSnap.id,
            uid: postData.uid,
            text: postData.text || '',
            likes: postData.likes ?? 0,
            imageUrl: postData.imageUrl || '',
            videoUrl: postData.videoUrl || '',
            displayName: nameFromUserCollection || '匿名',
            photoURL: profilePhotoURL || '/default-icon.png',
            commentCount: commentCount ?? 0,
            draftComment: '',
            time, // ← 変換済みのDateオブジェクト
          };
        }));

        setPosts(postsData);

        // ✅ デバッグ: postsDataを文字列で表示
        setDebugInfo(prev => prev + `\n読み込み成功: ${postsData.length} 件の投稿を取得`);
        setLoading(false); // ✅ 追加！
      } catch (err) {
        setDebugInfo(`❌ 投稿取得エラー: ${err.message}`);
        console.error("Error getting posts:", err);
      }
    };

    fetchPosts();
  }, [setPosts]);

  const handleLike = async () => {
    // いいね処理（例：投稿のlikes配列にuidを追加など）

    // 通知を送る
    await sendLikeNotification({
      toUserId: postOwnerId,
      fromUserId: currentUserId,
      postId: currentPostId,
    });
  };

  const updated = [...posts];
  updated[index].likes += 1;
  setPosts(updated);

  const likedPost = posts[index];


  try {
    await updateDoc(doc(db, 'posts', likedPost.id), {
      likes: updated[index].likes
    });

    if (likedPost.uid !== user.uid) {
      await addDoc(collection(db, "notifications"), {
        toUserId: likedPost.uid,
        fromUserId: user.uid,
        type: "like",
        postId: likedPost.id,
        message: `${profileName}さんがあなたの投稿にいいねしました ❤️`,
        read: false,
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.error("いいね処理または通知作成でエラー:", err);
  }
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

const handleAddComment = async (postIndex, commentText) => {
  const post = posts[postIndex];
  if (!post?.id || !user) return;

  const comment = {
    text: commentText,
    createdAt: new Date(),
    userId: user.uid,
    userName: profileName,
  };

  try {
    await addDoc(collection(db, "posts", post.id, "comments"), comment);
    const updatedPosts = [...posts];
    updatedPosts[postIndex].commentCount = (updatedPosts[postIndex].commentCount || 0) + 1;
    updatedPosts[postIndex].draftComment = '';
    setPosts(updatedPosts);
  } catch (err) {
    console.error("コメントの保存に失敗:", err);
  }
};

useEffect(() => {
  recordPageView();
}, []);

return (
  <div className="bg-white min-h-screen">
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-200 via-blue-100 to-white p-8 font-sans pt-20">
      <Header
        profilePhotoURL={profilePhotoURL}
        profileName={profileName}
        user={user}
        setUser={setUser}
        onPostClick={() => setShowPostForm(!showPostForm)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="bg-white p-4 rounded-lg shadow-md mb-4 mt-6">
        <h2>投稿一覧</h2>
        {loading ? (
          <p>読み込み中...</p>
        ) : posts.length === 0 ? (
          <p>投稿がありません</p>
        ) : (
          posts.map((post, index) => (
            <div key={post.id} className="p-4 border-b border-gray-300 hover:bg-gray-100 transition duration-200 rounded-md">
              <div className="flex items-center mb-2">
                <div
                  className="flex items-center cursor-pointer text-blue-500"
                  onClick={() => post.uid && navigate(`/profile/${post.uid}`)}
                >
                  <img
                    src={post.photoURL || "/default-icon.png"}
                    alt="アイコン"
                    className='w-8 h-8 rounded-full inline-block mr-2'
                  />
                  <p className="font-semibold text-sm">{post.displayName}</p>
                </div>
              </div>

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
                <p className="text-xs text-gray-500 mb-2">
                  {post.time ? post.time.toLocaleString() : '日時不明'}
                </p>
                <div className="flex space-x-4 mt-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleLike(index);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-200 shadow-md"
                  >
                    ❤️ {post.likes}
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(index);
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-200 shadow-md"
                  >
                    🗑️
                  </button>

                  <div style={{ marginTop: '1rem' }}>
                    <p className="text-sm text-gray-600">
                      コメント数: {post.commentCount || 0}
                    </p>
                  </div>

                  <ShareButtons
                    url={`${baseUrl}/post/${post.id}`}
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
          ))
        )}
      </div>
    </div>
  </div>
);
}

export default Home;