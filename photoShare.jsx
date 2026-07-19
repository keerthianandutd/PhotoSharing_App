import React, { useState, useEffect  } from "react";
import ReactDOM from "react-dom/client";
import { Grid, Paper } from "@mui/material";
import { HashRouter, Route, Routes, useParams, Navigate } from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/Comments";
import LoginRegister from "./components/LoginRegister";

function Unauthorized() {
  return (
    <div>
      <h2>401 Unauthorized</h2>
      <p>Please log in to access this page.</p>
    </div>
  );
}

function Response({ status, message }) {
  if (status === 401) {
    return <Unauthorized />;
  }

  return <div>{message}</div>;
}

function UserDetailRoute({ user, onLogout }) {
  const { userId } = useParams();
  console.log("UserDetailRoute: userId is:", userId);
  console.log("UserDetailRoute: Logged userId is:", user);
  return <UserDetail userId={userId} loggedInUserId={user} onLogout={onLogout} />;
}

function UserPhotosRoute({ advancedFeaturesEnabled, user }) {
  const { userId } = useParams();
  console.log("UserPhotosRoute: userId is:", user);
  return <UserPhotos userId={userId} advancedFeaturesEnabled={advancedFeaturesEnabled } loggedInUserId={user} />;
}

function UserCommentsRoute({ advancedFeaturesEnabled }) {
  const { userId } = useParams();
  return <UserComments userId={userId} advancedFeaturesEnabled={advancedFeaturesEnabled} />;
}

function PhotoShare() {
  const [user, setUser] = useState(null);
  const [advancedFeaturesEnabled, setAdvancedFeaturesEnabled] = useState(false);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    console.log("Login successful. User data:", userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    console.log("User logged out");
  };

  return (
    <HashRouter>
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar UserLogged={user} onToggleAdvancedFeatures={setAdvancedFeaturesEnabled} onLogout={handleLogout} />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              {user ? <UserList advancedFeaturesEnabled={advancedFeaturesEnabled} userss={user} /> : null}
            </Paper>
          </Grid>
          <Grid item sm={9}>
            <Paper className="main-grid-item">
              <Routes>
                <Route
                  path="/"
                  element={user ? (
                    <Navigate to={`/users/${user._id}`} />
                  ) : (
                    <Navigate to="/admin/login" />
                  )}
                />
                <Route path="/admin/login" element={<LoginRegister onLoginSuccess={handleLoginSuccess} />} />
                <Route
                  path="/users/:userId"
                  element={user ? (<UserDetailRoute user={user} onLogout={handleLogout} />) : (<Response status={401} message="Please log in to view this page." />)}
                />
                <Route
                  path="/photos/:userId"
                  element={user ? (<UserPhotosRoute advancedFeaturesEnabled={advancedFeaturesEnabled} user={user} />) : (<Response status={401} message="Please log in to view this page." />)}
                />
                <Route
                  path="/users"
                  element={user ? (<UserList advancedFeaturesEnabled={advancedFeaturesEnabled} user={user} />) : (<Response status={401} message="Please log in to view this page." />)}
                />
                <Route
                  path="/users/:userId/comments"
                  element={user ? (<UserCommentsRoute advancedFeaturesEnabled={advancedFeaturesEnabled} />) : (<Response status={401} message="Please log in to view this page." />)}
                />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </HashRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare />);