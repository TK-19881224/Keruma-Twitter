import React, { useState } from 'react';

export const TranslateButton = ({ text, targetLang = 'en' }) => {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);

  const translateText = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5001/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: text,
          source: 'auto',
          target: targetLang,
          format: 'text'
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || res.statusText);

      setTranslated(json.translatedText);
    } catch (e) {
      console.error("翻訳エラー:", e);
      alert(`翻訳に失敗しました: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // ← 追加！
          translateText();
        }}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? '翻訳中...' : '翻訳する'}
      </button>
      {translated && (
        <div className="mt-2 p-2 bg-gray-100 border rounded">
          <p className="text-sm text-gray-700">翻訳結果:</p>
          <p className="text-base">{translated}</p>
        </div>
      )}
    </div>
  );
};