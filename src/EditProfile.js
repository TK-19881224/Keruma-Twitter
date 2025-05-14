import React, { useState, useEffect } from 'react';
import { db } from './FireBase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { useNavigate } from 'react-router-dom';

function EditProfile() {
  const userId = localStorage.getItem('currentUserId');
  const [name, setName] = useState('');
  const [mail, setMail] = useState('');
  const [bio, setBio] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
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
    return <p className="text-red-500">ユーザーがログインしていません。</p>;
  }

  return (
    <div className="min-h-screen bg-blue-100 p-8 font-sans">
      <h2 className="text-xl font-bold mb-4">プロフィール編集</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="メールアドレス"
          value={mail}
          onChange={(e) => setMail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          placeholder="自己紹介"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <div>
          <label className="block mb-1">プロフィール画像</label>
          {photoURL && (
            <img src={photoURL} alt="プロフィール画像" className="w-24 h-24 rounded-full mb-2" />
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          保存
        </button>
        <button
          type="button"
          onClick={() => navigate(`/profile/${userId}`)}
          className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          プロフィールに戻る
        </button>
        {status && <p className="text-sm mt-2 ml-4">{status}</p>}
      </form>
    </div>
  );
}

export default EditProfile;