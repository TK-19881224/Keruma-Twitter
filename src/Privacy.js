import React from "react";

const Privacy = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>

      <p className="mb-4">
        本プライバシーポリシーは、Keruma-Twitter（以下、「本サービス」といいます。）において提供されるすべてのサービスに関し、ユーザーの個人情報の取り扱いに関する方針を定めたものです。
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. 取得する情報</h2>
      <p className="mb-4">
        本サービスでは、Google認証などにより以下の情報を取得します。
        <ul className="list-disc pl-5">
          <li>氏名・ニックネーム</li>
          <li>メールアドレス</li>
          <li>プロフィール画像</li>
          <li>投稿内容、閲覧履歴などのサービス利用状況</li>
        </ul>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. 利用目的</h2>
      <p className="mb-4">
        取得した情報は以下の目的で利用します。
        <ul className="list-disc pl-5">
          <li>本サービスの提供・運営のため</li>
          <li>本人確認、ユーザーサポートのため</li>
          <li>サービス改善やマーケティング分析のため</li>
        </ul>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. 情報の第三者提供</h2>
      <p className="mb-4">
        取得した個人情報は、以下の場合を除き、第三者に提供することはありません。
        <ul className="list-disc pl-5">
          <li>法令に基づく場合</li>
          <li>ユーザーの同意がある場合</li>
        </ul>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. お問い合わせ</h2>
      <p className="mb-4">
        本ポリシーに関するお問い合わせは、下記メールアドレスまでお願いいたします。
        <br />
        <strong>Email:</strong> tomomitsu.keruma@gmail.com
      </p>

      <p className="mt-10 text-sm text-gray-500">
        制定日：2025年5月28日
      </p>
    </div>
  );
};

export default Privacy;