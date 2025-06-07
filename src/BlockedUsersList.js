import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './FireBase';
import useAuth from './useAuth';

export default function BlockedUsersList() {
  const currentUser = useAuth(); // useAuthはユーザー情報（オブジェクト or null）を返す

  // 状態管理
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    if (!currentUser) return; // ログインしていなければ何もしない

    const fetchBlockedUsers = async () => {
      try {
        const blockRef = collection(db, 'users', currentUser.uid, 'blocks');
        const snapshot = await getDocs(blockRef);
        const blocks = [];

        for (const docSnap of snapshot.docs) {
          const blockedUserId = docSnap.id;
          const userDoc = await getDoc(doc(db, 'users', blockedUserId));
          if (userDoc.exists()) {
            blocks.push({
              uid: blockedUserId,
              name: userDoc.data().name || '不明',
              icon: userDoc.data().icon || '',
            });
          }
        }

        setBlockedUsers(blocks);
      } catch (err) {
        console.error('ブロックユーザーの取得に失敗しました:', err);
      }
    };

    fetchBlockedUsers();
  }, [currentUser]);

  const handleUnblock = async (blockedUserId) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'blocks', blockedUserId));
      setBlockedUsers((prev) => prev.filter(user => user.uid !== blockedUserId));
      alert('ブロックを解除しました');
    } catch (err) {
      console.error('解除失敗:', err);
      alert('解除に失敗しました');
    }
  };

  if (!currentUser) {
    return <p>ログインしてください</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">ブロックしたユーザー</h2>
      {blockedUsers.length === 0 ? (
        <p>ブロックしているユーザーはいません。</p>
      ) : (
        <ul className="space-y-4">
          {blockedUsers.map(user => (
            <li key={user.uid} className="flex items-center space-x-4">
              <img
                src={user.icon || '/default-icon.png'}
                alt={user.name}
                className="w-10 h-10 rounded-full"
              />
              <span className="flex-1">{user.name}</span>
              <button
                onClick={() => handleUnblock(user.uid)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                解除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}