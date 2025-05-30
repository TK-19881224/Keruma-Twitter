import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {doc, getDoc} from 'firebase/firestore';
import { db } from './FireBase';
import ShareButtons from './ShareButtons';

function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  console.log("postId:", postId);
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const postDoc = await getDoc(doc(db, 'posts', postId));
      if (postDoc.exists()) {
         const postData = postDoc.data();
         setPost(postData);

         const userDoc = await getDoc(doc(db, 'users', postData.uid));
         if (userDoc.exists()) {
          setAuthor(userDoc.data());
         }
      } else {
        console.warn("投稿が存在しません");
      }
    };
    fetchPost();
  }, [postId]);
  
  if (!post) return <p>読み込み中...</p>;

  const shareUrl = `${window.location.origin}/post/${postId}`;
  console.log("共有URL:", shareUrl);
  const shareTitle = `Keruma SNSで面白い投稿を見つけました!「${post.text?.slice(0,30)}...」`;

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white shadow rounded">
      <div className="flex items-center mb-4">
        <img
          src={author?.photoURL || '/default-icon.png'}
          alt="ユーザーアイコン"
          className="w-10 h-10 rounded-full mr-2"
        />
        <div>
          <p className="font-semibold">{author?.name || '匿名ユーザー'}</p>
          <p className="text-sm text-gray-500">{post.time}</p>
        </div>
      </div>

      <p className="mb-4">{post.text}</p>

      {post.imageUrl && (
        <img src={post.imageUrl} alt="投稿画像" className="rounded-md mb-4 max-w-full"/>
      )}

      {post.videoUrl && (
        <video controls className="rounded-md mb-4 max-w-full">
           <source src={post.videoUrl} type="video/mp4"/>
        </video>
      )}

      <ShareButtons url={shareUrl} title={shareTitle}/>

      <div className="mt-6">
          <h3 className="font-semibold">コメント一覧</h3>
          <ul className="list-disc list-inside mt-2">
            {(post.comments || []).map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
      </div>
    </div>
  );

}

export default PostDetail;