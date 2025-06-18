import { useState } from "react";
import { db } from './FireBase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import useAuth from './useAuth';

function GiftButton({ toUser }) {
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState('');
  const user = useAuth();

  const handleSendGift = async () => {
    if (!user) return;

    await addDoc(collection(db, 'gifts'), {
      fromUser: user.uid,
      toUser,
      amount,
      message,
      createdAt: serverTimestamp()
    });

    alert('🎁 ギフトを送信しました！');
    setMessage('');
    setAmount(100);
  };

  // 👇 JSXは return の中に入れる必要があります！
  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-lg space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">ギフトを送る</h2>

      {/* 横並びにする部分 */}
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">

        {/* 金額入力 */}
        <div className="w-full sm:w-1/5">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            金額（50円以上）
          </label>
          <input
            id="amount"
            type="number"
            min="50"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* メッセージ入力 */}
        <div className="w-full sm:w-2/5">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            メッセージ（任意）
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="感謝の気持ちなど..."
            className="w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={1}
          />
        </div>

        {/* 送信ボタン */}
        <div className="w-full sm:w-1/5 mt-4 sm:mt-6">
          <button
            onClick={handleSendGift}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-2 rounded-md shadow-md hover:from-pink-600 hover:to-purple-700 transition-colors"
          >
            送信🎁
          </button>
        </div>
      </div>
    </div>
  );
}

export default GiftButton;