import React, { useState, useEffect } from "react";
import { Typography, Divider, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";
import axios from 'axios';
import DeleteModal from "../Delete";

function UserDetail({ userId, isAdvancedFeaturesEnabled, loggedInUserId, onLogout }) {
  const [user, setUser] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/user/${userId}`)
      .then(response => setUser(response.data))
      .catch(error => console.error("Error fetching user details:", error));
  }, [userId]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/user/${userId}`);
      setUser(null);
      onLogout();
      // eslint-disable-next-line no-alert
      alert("User profile deleted and logged out successfully.");
      navigate("/");
    } catch (error) {
      console.error("Error deleting user profile or logging out:", error);
      // eslint-disable-next-line no-alert
      alert("Failed to delete user profile or log out. Please try again.");
    }
  };

  if (!user) {
    return <Typography variant="body1">Loading user details...</Typography>;
  }

  return (
    <div className="user-detail">
      <Typography variant="h4" className="user-name">
        {user.first_name} {user.last_name}
      </Typography>
      <Divider />
      <Typography variant="body1" className="user-info">
        <strong>Location:</strong> {user.location}
      </Typography>
      <Typography variant="body1" className="user-info">
        <strong>Occupation:</strong> {user.occupation}
      </Typography>
      <Typography variant="body1" className="user-info">
        <strong>Description:</strong> {user.description}
      </Typography>
      <Link
        to={{
          pathname: `/photos/${userId}`,
          state: { isAdvancedFeaturesEnabled }
        }}
        className="view-photos-link">
        View Photos of {user.first_name}
      </Link>
      <div>
      { user._id === loggedInUserId._id && (
        <Button
          variant="contained"
          color="error"
          onClick={() => setDeleteModalOpen(true)}
          className="delete-button"
          >
          Delete Profile
        </Button>
      )}
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)} // Close the modal
        onConfirm={() => {
          setDeleteModalOpen(false);
          handleDelete(); // Execute delete logic
        }}
        message={`Are you sure you want to delete the profile of ${user.first_name} ${user.last_name}?`}
      />
    </div>
  );
}

export default UserDetail;