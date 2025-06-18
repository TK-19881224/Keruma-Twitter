import React from 'react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">DAILY BOOTとは？</h1>
      <p className="text-lg mb-6">
        「DAILY BOOT」は、英語学習のモチベーションを高めるためのSNSアプリです。
        英語でのつぶやきや、TOEIC単語投稿、ネイティブや上級者との交流を通して、楽しみながら英語力をアップさせましょう！
      </p>
      <ul className="list-disc pl-5 text-lg mb-6">
        <li>英語プロフィール・レベルバッジ</li>
        <li>TOEIC単語の自動投稿（毎日更新）</li>
        <li>英語投稿回数・連続日数の表示</li>
        <li>投稿・フォロー・いいね・コメント・ギフティング</li>
        <li>英語学習に役立つニュース機能も搭載！</li>
      </ul>
      <p className="text-md text-gray-600">
        開発者: Tomomitsu（@GitHub）<br />
        公開URL: <a className="text-orange-500 underline" href="https://keruma-twitter.vercel.app">keruma-twitter.vercel.app</a>
      </p>
    </div>
  );
}