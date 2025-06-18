import React, { useState, useEffect, useContext } from 'react';
import { PostContext } from './PostContext';
import { auth } from './FireBase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { db } from './FireBase';
import { setDoc, collection, getDocs, doc, getDoc, addDoc, deleteDoc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import './index.css';
import Header from './Header';
import { recordPageView } from './recordPageView';
import { Helmet } from 'react-helmet';
import PostCard from './PostCard';
import TodayToeicWord from './TodayToeicWord';


function Home({ user, setUser }) {
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();
  const { posts, setPosts } = useContext(PostContext);
  const [profileName, setProfileName] = useState('');
  const [profilePhotoURL, setProfilePhotoURL] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [loading, setLoading] = useState(true); // 🔍 ローディング管理追加
  const baseUrl = window.location.origin;
  // 追加してください
const [debugInfo, setDebugInfo] = useState('');

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

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return; // userがnullの場合を防ぐ

      try {
        const blockSnapshot = await getDocs(collection(db, `users/${user.uid}/blocks`));
        const blockedUserIds = blockSnapshot.docs.map(doc => doc.id);

        const postsCollection = collection(db, 'posts');
        const q = query(postsCollection, orderBy("time", "desc"));
        const snapshot = await getDocs(q);

        const postsData = await Promise.all(snapshot.docs.map(async (docSnap) => {
          const postData = docSnap.data();
          if (blockedUserIds.includes(postData.uid)) return null;

          const userDoc = await getDoc(doc(db, 'users', postData.uid));
          const commentsSnapshot = await getDocs(collection(db, "posts", docSnap.id, "comments"));
          const commentCount = commentsSnapshot.size;

          let nameFromUserCollection = postData.displayName;
          let profilePhotoURL = postData.photoURL || '';

          if (userDoc.exists()) {
            const userData = userDoc.data();
            nameFromUserCollection = userData.name || nameFromUserCollection;
            profilePhotoURL = userData.photoURL || profilePhotoURL;
            console.log(`post id: ${docSnap.id}, userDoc.exists: ${userDoc.exists()}, userData:`, userDoc.data());
          }

          const time = postData.time?.toDate ? postData.time.toDate() : null;

          return {
            id: docSnap.id,
            uid: postData.uid,
            text: postData.text || '',
            likes: postData.likes ?? 0,
            imageUrl: postData.imageUrl || '',
            videoUrl: postData.videoUrl || '',
            displayName: nameFromUserCollection || '匿名',
            photoURL: profilePhotoURL || '/default-icon.png',
            commentCount,
            draftComment: '',
            time
          };
        }));

        setPosts(postsData.filter(Boolean));
        setDebugInfo(`✅ 読み込み成功: ${postsData.filter(Boolean).length} 件の投稿を取得`);
        setLoading(false);
      } catch (err) {
        setDebugInfo(`❌ 投稿取得エラー: ${err.message}`);
        console.error("Error getting posts:", err);
      }
    };

    fetchPosts();
  }, [setPosts, user]);


  const handleLike = async (index) => {
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

  const blockUser = async (currentUserId, targetUserId) => {
    try {
      await setDoc(doc(db, `users/${currentUserId}/blocks/${targetUserId}`), {
        blockedUserId: targetUserId,
        createdAt: serverTimestamp(),
      });
      alert('ユーザーをブロックしました');
    } catch (err) {
      console.error("ブロック失敗:", err);
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
    <>
      <Helmet>
        {/* SEO */}
        <title>英語でつぶやこう!</title>
        <meta name="description" content="写真・動画・つぶやきを気軽に共有できるSNSです。" />
        <link rel="canonical" href="https://keruma-twitter.vercel.app/" />

        {/* Open Graph for Facebook & others */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://keruma-twitter.vercel.app/" />
        <meta property="og:title" content="つぶやき" />
        <meta property="og:description" content="写真・動画・つぶやきを気軽に共有できるSNSです。" />
        <meta property="og:image" content="https://keruma-twitter.vercel.app/og-image.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://keruma-twitter.vercel.app/" />
        <meta name="twitter:title" content="つぶやき" />
        <meta name="twitter:description" content="写真・動画・つぶやきを気軽に共有できるSNSです。" />
        <meta name="twitter:image" content="https://keruma-twitter.vercel.app/og-image.png" />
      </Helmet>
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-200 via-orange-100 to-white p-8 font-sans pt-20">
          <Header
            profilePhotoURL={profilePhotoURL}
            profileName={profileName}
            user={user}
            setUser={setUser}
            onPostClick={() => setShowPostForm(!showPostForm)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <TodayToeicWord /> 
          
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 mt-6">
            <h2>投稿一覧</h2>
            {loading ? (
              <p>読み込み中...</p>
            ) : posts.length === 0 ? (
              <p>投稿がありません</p>
            ) : (
              posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}  from="home" 
                  index={index}
                  user={user}
                  profileName={profileName}
                  onLike={(i) => handleLike(i)}
                  onDelete={handleDelete}
                  onBlock={blockUser}
                  onReport={async (reason) => {
                    await addDoc(collection(db, "reports"), {
                      reporterId: user.uid,
                      reportedUserId: post.uid,
                      postId: post.id,
                      reason,
                      createdAt: serverTimestamp()
                    });
                    alert("通報が送信されました。ご協力ありがとうございます。");
                  }}
                  onAddComment={handleAddComment}
                  navigate={navigate}
                  baseUrl={baseUrl}
                  showProfileInfo={true} // ここを追加！
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );

}

export default Home;