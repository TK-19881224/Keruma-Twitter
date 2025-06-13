const admin = require('firebase-admin');
const fs = require('fs');

// サービスアカウントキーの読み込み
const serviceAccount = require('./serviceAccountKey.json');

// Firebase 初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// JSONファイルの読み込み
const words = JSON.parse(fs.readFileSync('./toeicWords.json', 'utf8'));

const uploadWords = async () => {
  const batch = db.batch();
  const collectionRef = db.collection('toeicWords');

  words.forEach((word, index) => {
    const docRef = collectionRef.doc(String(index + 1).padStart(3, '0')); // 例: "001"
    batch.set(docRef, word);
  });

  try {
    await batch.commit();
    console.log('✅ 全てのTOEIC単語がアップロードされました。');
  } catch (error) {
    console.error('❌ アップロード中にエラーが発生しました:', error);
  }
};

uploadWords();