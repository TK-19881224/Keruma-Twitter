import { useParams, useNavigate } from 'react-router-dom';
import { PostContext } from './PostContext';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from './FireBase';
import { useEffect, useState, useContext } from 'react';
import FollowButton from './FollowButton';
import Header from './Header';

// ギフトリスト
function GiftList({ userId }) {
  const [gifts, setGifts] = useState([]);

  useEffect(() => {
    const fetchGifts = async () => {
      const q = query(collection(db, 'gifts'), where('toUser', '==', userId));
      const snapshot = await getDocs(q);
      setGifts(snapshot.docs.map(doc => doc.data()));
    };
    fetchGifts();
  }, [userId]);

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">🎁 受け取ったギフト</h4>
      <ul className="text-sm space-y-1">
        {gifts.map((gift, i) => (
          <li key={i} className="bg-white p-2 rounded shadow">
            {gift.fromUser} さんから {gift.amount} コイン 「{gift.message}」
          </li>
        ))}
      </ul>
    </div>
  );
}

// ギフトフォーム
function GiftForm({ toUser }) {
  const [fromUser, setFromUser] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'gifts'), {
        toUser,
        fromUser,
        amount: parseInt(amount),
        message,
        createdAt: Timestamp.now(),
      });
      setStatus('✅ ギフトを送信しました！');
      setFromUser('');
      setAmount('');
      setMessage('');
    } catch (error) {
      console.error('ギフト送信エラー', error);
      setStatus('❌ 送信に失敗しました。');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-200 via-blue-100 to-white p-8 font-sans pt-10">
        <h4 className="font-semibold mb-2">🎁 ギフトを送る</h4>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="あなたの名前"
            value={fromUser}
            onChange={(e) => setFromUser(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="number"
            placeholder="金額(コイン)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="メッセージ"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
          >
            ギフト送信
          </button>
          {status && <p className="text-sm">{status}</p>}
        </form>
      </div>
    </div>
  );
}

// メインのプロフィール画面
function Profile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { posts } = useContext(PostContext);
  const currentUserId = localStorage.getItem('currentUserId');
  const isCurrentUser = String(currentUserId) === String(uid);
  const userPosts = posts.filter((post) => post.uid === uid);
  const [profile, setProfile] = useState({ name: '', bio: '', photoURL: '' });

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchUserProfile = async () => {
      try {
        const isOnline = window.navigator.onLine;
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef, { source: isOnline ? 'default' : 'cache' });
        if (userSnap.exists()) {
          setProfile(userSnap.data());
        } else {
          setProfile({ name: '未設定', bio: 'プロフィールが設定されていません' });
        }
      } catch (err) {
        setProfile({ name: '未設定', bio: 'オフライン中です' });
      }
    };

    if (uid) {
      fetchUserProfile();
    }
  }, [uid]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white">
      <Header profileName={profile.name} profilePhotoURL={profile.photoURL} />
      <div className="max-w-md mx-auto p-4 pt-20 font-sans">
        <div className="p-4">
          {isCurrentUser && (
            <button
              onClick={() => navigate('/edit-profile')}
              className="bg-green-500 text-white px-4 py-2 rounded-2xl hover:bg-green-600 transition w-full mb-4"
            >
              ✏️ プロフィールを編集
            </button>
          )}
          <div className="bg-white p-4 rounded-lg shadow-md text-sm">
            <div className="flex items-center mb-2">
              <img
                src={profile.photoURL || '/default-icon.png'}
                alt="アイコン"
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">{profile.name}</p>
                <p className="text-gray-500">{profile.bio}</p>
              </div>
            </div>
          </div>
        </div>

        {!isCurrentUser && currentUserId && (
          <FollowButton currentUserId={currentUserId} targetUserId={uid} />
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold border-b pb-1 mb-2">投稿一覧</h3>
          {userPosts.length === 0 ? (
            <p className="text-sm text-gray-600">このユーザーの投稿はここに表示されます。</p>
          ) : (
            userPosts.map((post, index) => (
              <div key={index} className="mb-6 bg-white p-3 rounded shadow text-sm">
                <div className="text-gray-500 text-xs">{post.time}</div>
                <p className="mt-1">{post.text}</p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="投稿画像"
                    className="w-full mt-2 rounded"
                  />
                )}
                {post.videoUrl && (
                  <video controls className="w-full mt-2 rounded">
                    <source src={post.videoUrl} type="video/mp4" />
                  </video>
                )}
              </div>
            ))
          )}
        </div>

        {uid ? (
          <>
            <GiftForm toUser={uid} />
            <GiftList userId={uid} />
          </>
        ) : (
          <p className="text-sm">ユーザー情報を読み込み中です...</p>
        )}
      </div>
    </div>
  );
}

export default Profile;