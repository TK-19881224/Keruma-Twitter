// src/FollowButton.js
import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from './FireBase'; // ← FireBase.js のパスに注意！

const FollowButton = ({ currentUserId, targetUserId }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followDocId, setFollowDocId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFollow = async () => {
      const q = query(
        collection(db, 'followers'),
        where('follower_id', '==', currentUserId),
        where('followed_id', '==', targetUserId)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setIsFollowing(true);
        setFollowDocId(snapshot.docs[0].id);
      } else {
        setIsFollowing(false);
        setFollowDocId(null);
      }
      setLoading(false);
    };

    if (currentUserId && targetUserId && currentUserId !== targetUserId) {
      checkFollow();
    } else {
      setLoading(false);
    }
  }, [currentUserId, targetUserId]);

  const toggleFollow = async () => {
    setLoading(true);
    if (isFollowing && followDocId) {
      await deleteDoc(doc(db, 'followers', followDocId));
      setIsFollowing(false);
      setFollowDocId(null);
    } else {
      const docRef = await addDoc(collection(db, 'followers'), {
        follower_id: currentUserId,
        followed_id: targetUserId,
      });
      setIsFollowing(true);
      setFollowDocId(docRef.id);
    }
    setLoading(false);
  };

  if (loading || currentUserId === targetUserId) return null;

  return (
    <button
      onClick={toggleFollow}
      style={{
        backgroundColor: isFollowing ? '#ccc' : '#007bff',
        color: 'white',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginLeft: '1rem',
      }}
    >
      {isFollowing ? 'フォロー中' : 'フォロー'}
    </button>
  );
};

export default FollowButton;