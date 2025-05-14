import { useState } from "react";
import { db } from './FireBase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from './useAuth';

function GiftButton({ toUser }) {
  const [amount, setAmount] = useState(100);
  const [message, setMessage] = useState('');
  const user = useAuth();

  const handleSendGift = async () => {
    if (!user) return;

    await addDoc(collection(db, 'gifts'), {
      fromUser: user.email,
      toUser,
      amount,
      message,
      createdAt: serverTimestamp()
    });

    alert('🎁 ギフトを送信しました！');
    setMessage('');
  };

  return (
    <div>
      <input
        type="number"
        value={amount}
        min="50"
        onChange={(e) => setAmount(Number(e.target.value))}
        placeholder="金額"
      />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="メッセージ(任意)"
      />
      <button onClick={handleSendGift}>投げ銭🎁</button>
    </div>
  );
}

export default GiftButton;