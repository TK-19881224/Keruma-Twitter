import { useParams, useNavigate } from 'react-router-dom';
import { PostContext } from './PostContext';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './FireBase';
import { useEffect, useState, useContext } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import FollowButton from './FollowButton';


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
    <div >
      <h4>🎁 受け取ったギフト</h4>
      <ul>
        {gifts.map((gift, i) => (
          <li key={i}>
            {gift.fromUser} さんから{gift.amount} コイン「{gift.message}」
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
    <div>
      <h4>🎁 ギフトを送る</h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="あなたの名前"
          value={fromUser}
          onChange={(e) => setFromUser(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
        <input
          type="number"
          placeholder="金額(コイン)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
        <input
          type="text"
          placeholder="メッセージ"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
        <button
          type="submit"
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ギフト送信
        </button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
}

function Profile() {
  const { uid } = useParams(); // ← ここで uid を取得
  const navigate = useNavigate();
  const { posts } = useContext(PostContext);
  const currentUserId = localStorage.getItem('currentUserId'); // 現在のユーザーIDを取得
  const isCurrentUser = String(currentUserId) === String(uid);

  // ログ
  console.log('currentUserId:', currentUserId);
  console.log('userId:', uid);
  console.log('typeof currentUserId:', typeof currentUserId);
  console.log('typeof userId:', typeof uid);
  console.log('一致してる？', currentUserId === uid);


  const userPosts = posts.filter((post) => post.user === uid);

  const [profile, setProfile] = useState({ name: '', bio: '', photoURL: '' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const isOnline = window.navigator.onLine;
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef, { source: isOnline ? 'default' : 'cache' });

        if (userSnap.exists()) {
          setProfile(userSnap.data());
          console.log('取得したプロフィール:', userSnap.data());  // ここを追加して取得したデータを確認
        } else {
          console.log("ユーザーが見つかりません");
          setProfile({ name: '未設定', bio: 'プロフィールが設定されていません' });
        }
      } catch (err) {
        console.warn("プロフィール取得エラー:", err);
        setProfile({ name: '未設定', bio: 'オフライン中です' });
      }
    };

    if (uid) {
      fetchUserProfile();
    }
  }, [uid]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-white p-8 font-sans">
      <button
        onClick={() => navigate('/')}
        style={{
          marginBottom: '1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        投稿画面に戻る
      </button>

      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">プロフィール</h2>
        {isCurrentUser && (
          <button
            onClick={() => navigate('/edit-profile')}
            className="bg-green-500 text-white px-4 py-2 rounded-2xl hover:bg-green-600 transition duration-200 shadow-md mb-4"
          >
            ✏️ プロフィールを編集
          </button>
        )}
        {profile ? (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <img
              src={profile.photoURL || '/default-icon.png'}
              alt="アイコン"
              className='w-8 h-8 rounded-full inline-block mr-2'
            />
            <p><strong>名前：</strong>{profile.name}</p>
            <p><strong>自己紹介：</strong>{profile.bio}</p>
          </div>
        ) : (
          <p>読み込み中...</p>
        )}
      </div>

      {/* currentUserId と userId が異なる場合にフォローボタンを表示 */}
      {currentUserId && currentUserId !== uid && (
        <FollowButton currentUserId={currentUserId} targetUserId={uid} />
      )}

      <div>
        <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>投稿一覧</h3>
        {userPosts.length === 0 ? (
          <p>このユーザーの投稿はここに表示されます。</p>
        ) : (
          userPosts.map((post, index) => (
            <div key={index} style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>{post.time}</div>
              <p>{post.text}</p>
              {post.imageUrl && (
                <video controls style={{ maxWidth: '100%' }}>
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
        <p>ユーザー情報を読み込み中です...</p>
      )}
    </div>
  );
}

export default Profile;