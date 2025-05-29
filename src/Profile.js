
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostContext } from './PostContext';
import { collection, query, where, getDocs, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from './FireBase';
import FollowButton from './FollowButton';
import Header from './Header';
import ShareButtons from './ShareButtons';

function Profile() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { posts } = useContext(PostContext);
  const currentUserId = localStorage.getItem('currentUserId');
  const isCurrentUser = String(currentUserId) === String(uid);
  const userPosts = posts.filter((post) => post.uid === uid);
  const [profile, setProfile] = useState({ name: '', bio: '', photoURL: '' });
  const [loading, setLoading] = useState(true);
  const url = window.location.href; // ✅ 現在のページURL
  const title = "Keruma SNSで面白い投稿を見つけました！"; // ✅ 任意のタイトル

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!uid) return;

    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfile(userSnap.data());
        } else {
          setProfile({ name: '未設定', bio: 'プロフィールが設定されていません' });
        }
      } catch (err) {
        console.error('プロフィール取得エラー:', err);
        setProfile({ name: '未設定', bio: 'エラーが発生しました' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        ユーザー情報を読み込み中です...
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Header profileName={profile.name} profilePhotoURL={profile.photoURL} />
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-200 via-blue-100 to-white p-8 font-sans pt-20">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 font-sans mt-6">

            {/* 編集ボタン */}
            {isCurrentUser && (
              <button
                onClick={() => navigate('/edit-profile')}
                className="bg-green-600 text-white text-sm px-3 py-1 rounded-md hover:bg-green-700 transition-shadow shadow-sm hover:shadow-md"
              >
                ✏️ プロフィール編集
              </button>
            )}

            {/* プロフィール情報 */}
            <div className="flex items-center space-x-4">
              <img
                src={profile.photoURL || '/default-icon.png'}
                alt="アイコン"
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full"
              />
              <div>
                <p className="font-semibold">{profile.name}</p>
                <p className="text-gray-500 text-sm">{profile.bio}</p>
              </div>
            </div>

            {/* フォローボタン */}
            {!isCurrentUser && currentUserId && (
              <FollowButton currentUserId={currentUserId} targetUserId={uid} />
            )}

            {/* 投稿一覧 */}
            <div>
              <h3 className="text-lg font-semibold border-b pb-1 mb-2">投稿一覧</h3>
              {userPosts.length === 0 ? (
                <p className="text-sm text-gray-600">このユーザーの投稿はここに表示されます。</p>
              ) : (
                userPosts.map((post, index) => {
                  const postUrl = `${window.location.origin}/profile/${uid}`;
                  return (
                    <div key={index} className="mb-4 bg-gray-50 p-3 rounded shadow-sm text-sm">
                      <div className="text-gray-500 text-xs">{post.time}</div>
                      <p className="mt-1">{post.text}</p>

                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt="投稿画像"
                          className="w-full max-w-xs sm:max-w-md mt-2 rounded object-contain"
                          style={{ maxHeight: '200px' }}
                        />
                      )}

                      {post.videoUrl && (
                        <video
                          controls
                          className="w-full max-w-xs sm:max-w-md mt-2 rounded"
                          style={{ maxHeight: '200px' }}
                        >
                          <source src={post.videoUrl} type="video/mp4" />
                        </video>
                      )}

                      <div className="mt-2">
                        <ShareButtons url={postUrl} title={`Keruma SNSの投稿：${post.text.slice(0, 20)}...`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ギフト */}
            {uid && (
              <>
                <GiftForm toUser={uid} />
                <GiftList userId={uid} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GiftForm({ toUser }) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const currentUserId = localStorage.getItem('currentUserId');

  const handleGift = async () => {
    if (!currentUserId || !amount) return;
    try {
      await addDoc(collection(db, 'gifts'), {
        fromUser: currentUserId,
        toUser,
        amount: Number(amount),
        message,
        createdAt: Timestamp.now(),
      });
      setAmount('');
      setMessage('');
      alert('ギフトを送信しました');
    } catch (error) {
      console.error('ギフト送信エラー:', error);
    }
  };

  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-1">🎁 ギフトを送る</h4>
      <input
        type="number"
        placeholder="金額"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-1 mr-2 rounded w-24"
      />
      <input
        type="text"
        placeholder="メッセージ（任意）"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border p-1 rounded w-64"
      />
      <button
        onClick={handleGift}
        className="ml-2 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
      >
        送る
      </button>
    </div>
  );
}

function GiftList({ userId }) {
  const [gifts, setGifts] = useState([]);

  useEffect(() => {
    const fetchGifts = async () => {
      const q = query(collection(db, 'gifts'), where('toUser', '==', userId));
      const querySnapshot = await getDocs(q);
      const giftData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGifts(giftData);
    };
    fetchGifts();
  }, [userId]);

  return (
    <div className="mt-6">
      <h4 className="font-semibold mb-1">🎁 受け取ったギフト</h4>
      {gifts.length === 0 ? (
        <p className="text-sm text-gray-500">まだギフトはありません</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {gifts.map((gift) => (
            <li key={gift.id} className="border p-2 rounded shadow-sm">
              <p>
                <strong>送信者:</strong> {gift.fromUser} / <strong>金額:</strong> {gift.amount}
              </p>
              {gift.message && <p className="text-gray-600 mt-1">💬 {gift.message}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Profile;