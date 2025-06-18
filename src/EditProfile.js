import React, { useState, useEffect, useRef } from 'react'; // useRef を追加
import { db } from './FireBase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import BlockedUsersList from './BlockedUsersList';
import useAuth from './useAuth';



function EditProfile() {
  const currentUser = useAuth(); // ✅ 正しい位置
  const userId = currentUser?.uid;

  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const [nativeLanguage, setNativeLanguage] = useState('');
  const [toeicScore, setToeicScore] = useState('');
  const [eikenGrade, setEikenGrade] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [hasTeachingCert, setHasTeachingCert] = useState(false);
  const [englishPostCount, setEnglishPostCount] = useState('');
  const [englishPostStreak, setEnglishPostStreak] = useState('');

  // ✅ 追加: 各入力欄のref
  const nameRef = useRef(null);
  const mailRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setMail(data.mail || '');
          setBio(data.bio || '');
          setPhotoURL(data.photoURL || '');

          setNativeLanguage(data.nativeLanguage || '');
          setToeicScore(data.toeicScore || '');
          setEikenGrade(data.eikenGrade || '');
          setExperienceYears(data.experienceYears || '');
          setHasTeachingCert(data.hasTeachingCert || false);
          setEnglishPostCount(data.englishPostCount || '');
          setEnglishPostStreak(data.englishPostStreak || '');

          // ✅ フォーカス
          setTimeout(() => {
            nameRef.current?.focus();
          }, 100);

        }
        // ✅ 初回ロード時、名前欄にフォーカス
        setTimeout(() => {
          nameRef.current?.focus();
        }, 100);
      } catch (err) {
        console.error('プロフィール取得エラー:', err);
        setStatus('❌ プロフィールの取得に失敗しました。');
      }
    };
    fetchProfile();
  }, [userId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setStatus('❌ ユーザーIDが無効です。');
      return;
    }

    // ✅ 入力チェックとフォーカス制御
    if (name.trim() === '') {
      setStatus('❌ 名前を入力してください。');
      nameRef.current?.focus();
      return;
    }
    if (mail.trim() === '') {
      setStatus('❌ メールアドレスを入力してください。');
      mailRef.current?.focus();
      return;
    }

    try {
      let updatedPhotoURL = photoURL;

      if (imageFile) {
        const storage = getStorage();
        const imageRef = ref(storage, `userIcons/${userId}`);
        await uploadBytes(imageRef, imageFile);
        updatedPhotoURL = await getDownloadURL(imageRef);
        setPhotoURL(updatedPhotoURL);
      }

      await setDoc(
        doc(db, 'users', userId),
        {
          name,
          mail,
          bio,
          photoURL: updatedPhotoURL,
          nativeLanguage,
          toeicScore: toeicScore ? Number(toeicScore) : null,
          eikenGrade,
          experienceYears: experienceYears ? Number(experienceYears) : null,
          hasTeachingCert,
          englishPostCount: englishPostCount ? Number(englishPostCount) : null,
          englishPostStreak: englishPostStreak ? Number(englishPostStreak) : null
        },
        { merge: true }

      );

      setStatus('✅ プロフィールを更新しました！');
    } catch (err) {
      console.error('更新エラー:', err.code || err.message, err);
      setStatus(`❌ 更新に失敗しました: ${err.message}`);
    }
  };

  if (!userId) {
    return <p className="text-orange-500 px-4 mt-8">ユーザーがログインしていません。</p>;
  }





  return (
    <>
      <div className="bg-white min-h-screen">
        <Header profileName={name} profilePhotoURL={photoURL} />
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-orange-200 via-orange-100 to-white px-4 py-10 font-sans mt-16 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            <input
              type="text"
              placeholder="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              ref={nameRef} // ✅ ref追加
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-orange-400"
            />
            <input
              type="text"
              placeholder="メールアドレス"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              ref={mailRef} // ✅ ref追加
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-orange-400"
            />
            <textarea
              placeholder="自己紹介"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-orange-400"
            />
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt="アイコン"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                    なし
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm"
              />
            </div>
            <h4 className="font-semibold text-gray-700 mt-6">🌍 英語スキル情報</h4>

            <input
              type="text"
              placeholder="母国語（例: 日本語）"
              value={nativeLanguage}
              onChange={(e) => setNativeLanguage(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <input
              type="number"
              placeholder="TOEICスコア（例: 800）"
              value={toeicScore}
              onChange={(e) => setToeicScore(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <input
              type="text"
              placeholder="英検級（例: 準1級）"
              value={eikenGrade}
              onChange={(e) => setEikenGrade(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <input
              type="number"
              placeholder="英語使用年数（例: 3）"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hasTeachingCert}
                onChange={(e) => setHasTeachingCert(e.target.checked)}
              />
              <span>英語教師資格あり</span>
            </label>

            <div className="p-4">
              <BlockedUsersList />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => navigate(`/profile/${userId}`)}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              プロフィールに戻る
            </button>
            {status && <p className="text-sm text-center mt-2">{status}</p>}
          </form>
        </div>
      </div>
    </>
  );
}

export default EditProfile;