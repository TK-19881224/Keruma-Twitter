import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './FireBase';
import ShareButtons from './ShareButtons';
import { auth } from './FireBase';
import { onAuthStateChanged } from 'firebase/auth';

function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState(""); // 🔸 入力用state
  const [currentUser, setCurrentUser] = useState(null); // 🔸 ログインユーザー

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists()) {
        const postData = postDoc.data();

        // 🔽 ここで `time` を安全に変換
        const time = postData.time && postData.time.toDate ? postData.time.toDate().toLocaleString() : "日時不明";

        setPost({
          ...postData,
          time, // ← 文字列としてセット
        });

        const userDoc = await getDoc(doc(db, 'users', postData.uid));
        if (userDoc.exists()) {
          setAuthor(userDoc.data());
        }

        const commentsSnapshot = await getDocs(collection(db, 'posts', postId, 'comments'));
        const commentsList = commentsSnapshot.docs.map(doc => doc.data());
        setComments(commentsList);
      } else {
        console.warn("投稿が存在しません");
      }
    };
    fetchPost();
  }, [postId]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !currentUser) return;

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userName = userDoc.exists() ? (userDoc.data().name || "匿名") : "匿名";

    const newComment = {
      text: commentText.trim(),
      userId: currentUser.uid,
      userName,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), newComment);
      setComments(prev => [...prev, newComment]);
      setCommentText(""); // 入力欄クリア
    } catch (err) {
      console.error("コメントの送信に失敗:", err);
    }
  };

  if (!post) return <p>読み込み中...</p>;

  const shareUrl = `${window.location.origin}/post/${postId}`;
  const shareTitle = `Keruma SNSで面白い投稿を見つけました!「${post.text?.slice(0, 30)}...」`;

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white shadow rounded">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden border mr-2">
          <img
            src={author?.photoURL || '/default-icon.png'}
            alt="ユーザーアイコン"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold">{author?.name || '匿名ユーザー'}</p>
          <p className="text-sm text-gray-500">{post.time}</p>
        </div>
      </div>

      <p className="mb-4">{post.text}</p>

      {post.imageUrl && (
        <img src={post.imageUrl} alt="投稿画像" className="rounded-md mb-4 max-w-full" />
      )}

      {post.videoUrl && (
        <video controls className="rounded-md mb-4 max-w-full">
          <source src={post.videoUrl} type="video/mp4" />
        </video>
      )}

      <ShareButtons url={shareUrl} title={shareTitle} />

      <div className="mt-6">
        <h3 className="font-semibold mb-2">コメント一覧</h3>
        {comments.length === 0 ? (
          <p className="text-gray-500">コメントはまだありません。</p>
        ) : (
          <ul className="list-disc list-inside mt-2 mb-4">
            {comments.map((c, i) => (
              <li key={i}>
                <span className="font-bold">{c.userName || '匿名'}:</span> {c.text}
              </li>
            ))}
          </ul>
        )}

        {/* 🔽 コメント入力欄 */}
        {currentUser ? (
          <div className="mt-4">
            <textarea
              rows={1}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="コメントを入力..."
              className="w-full p-2 border rounded focus:outline-none focus:ring"
            />
            <button
              onClick={handleAddComment}
              className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-2xl hover:bg-orange-600 transition duration-200 shadow-md"
            >
              コメントする
            </button>
          </div>
        ) : (
          <p className="text-gray-500">コメントするにはログインが必要です。</p>
        )}
      </div>
    </div>
  );
}

export default PostDetail;