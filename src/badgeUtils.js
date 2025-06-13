// src/badgeUtils.js
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./FireBase";

export function isEnglish(text) {
  return /[a-zA-Z]/.test(text);
}

export async function updateEnglishPostBadge(uid) {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    console.error("User not found");
    return;
  }

  const userData = userSnap.data();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = userData.englishPostStreak || 0;
  let lastPostDate = userData.lastEnglishPostDate ? userData.lastEnglishPostDate.toDate() : null;
  let postCount = userData.englishPostCount || 0;

  postCount += 1;

  if (lastPostDate) {
    lastPostDate.setHours(0, 0, 0, 0);
    const diffDays = (today - lastPostDate) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak += 1;
    } else if (diffDays === 0) {
      // 同じ日に複数投稿した場合は連続日数に影響なし
    } else {
      streak = 1;
    }
  } else {
    streak = 1;
  }

  await updateDoc(userRef, {
    englishPostCount: postCount,
    englishPostStreak: streak,
    lastEnglishPostDate: serverTimestamp(),
  });

  console.log(`Updated badge: Count=${postCount}, Streak=${streak}`);
}