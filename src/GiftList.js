import React, { useEffect, useState } from 'react';
import { query, collection, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './FireBase';

function GiftList({ toUser }) {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!toUser) return;

    const fetchGiftsWithSenderNames = async () => {
      setLoading(true);
      setError(null);
      try {
        const giftsQuery = query(collection(db, 'gifts'), where('toUser', '==', toUser));
        const snapshot = await getDocs(giftsQuery);

        const giftPromises = snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const createdAt = data.createdAt?.toDate?.() || null;

          let fromUserName = '不明';
          if (data.fromUser) {
            const userDoc = await getDoc(doc(db, 'users', data.fromUser));
            if (userDoc.exists()) {
              fromUserName = userDoc.data().name || '名前未設定';
            }
          }

          return {
            id: docSnap.id,
            ...data,
            createdAt,
            fromUserName,
          };
        });

        const giftsWithNames = await Promise.all(giftPromises);

        // ★ ここで並び替え（新しい順）
        const sortedGifts = giftsWithNames.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return b.createdAt - a.createdAt;
        });


        setGifts(giftsWithNames);
      } catch (err) {
        console.error('ギフト取得エラー:', err);
        setError('ギフトの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchGiftsWithSenderNames();
  }, [toUser]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold border-b pb-2 mb-4">受け取ったギフト</h3>

      {loading && <p className="text-sm text-gray-500">読み込み中...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && gifts.length === 0 && !error && (
        <p className="text-sm text-gray-600">まだギフトはありません。</p>
      )}

      {!loading &&
        gifts.map((gift) => (
          <div key={gift.id} className="mb-3 p-3 border rounded-lg bg-yellow-50 shadow-sm text-sm">
            <div className="font-medium">🎁 送信者: {gift.fromUserName}</div>
            <div>💰 金額: <span className="font-semibold">{gift.amount} 円</span></div>
            {gift.message && <div>📩 メッセージ: {gift.message}</div>}
            <div className="text-gray-500 text-xs mt-1">
              {gift.createdAt
                ? gift.createdAt.toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                : '日時不明'}
            </div>
          </div>
        ))}
    </div>
  );
}

export default GiftList;