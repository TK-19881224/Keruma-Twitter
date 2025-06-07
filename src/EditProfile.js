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
import  useAuth  from './useAuth';



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
        { name, mail, bio, photoURL: updatedPhotoURL },
        { merge: true }
      );

      setStatus('✅ プロフィールを更新しました！');
    } catch (err) {
      console.error('更新エラー:', err.code || err.message, err);
      setStatus(`❌ 更新に失敗しました: ${err.message}`);
    }
  };

  if (!userId) {
    return <p className="text-red-500 px-4 mt-8">ユーザーがログインしていません。</p>;
  }




  return (
    <>
      <div className="bg-white min-h-screen">
        <Header profileName={name} profilePhotoURL={photoURL} />
        <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-200 via-blue-100 to-white px-4 py-10 font-sans mt-16 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            <input
              type="text"
              placeholder="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              ref={nameRef} // ✅ ref追加
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-400"
            />
            <input
              type="text"
              placeholder="メールアドレス"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              ref={mailRef} // ✅ ref追加
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-400"
            />
            <textarea
              placeholder="自己紹介"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-400"
            />
            <div>
              <label className="block mb-1 text-gray-700 font-medium">プロフィール画像</label>
              {photoURL && (
                <img src={photoURL} alt="プロフィール画像" className="w-20 h-20 rounded-full mb-2 border" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm"
              />
            </div>
            <div className="p-4">
              <BlockedUsersList />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
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