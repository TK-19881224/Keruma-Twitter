import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './FireBase';
import { auth } from './FireBase';
import { getOrCreateAnonymousId } from './utils';

export const recordPageView = async () => {
  const user = auth.currentUser;
  const userId = user ? user.uid : getOrCreateAnonymousId();

  console.log('recordPageView called, userId:', userId);

  try {
    await setDoc(doc(db, 'pageViews', userId), {
      timestamp: serverTimestamp(),
      anonymous: !user,
    }, { merge: true });
    console.log('ページビューを記録しました');
  } catch (error) {
    console.error('ビュー記録エラー:', error);
  }
};