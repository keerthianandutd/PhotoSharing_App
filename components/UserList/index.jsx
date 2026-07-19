import React, { useEffect, useState } from "react";
import { Divider, List, ListItem, ListItemText, Typography, Badge } from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import axios from 'axios';
import "./styles.css";

function UserList({ advancedFeaturesEnabled, userss }) {
  const [users, setUsers] = useState([]);

  if (!userss) {
    return <Navigate to="/admin/login" />;
  }

  useEffect(() => {
    axios.get("/user/list")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  return (
    <div className="user-list">
      <Typography variant="body1" className="user-list-heading">
        Click on a user to view their details.
      </Typography>
      <List component="nav">
        {users.map((user) => (
          <div key={user._id}>
            <ListItem component={Link} to={`/users/${user._id}`}>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />
              {advancedFeaturesEnabled && user.photoCount !== undefined && user.commentCount !== undefined ? (
                <>
                  <Badge
                    badgeContent={user.photoCount}
                    color="success"
                    sx={{ marginRight: 7 }}
                  />
                  <Link to={`/users/${user._id}/comments`}>
                    <Badge
                      badgeContent={user.commentCount}
                      color="error"
                      sx={{ marginRight: 6 }}
                    />
                  </Link>
                </>
              ) : null}
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>
    </div>
  );
}

export default UserList;