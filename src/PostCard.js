import React from 'react';
import ShareButtons from './ShareButtons';
import { TranslateButton } from './TranslateButton';

const PostCard = ({
  post,
  index,
  user,
  profileName,
  onLike,
  onDelete,
  onBlock,
  onReport,
  navigate,
  baseUrl
}) => {
  if (!post) return null; // 安全策

  const isOwnPost = user && post.uid === user.uid;

  return (
    <div className="p-4 border-b border-gray-300 hover:bg-gray-100 transition duration-200 rounded-md">
      <div className="flex items-center mb-2">
        <div
          className="flex items-center cursor-pointer text-blue-500"
          onClick={() => post.uid && navigate(`/profile/${post.uid}`)}
        >
          <img
            src={post.photoURL || "/default-icon.png"}
            alt="アイコン"
            className="w-8 h-8 rounded-full mr-2"
          />
          <p className="font-semibold text-sm">{post.displayName}</p>
        </div>
      </div>

      <div className="cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
        <p className="mb-2">{post.text}</p>

        {/* 翻訳ボタン */}
        <TranslateButton text={post.text} targetLang="ja" />

        {post.imageUrl && (
          <img src={post.imageUrl} alt="投稿画像" className="rounded-md max-w-full mb-2" />
        )}
        {post.videoUrl && (
          <video controls className="rounded-md max-w-full mb-2">
            <source src={post.videoUrl} type="video/mp4" />
            お使いのブラウザは video タグをサポートしていません。
          </video>
        )}
        <p className="text-xs text-gray-500 mb-2">
          {post.time ? post.time.toLocaleString() : '日時不明'}
        </p>

        <div className="flex flex-wrap items-center space-x-4 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(index);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-200 shadow-md"
          >
            ❤️ {post.likes}
          </button>

          {isOwnPost && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-200 shadow-md"
            >
              🗑️
            </button>
          )}

          <p className="text-sm text-gray-600 mt-2">コメント数: {post.commentCount || 0}</p>

          <ShareButtons
            url={`${baseUrl}/post/${post.id}`}
            title={`Keruma SNSで面白い投稿を見つけました！「${post.text.slice(0, 30)}...」`}
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              const reason = prompt("通報理由を入力してください（例: 不適切な内容）");
              if (reason) onReport(reason, post.id); // post.idも渡す
            }}
            className="text-red-500 hover:underline ml-4"
          >
            🚩 通報
          </button>

          {!isOwnPost && user && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("このユーザーをブロックしますか？")) {
                  onBlock(user.uid, post.uid);
                }
              }}
              className="text-gray-500 hover:underline ml-4"
            >
              🚫 ブロック
            </button>
          )}
        </div>

        {(index + 1) % 3 === 0 && (
          <div className="p-4 my-4 bg-gray-100 border text-center">
            <p className="font-bold">スポンサーリンク</p>
            <a href="https://qiita.com/Tomomitsu_Keruma" target="_blank" rel="noopener noreferrer">
              <img src="/Qiita_keruma_image.png" alt="広告" className="mx-auto max-w-full h-auto" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;