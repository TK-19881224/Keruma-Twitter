import React, { useState, useEffect } from 'react';
import { db } from './FireBase';
import { collection, getDocs } from 'firebase/firestore';

function TodayToeicWord() {
  const [word, setWord] = useState(null);

  useEffect(() => {
    const fetchWords = async () => {
      const snapshot = await getDocs(collection(db, 'toeicWords'));
      const words = snapshot.docs.map(doc => doc.data());

      if (words.length > 0) {
        // 📅 今日の日付でインデックスを計算
        const today = new Date();
        const index = today.getFullYear() * 1000 + today.getMonth() * 31 + today.getDate();
        const wordIndex = index % words.length;
        setWord(words[wordIndex]);
      }
    };

    fetchWords();
  }, []);

  if (!word) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-6">
      <h3 className="text-lg font-bold mb-1">📘 今日のTOEIC単語</h3>
      <p className="text-md">
        <strong>{word.word}</strong>: {word.definition}
      </p>
      <p className="text-sm italic mt-1">例文: {word.example}</p>
      <p className="text-sm italic mt-1">訳: {word.translation}</p>
    </div>
  );
}

export default TodayToeicWord;