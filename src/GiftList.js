import React, { useEffect, useState } from 'react';
import { query, collection, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './FireBase';

function GiftList({ toUser }) {
  const [gifts, setGifts] = useState([]);

  useEffect(() => {
    if (!toUser) return;

    const fetchGiftsWithSenderNames = async () => {
      try {
        // ギフト一覧取得
        const giftsQuery = query(collection(db, 'gifts'), where('toUser', '==', toUser));
        const snapshot = await getDocs(giftsQuery);

        const giftPromises = snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;

          // fromUserのユーザー名取得
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
        setGifts(giftsWithNames);
      } catch (error) {
        console.error('ギフト取得エラー:', error);
        setGifts([]);
      }
    };

    fetchGiftsWithSenderNames();
  }, [toUser]);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold border-b pb-1 mb-2">受け取ったギフト</h3>
      {gifts.length === 0 ? (
        <p className="text-sm text-gray-600">まだギフトはありません。</p>
      ) : (
        gifts.map((gift) => (
          <div key={gift.id} className="mb-2 p-2 border rounded bg-yellow-50 text-sm">
            <div><strong>送信者:</strong> {gift.fromUserName}</div>
            <div><strong>金額:</strong> {gift.amount} 円</div>
            {gift.message && <div><strong>メッセージ:</strong> {gift.message}</div>}
            <div className="text-gray-500 text-xs">
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
        ))
      )}
    </div>
  );
}

export default GiftList;