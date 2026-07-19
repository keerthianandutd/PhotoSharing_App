import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Checkbox, FormControlLabel, Button, Modal, Box } from "@mui/material";
import { useLocation, useNavigate  } from "react-router-dom";
import axios from 'axios';

import "./styles.css";

function TopBar({UserLogged, onToggleAdvancedFeatures, onLogout}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [version, setVersion] = useState("");
  const [isAdvancedFeaturesEnabled, setIsAdvancedFeaturesEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [photo, setPhoto] = useState(null);
  let pageTitle = "Photo Sharing App"; 

  useEffect(() => {
    console.log("UserLogged in TopBar:", UserLogged);
    const userId = location.pathname.split("/")[2];

  if (userId) {
    axios.get(`/user/${userId}`)
      .then((response) => {
        setUser(response.data);
        setErrorMessage(null);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        setErrorMessage("Failed to load user data");
      });
  }

  axios.get(`/test/info`)
    .then((response) => {
      setVersion(response.data.__v);
    })
    .catch((err) => {
      console.error("Error fetching version info:", err);
      setErrorMessage("Failed to load version info");
    });
}, [location.pathname]);

if (user) {
  if (location.pathname.includes("/photos")) {
    console.log(location.pathname);
    pageTitle = `Photos of ${user.first_name} ${user.last_name}`;
  } else if (location.pathname.includes("/comments")) {
    console.log(location.pathname);
    pageTitle = `Comments of ${user.first_name} ${user.last_name}`;
  } else {
    console.log(location.pathname);
    pageTitle = `${user.first_name} ${user.last_name}`;
  }
 } else if (location.pathname === "/users") {
    console.log(location.pathname);
    pageTitle = "User List";
  } else if (location.pathname.includes("/admin/login")) {
    console.log(location.pathname);
    pageTitle = "Please Login";
  }

  const handleAdvancedFeaturesToggle = (event) => {
    setIsAdvancedFeaturesEnabled(event.target.checked);
    onToggleAdvancedFeatures(event.target.checked);
  };

  const handleLogout = async () => {
    try {
      await axios.post("/admin/logout", {}, { withCredentials: true });
      setUser(null);
      onLogout(); 
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      // Optionally handle errors (e.g., show a message)
    }
  };

  // Function to handle opening the photo upload modal
  const handleOpenModal = () => {
    setOpen(true);
  };

  // Function to handle closing the photo upload modal
  const handleCloseModal = () => {
    setOpen(false);
  };

  // Function to handle the photo file selection
  const handlePhotoChange = (event) => {
    setPhoto(event.target.files[0]);
  };

  // Function to handle the upload submission
  const handleUpload = () => {
    if (photo) {
      const formData = new FormData();
      formData.append('uploadedphoto', photo);

      axios.post('/photos/new', formData)
        .then(response => {
          console.log("Photo uploaded successfully", response);
          // eslint-disable-next-line no-alert
          alert("Photo uploaded successfully");
          setOpen(false);  // Close modal after successful upload
        })
        .catch(error => {
          console.error("Error uploading photo:", error);
        });
    }
  };

  return (
    <AppBar className="topbar-appBar" position="fixed">
      <Toolbar className="topbar-toolbar">

          {UserLogged && UserLogged.first_name && (
          <Typography variant="h6" color="inherit" className="topbar-greeting">
            Hi {UserLogged.first_name}
          </Typography>
        )}

        <Typography variant="h6" color="inherit" className="topbar-version">
          {`Version: ${version}` || errorMessage }
        </Typography>

        <Typography variant="h6" color="inherit">
          <FormControlLabel
            control={(
              <Checkbox
                checked={isAdvancedFeaturesEnabled}
                onChange={handleAdvancedFeaturesToggle}
                color="default"
                className="custom-checkbox"
              />
            )}
            label="Advanced Features"
          />
        </Typography>

        <Typography variant="h6" color="inherit" className="topbar-context">
          {pageTitle}
        </Typography>
        {/* Add Photo Button */}
        {UserLogged && (
          <Button color="inherit" onClick={handleOpenModal}>
            Add Photo
          </Button>
        )}
        {UserLogged && (
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </Toolbar>
      {/* Modal for Uploading Photo */}
      <Modal open={open} onClose={handleCloseModal}>
        <Box className="upload-modal">
          <Typography variant="h6" gutterBottom>
            Upload a Photo
          </Typography>
          <input type="file" onChange={handlePhotoChange} />
          <Button onClick={handleUpload} color="primary" variant="contained">
            Upload
          </Button>
          <Button onClick={handleCloseModal} color="secondary" variant="outlined">
            Cancel
          </Button>
        </Box>
      </Modal>
    </AppBar>
  );
}

export default TopBar;