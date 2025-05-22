import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from './FireBase';
import { PostContext } from './PostContext';
import FollowButton from './FollowButton';
import Header from './Header';

// ギフト一覧
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
    <div className="bg-white p-4 rounded shadow mt-6">
      <h4 className="font-semibold mb-2">🎁 受け取ったギフト</h4>
      <ul className="text-sm space-y-1">
        {gifts.map((gift, i) => (
          <li key={i} className="bg-gray-50 p-2 rounded border">
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
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold mb-2">🎁 ギフトを送る</h4>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="あなたの名前"
          value={fromUser}
          onChange={(e) => setFromUser(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="金額(コイン)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="メッセージ"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        <button
          type="submit"
          className="bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
        >
          ギフト送信
        </button>
        {status && <p className="text-sm mt-1">{status}</p>}
      </form>
    </div>
  );
}

// プロフィールページ全体
export default function Profile() {
  const { uid } = useParams();
  const { posts } = useContext(PostContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUser(docSnap.data());
      }
    };
    fetchUser();
  }, [uid]);

  const userPosts = posts.filter((post) => post.uid === uid);

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {user && (
          <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center gap-4">
              <img src={user.iconURL} alt="icon" className="w-16 h-16 rounded-full" />
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-gray-600">{user.profile}</p>
              </div>
            </div>
            <div className="mt-4">
              <FollowButton targetUid={uid} />
            </div>
          </div>
        )}

        <GiftForm toUser={uid} />
        <GiftList userId={uid} />

        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">📝 投稿一覧</h4>
          <ul className="space-y-2">
            {userPosts.map((post) => (
              <li key={post.id} className="border p-3 rounded">
                {post.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}