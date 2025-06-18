import React, { useState } from 'react';
import ShareButtons from './ShareButtons';
import { TranslateButton } from './TranslateButton';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const PostCard = ({
  post,
  index,
  user,
  onLike,
  onDelete,
  onBlock,
  onReport,
  navigate,
  baseUrl,
  showProfileInfo = true,
  from = "profile"  // 追加: 呼び出し元を指定、デフォルトは "profile"
}) => {


  if (!post) {
    return <div className="p-4 text-gray-500">投稿が見つかりません</div>;
  }

  const isOwnPost = user && post.uid === user.uid;


  // 投稿詳細へ遷移
  const goToPostDetail = (e) => {
    e.stopPropagation();
    if (post.id) {
      navigate(`/post/${post.id}`);
    } else {
      console.warn("post.id がありません");
    }
  };

  // プロフィールへ遷移
  const goToProfile = (e) => {
    e.stopPropagation();
    if (post.uid) {
      navigate(`/profile/${post.uid}`);
    } else {
      console.warn("post.uid がありません");
    }
  };

  const userImageUrl = from === "home" ? (post.photoURL || "/default-icon.png") : (post.user?.icon || "/default-icon.png");

  return (
    <div className="p-4 border-b border-gray-300 hover:bg-gray-100 transition duration-200 rounded-md">
      <div
        className="flex items-center cursor-pointer text-orange-500 mb-2"
        onClick={goToProfile}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && goToProfile(e)}
      >
        <div className="w-12 h-12 rounded-full overflow-hidden border mr-2">
          <img
            src={userImageUrl || "/default-icon.png"}
            alt="ユーザーアイコン"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="font-semibold text-sm">{post.displayName}</p>
      </div>

      <div className="cursor-pointer" onClick={goToPostDetail} role="button" tabIndex={0} onKeyPress={(e) => e.key === 'Enter' && goToPostDetail(e)}>
        <p className="mb-2">{post.text}</p>

        <TranslateButton text={post.text} targetLang="ja" />

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="投稿画像"
            className="rounded-md max-w-full mb-2"
            onClick={(e) => {
              e.stopPropagation();  // 画像クリックだけで遷移できるように
              goToPostDetail(e);
            }}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && goToPostDetail(e)}
          />
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
            className="bg-orange-500 text-white px-4 py-2 rounded-2xl hover:bg-orange-600 transition duration-200 shadow-md"
          >
            ❤️ {post.likes}
          </button>

          {isOwnPost && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-2xl hover:bg-orange-600 transition duration-200 shadow-md"
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
              if (reason) onReport(reason, post.id);
            }}
            className="text-orange-500 hover:underline ml-4"
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