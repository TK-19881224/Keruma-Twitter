// src/About.js
import React from 'react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Keruma-Twitterとは？</h1>
      <p className="text-lg mb-6">
        「つぶやき」は、シンプルで使いやすいSNSアプリです。画像や動画を投稿して、気軽につぶやき、他のユーザーとつながりましょう。
      </p>
      <ul className="list-disc pl-5 text-lg mb-6">
        <li>ログイン・プロフィール編集</li>
        <li>画像・動画付き投稿</li>
        <li>フォロー・いいね機能</li>
        <li>通知・コメント・ギフティング機能</li>
        <li>ニュースも搭載！</li>
      </ul>
      <p className="text-md text-gray-600">
        開発者: Tomomitsu（@GitHub）<br />
        公開URL: <a className="text-blue-500 underline" href="https://keruma-twitter.vercel.app">keruma-twitter.vercel.app</a>
      </p>
    </div>
  );
}