import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "./styles.css";

function UserComments({ advancedFeaturesEnabled }) {
  const { userId } = useParams(); 
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserComments() {
      try {
        const response = await axios.get(`/user/${userId}/comments`);
        setComments(response.data);
      } catch (err) {
        setError('Could not fetch comments for this user.');
        console.error('Error fetching user comments:', err);
      }
    }
    fetchUserComments();
  }, [userId]);

  const handleNavigation = (photoId, photoUserId) => {
    console.log(`Navigating to photoId: ${photoId} for photoUserId: ${photoUserId}`);
    const newUrl = `${window.location.origin}/photo-share.html#/photos/${photoUserId}?photoId=${photoId}`;
    window.location.href = newUrl;
  };

  const handleKeyDown = (event, photoId, photoUserId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleNavigation(photoId, photoUserId);
    }
  };

  return (
    <div>
      {advancedFeaturesEnabled ? (
        <>
          <h2>User Comments</h2>
          {error && <p className="error">{error}</p>}
          {comments.length === 0 && !error ? (
            <p>No comments found for this user.</p>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <div
                  key={comment.commentId}
                  className="comment-item"
                  onClick={() => handleNavigation(comment.photoId, comment.photoUserId)}
                  onKeyDown={(event) => handleKeyDown(event, comment.photoId, comment.photoUserId)}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={`/images/${comment.photoThumbnail}`}
                    alt="Comment thumbnail"
                    className="comment-thumbnail"
                  />
                  <div className="comment-details">
                    <p>{comment.commentText}</p>
                    <small>{new Date(comment.dateTime).toLocaleString()}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <h2>Advanced Features are Disabled</h2>
      )}
    </div>
  );
}

export default UserComments;
