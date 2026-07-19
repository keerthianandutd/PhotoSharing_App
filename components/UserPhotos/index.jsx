import React, { useState, useEffect } from "react";
import { Typography, Divider, Card, CardContent, CardMedia, Button, IconButton, TextField } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./styles.css";
import { Delete as DeleteIcon } from "@mui/icons-material";

function UserPhotos({ userId, advancedFeaturesEnabled, loggedInUserId }) {
  const [photos, setPhotos] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [newComment, setNewComment] = useState({});  // State to manage new comment input
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Logged in user ID:", loggedInUserId._id);
    axios.get(`/photosOfUser/${userId}`)
      .then((response) => setPhotos(response.data))
      .catch((error) => console.error("Error fetching photos:", error));

      axios.get(`/user/${userId}`)
      .then((response) => setUser(response.data))
      .catch((error) => console.error("Error fetching user:", error));
  }, [userId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const photoId = params.get('photoId');
    
    if (photoId && photos) {
      const index = photos.findIndex(photo => photo._id === photoId);
      if (index !== -1) {
        setCurrentPhotoIndex(index);
      }
    }
  }, [location.search, photos]);

  const handleBookmark = () => {
    const currentPhoto = photos[currentPhotoIndex];
    const photoUrl = `${window.location.origin}/photo-share.html#/photos/${userId}?photoId=${currentPhoto._id}`;
    navigator.clipboard.writeText(photoUrl)
      .then(() => {
        // eslint-disable-next-line no-alert
        alert("Photo URL copied to clipboard!");
      })
      .catch((err) => console.error("Could not copy text:", err));
  };

  const handleCommentSubmit = async (photoId) => {
    if (!newComment[photoId]?.trim()) {
      // eslint-disable-next-line no-alert
      alert("Comment cannot be empty!");
      return;
    }
  
    try {
      await axios.post(`/commentsOfPhoto/${photoId}`, { comment: newComment[photoId] });
  
      // Clear the comment for this photo after submission
      setNewComment({ ...newComment, [photoId]: "" });
  
      // Refresh the photos data
      const updatedPhotos = await axios.get(`/photosOfUser/${userId}`);
      setPhotos(updatedPhotos.data);
    } catch (error) {
      console.error("Error adding comment:", error);
      // eslint-disable-next-line no-alert
      alert("Failed to add comment. Please try again.");
    }
  };
  
  const handleDeletePhoto = async (photoId) => {
    //const photo = photos.find(photoss => photoss._id === photoId);

    try {
      await axios.delete(`/photo/${photoId}`);
      const updatedPhotos = photos.filter(photoss => photoss._id !== photoId);
      setPhotos(updatedPhotos);
      // eslint-disable-next-line no-alert
      alert("Photo deleted Successfully");
    } catch (error) {
      console.error("Error deleting photo:", error);
      // eslint-disable-next-line no-alert
      alert("Failed to delete photo. Please try again.");
    }
  };

  const handleDeleteComment = async (photoId, commentId) => {
    //const photo = photos.find(photoss => photoss._id === photoId);
    //const comment = photo.comments.find(commentss => commentss._id === commentId);

    try {
      await axios.delete(`/commentsOfPhotos/${photoId}/${commentId}`);
      const updatedPhotos = await axios.get(`/photosOfUser/${userId}`);
      setPhotos(updatedPhotos.data);
      // eslint-disable-next-line no-alert
      alert("Comment deleted Successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      // eslint-disable-next-line no-alert
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleLikeToggle = async (photoId) => {
    try {
      const response = await axios.post(`/photo/${photoId}/like`, {
        userId: loggedInUserId._id,
      });
  
      const updatedPhotos = photos.map((photo) => {
        return photo._id === photoId
          ? { ...photo, likes: response.data.likes }
          : photo;
      });
  
      setPhotos(updatedPhotos);
    } catch (error) {
      console.error("Error toggling like:", error);
      // eslint-disable-next-line no-alert
      alert("Failed to toggle like. Please try again.");
    }
  };

  if (!photos || !user) {
    return <Typography variant="body1">Loading photos...</Typography>;
  }

  if (photos.length === 0) {
    return <Typography variant="body1">No photos available for this user.</Typography>;
  }

  const updatePhotoIdInUrl = (photoId) => {
    const newUrl = `/photos/${userId}?photoId=${photoId}`;
    navigate(newUrl, { replace: true });
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
      updatePhotoIdInUrl(photos[currentPhotoIndex + 1]._id);
    }
  };

  const handlePreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
      updatePhotoIdInUrl(photos[currentPhotoIndex - 1]._id);
    }
  };

  return (
    <div className="user-photos">
      <Typography variant="h4" className="photos-title">
        Photos of {user.first_name} {user.last_name}
      </Typography>
      {advancedFeaturesEnabled ? (
        <div className="photo-stepper">
          <Card key={photos[currentPhotoIndex]._id} className="photo-card">
            <CardMedia
              component="img"
              image={`/images/${photos[currentPhotoIndex].file_name}`}
              alt={`Photo taken by ${user.first_name}`}
              className="photo-image"
            />
            <CardContent>
              <Typography variant="body2" className="photo-date">
                Photo taken on: {new Date(photos[currentPhotoIndex].date_time).toLocaleString()}
              </Typography>
              <Divider />
              <div className="like-section">
                <Button
                  variant="contained"
                  color={(() => {
                    const likesArray = Array.isArray(photos[currentPhotoIndex].likes)
                      ? photos[currentPhotoIndex].likes
                      : Object.values(photos[currentPhotoIndex].likes); // Convert to array if not already

                    const hasLiked = likesArray.some(like => like.user_id.toString() === loggedInUserId._id.toString());
                    return hasLiked ? "secondary" : "primary";
                  })()}
                  onClick={() => handleLikeToggle(photos[currentPhotoIndex]._id)}
                  >
                  {(() => {
                    const likesArray = Array.isArray(photos[currentPhotoIndex].likes)
                      ? photos[currentPhotoIndex].likes
                      : Object.values(photos[currentPhotoIndex].likes); // Convert to array if not already

                    const hasLiked = likesArray.some(like => like.user_id.toString() === loggedInUserId._id.toString());
                    console.log("likesArray", likesArray);
                    console.log("hasLiked", hasLiked);
                    return hasLiked ? "Unlike" : "Like";
                  })()}
                </Button>
                <Typography variant="body2" className="like-count">
                  {photos[currentPhotoIndex].likes.length} {photos[currentPhotoIndex].likes.length === 1 ? "Like" : "Likes"}
                </Typography>
              </div>
              <div className="comments-section">
                {photos[currentPhotoIndex].comments && photos[currentPhotoIndex].comments.length > 0 ? (
                  photos[currentPhotoIndex].comments.map((comment) => (
                    <div key={comment._id} className="comment">
                      <Typography variant="body2">
                        <Link to={`/users/${comment.user._id}`} className="comment-author">
                          {comment.user.first_name} {comment.user.last_name}
                        </Link>{" "}
                        commented on {new Date(comment.date_time).toLocaleString()}:
                      </Typography>
                      <Typography variant="body2" className="comment-text">
                        {comment.comment}
                      </Typography>
                      {comment.user._id === loggedInUserId._id && (
                        <IconButton
                          onClick={() => handleDeleteComment(photos[currentPhotoIndex]._id, comment._id)}
                          size="small"
                          aria-label="delete-comment"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                  ))
                ) : (
                  <Typography variant="body2">No comments for this photo.</Typography>
                )}
              </div>
              {/* Comment Input Form */}
              <Divider style={{ margin: '10px 0' }} />
              <TextField
                label="Add a comment..."
                variant="outlined"
                size="small"
                fullWidth
                value={newComment[photos[currentPhotoIndex]._id] || ""} // Get the comment for the current photo
                onChange={(e) => setNewComment({ ...newComment, [photos[currentPhotoIndex]._id]: e.target.value })}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleCommentSubmit(photos[currentPhotoIndex]?._id)}
                style={{ marginTop: '10px' }}
              >
                Submit
              </Button>
              {photos[currentPhotoIndex].user_id === loggedInUserId._id && (
                <IconButton
                  onClick={() => handleDeletePhoto(photos[currentPhotoIndex]._id)}
                  size="large"
                  aria-label="delete-photo"
                  style={{ marginTop: '10px' }}
                >
                  <DeleteIcon fontSize="medium" />
                </IconButton>
              )}
            </CardContent>
          </Card>
          <div className="stepper-controls">
            <Button onClick={handlePreviousPhoto} disabled={currentPhotoIndex === 0}>
              Previous
            </Button>
            <Button onClick={handleNextPhoto} disabled={currentPhotoIndex === photos.length - 1}>
              Next
            </Button>
            <Button onClick={handleBookmark}>Bookmark This Photo</Button>
          </div>
        </div>
      ) : (
      photos.map((photo) => (
        <Card key={photo._id} className="photo-card">
          <CardMedia
            component="img"
            image={`/images/${photo.file_name}`}
            alt={`Photo taken by ${user.first_name}`}
            className="photo-image"
          />
          <CardContent>
            <Typography variant="body2" className="photo-date">
              Photo taken on: {new Date(photo.date_time).toLocaleString()}
            </Typography>
            <Divider />
            <div className="like-section">
              <Button
                variant="contained"
                color={(() => {
                  // Convert photo.likes to an array if it's not already
                  const likesArray = Array.isArray(photo.likes)
                    ? photo.likes
                    : Object.values(photo.likes); // Convert to array if not already

                  let hasLiked = false;
                  for (const like of likesArray) {
                    if (like.user_id.toString() === loggedInUserId._id.toString()) {
                      hasLiked = true;
                      break;
                    }
                  }
                  return hasLiked ? "secondary" : "primary";
                })()}
                onClick={() => handleLikeToggle(photo._id)}
                >
                {(() => {
                  // Convert photo.likes to an array if it's not already
                  const likesArray = Array.isArray(photo.likes)
                    ? photo.likes
                    : Object.values(photo.likes); // Convert to array if not already

                  let hasLiked = false;
                  for (const like of likesArray) {
                    if (like.user_id.toString() === loggedInUserId._id.toString()) {
                      hasLiked = true;
                      break;
                    }
                  }
                  return hasLiked ? "Unlike" : "Like";
                })()}
              </Button>
              <Typography variant="body2" className="like-count">
                {photo.likes.length} {photo.likes.length === 1 ? "Like" : "Likes"}
              </Typography>
            </div>
            <div className="comments-section">
              {photo.comments && photo.comments.length > 0 ? (
                photo.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <Typography variant="body2">
                      <Link to={`/users/${comment.user._id}`} className="comment-author">
                        {comment.user.first_name} {comment.user.last_name}
                      </Link>{" "}
                      commented on {new Date(comment.date_time).toLocaleString()}:
                    </Typography>
                    <Typography variant="body2" className="comment-text">
                      {comment.comment}
                    </Typography>
                    {comment.user._id === loggedInUserId._id && (
                        <IconButton
                          onClick={() => handleDeleteComment(photo._id, comment._id)}
                          size="small"
                          aria-label="delete-comment"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                  </div>
                ))
              ) : (
                <Typography variant="body2">No comments for this photo.</Typography>
              )}
            </div>
            {/* Comment Input Form */}
            <Divider style={{ margin: '10px 0' }} />
            <TextField
              label="Add a comment..."
              variant="outlined"
              size="small"
              fullWidth
              value={newComment[photo._id] || ""}
              onChange={(e) => setNewComment({ ...newComment, [photo._id]: e.target.value })}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleCommentSubmit(photo._id)}
              style={{ marginTop: '10px' }}
            >
              Submit
            </Button>
            {photo.user_id === loggedInUserId._id && (
                <IconButton
                  onClick={() => handleDeletePhoto(photo._id)}
                  size="large"
                  aria-label="delete-photo"
                  style={{ marginTop: '10px' }}
                >
                  <DeleteIcon fontSize="medium" />
                </IconButton>
              )}
          </CardContent>
        </Card>
      ))
    )}
    </div>
  );
}

export default UserPhotos;