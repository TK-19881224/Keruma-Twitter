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
