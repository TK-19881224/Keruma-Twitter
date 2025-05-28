import React from "react";

const Terms = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">利用規約</h1>

      <p className="mb-4">
        この利用規約（以下、「本規約」といいます。）は、当社が提供するSNSアプリ「Keruma-Twitter」（以下、「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆さまには、本規約に従って本サービスをご利用いただきます。
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">第1条（適用）</h2>
      <p className="mb-4">
        本規約は、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されるものとします。
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">第2条（禁止事項）</h2>
      <p className="mb-4">
        ユーザーは、以下の行為をしてはなりません。
        <ul className="list-disc pl-5">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>当社のサービス運営を妨害する行為</li>
          <li>他のユーザーに不利益・損害を与える行為</li>
          <li>不正アクセスを試みる行為</li>
        </ul>
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">第3条（本サービスの提供の停止）</h2>
      <p className="mb-4">
        当社は、以下のいずれかに該当する場合には、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">第4条（免責事項）</h2>
      <p className="mb-4">
        当社は、本サービスに事実上または法律上の瑕疵がないことを保証しておりません。
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">第5条（著作権）</h2>
      <p className="mb-4">
        本サービス内でユーザーが投稿した文章・画像等の著作権は、投稿者に帰属しますが、当社は本サービスの運営・広報のためにこれを利用できるものとします。
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">第6条（準拠法・裁判管轄）</h2>
      <p className="mb-4">
        本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当社所在地を管轄する裁判所を専属的合意管轄とします。
      </p>

      <p className="mt-10 text-sm text-gray-500">
        制定日：2025年5月28日
        <br />
        お問い合わせ先：tomomitsu.keruma@gmail.com
      </p>
    </div>
  );
};

export default Terms;