import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from './FireBase';
import Header from './Header';
import FollowButton from './FollowButton';
import GiftButton from './GiftButton';
import GiftList from './GiftList';
import PostCard from './PostCard';
import { getAuth } from 'firebase/auth';

function determineRole(user) {
  const {
    toeicScore,
    eikenGrade,
    experienceYears,
    nativeLanguage,
    hasTeachingCert,
    postCount
  } = user;

  if (hasTeachingCert) return "certified_teacher";
  if (nativeLanguage === "English") return "native";
  if (toeicScore >= 900 || eikenGrade === "1級" || experienceYears >= 5 || postCount >= 2000)
    return "expert";
  if (toeicScore >= 700 || eikenGrade === "準1級" || experienceYears >= 3 || postCount >= 500)
    return "advanced";
  if (toeicScore >= 400 || experienceYears >= 1 || postCount >= 100)
    return "intermediate";

  return "beginner";
}

function Profile({ currentUserId }) {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState([]);
  const baseUrl = window.location.origin;
  const auth = getAuth();

  const handleDelete = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      setUserPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      console.log("投稿を削除しました:", postId);
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  const getUserPostsWithProfile = async (uid, setUserPosts) => {
    const q = query(collection(db, "posts"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    const postsWithUserData = await Promise.all(
      querySnapshot.docs.map(async (docSnap) => {
        const postData = docSnap.data();
        const userRef = doc(db, "users", postData.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists()
          ? {
            ...userSnap.data(),
            icon: userSnap.data().photoURL || "/default-icon.png"
          }
          : {
            uid: postData.uid,
            name: "不明",
            icon: "/default-icon.png"
          };
        return {
          ...postData,
          id: docSnap.id,
          time: postData.time && postData.time.toDate ? postData.time.toDate() : null,
          user: userData,
        };
      })
    );
    postsWithUserData.sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return b.time - a.time;
    });
    setUserPosts(postsWithUserData);
  };

  useEffect(() => {
    if (!uid) return;
    getUserPostsWithProfile(uid, setUserPosts);
  }, [uid]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!uid) return;
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfile(userSnap.data());
      } else {
        setProfile(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [uid]);

  if (loading) return <div>読み込み中...</div>;
  if (!profile) return <div>プロフィールが見つかりません</div>;

  const isCurrentUser = currentUserId === uid;

  return (
    <div className="bg-white min-h-screen">
      <Header profileName={profile.name} profilePhotoURL={profile.photoURL} />
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-200 via-orange-100 to-white p-8 font-sans pt-20">
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 font-sans mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">プロフィール</h2>
            {isCurrentUser && (
              <button
                onClick={() => navigate('/edit-profile')}
                className="bg-orange-600 text-white text-sm px-3 py-1 rounded-md hover:bg-orange-700 transition-shadow shadow-sm hover:shadow-md"
              >
                ✏️ プロフィール編集
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border mr-2">
              <img
                src={profile.photoURL}
                alt="アイコン"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold">{profile.name}</p>
              <p className="text-gray-500 text-sm">{profile.bio}</p>

              {(profile.toeicScore !== undefined ||
                profile.eikenGrade ||
                profile.experienceYears !== undefined ||
                profile.nativeLanguage ||
                profile.hasTeachingCert ||
                profile.englishPostCount !== undefined ||
                profile.englishPostStreak !== undefined) && (
                  <div className="text-sm text-gray-700 space-y-1 mt-2">
                    <h4 className="font-semibold text-gray-700 mb-1">🌍 英語スキル情報</h4>
                    <p>🧠 英語レベル: <strong>{determineRole(profile)}</strong></p>
                    {profile.nativeLanguage && <p>🗣️ 母国語: {profile.nativeLanguage}</p>}
                    {profile.toeicScore !== undefined && <p>📊 TOEICスコア: {profile.toeicScore}</p>}
                    {profile.eikenGrade && <p>📝 英検: {profile.eikenGrade}</p>}
                    {profile.experienceYears !== undefined && <p>📆 使用経験: {profile.experienceYears}年</p>}
                    {profile.hasTeachingCert && <p>🎓 英語教師資格: あり</p>}
                    {profile.englishPostCount !== undefined && <p>📝 英語投稿回数: {profile.englishPostCount}回</p>}
                    {profile.englishPostStreak !== undefined && <p>🔥 連続英語投稿日数: {profile.englishPostStreak}日</p>}
                  </div>
                )}
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
                <PostCard
                  key={post.id}
                  post={post} from="profile"
                  index={index}
                  user={post.user} // ← 修正
                  onLike={() => console.log('いいね:', post.id)}
                  onDelete={() => handleDelete(post.id)}
                  onBlock={(blockedUid, postUid) => console.log('ブロック:', blockedUid, postUid)}
                  onReport={(reason, postId) => console.log('通報:', reason, postId)}
                  navigate={(path) => navigate(path)}
                  baseUrl={baseUrl} // ← 修正
                />
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