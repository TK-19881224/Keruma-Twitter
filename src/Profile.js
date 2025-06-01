import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './FireBase';
import Header from './Header';
import FollowButton from './FollowButton';
import ShareButtons from './ShareButtons';
import GiftButton from './GiftButton';
import GiftList from './GiftList';

function Profile({ currentUserId }) {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]); // ✅ 追加
  const baseUrl = window.location.origin; // ✅ 追加

  useEffect(() => {
    if (!uid) return;

    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        } else {
          setProfile({ name: '未設定', bio: 'プロフィールがありません' });
        }
      } catch (error) {
        setProfile({ name: 'エラー', bio: 'ユーザー情報の取得に失敗しました' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [uid]);

  // 投稿取得
  useEffect(() => {
    if (!uid) return;

    // 投稿取得部分（useEffect内）
    const fetchUserPosts = async () => {
      try {
        const postsQuery = query(collection(db, 'posts'), where('uid', '==', uid));
        const snapshot = await getDocs(postsQuery);
        const postsData = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            time: data.time && data.time.toDate ? data.time.toDate() : null,  // ← Timestamp → Dateに変換
          };
        });
        setUserPosts(postsData);
      } catch (error) {
        console.error("投稿取得エラー:", error);
        setUserPosts([]);
      }
    };

    fetchUserPosts();
  }, [uid]);

  if (loading) return <div>読み込み中...</div>;
  if (!profile) return <div>プロフィールが見つかりません</div>;

  const isCurrentUser = currentUserId === uid;

  return (
    <div className="bg-white min-h-screen">
      <Header profileName={profile.name} profilePhotoURL={profile.photoURL} />
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-200 via-blue-100 to-white p-8 font-sans pt-20">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 font-sans mt-6">

          {isCurrentUser && (
            <button
              onClick={() => navigate('/edit-profile')}
              className="bg-green-600 text-white text-sm px-3 py-1 rounded-md hover:bg-green-700 transition-shadow shadow-sm hover:shadow-md"
            >
              ✏️ プロフィール編集
            </button>
          )}

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

          {!isCurrentUser && currentUserId && (
            <FollowButton currentUserId={currentUserId} targetUserId={uid} />
          )}

          <div>
            <h3 className="text-lg font-semibold border-b pb-1 mb-2">投稿一覧</h3>
            {userPosts.length === 0 ? (
              <p className="text-sm text-gray-600">このユーザーの投稿はここに表示されます。</p>
            ) : (
              userPosts.map((post, index) => (
                <div key={index} className="mb-4 bg-gray-50 p-3 rounded shadow-sm text-sm">
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <div className="text-gray-500 text-xs">
                      {post.time
                        ? post.time.toLocaleString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '日時不明'}
                    </div>
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

                    <ShareButtons
                      url={`${baseUrl}/post/${post.id}`}
                      title={`Keruma SNSで面白い投稿を見つけました！「${post.text.slice(0, 30)}...」`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <GiftButton toUser={uid} />
          <GiftList toUser={uid} />
        </div>
      </div>
    </div>
  );
}

export default Profile;