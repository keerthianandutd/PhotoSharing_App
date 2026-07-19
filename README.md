# PhotoSharing_App

A full-stack photo sharing web application built with React on the frontend and Node.js/ Express/ MongoDB on the backend. Users can register, log in, upload photos, like/unlike photos, comment on photos, and view activity across other users.

Features:

User authentication — register, login, and logout with session-based auth (express-session + connect-mongo) and salted/hashed passwords.
User directory — list of all users with photo and comment counts
Photo upload — upload new photos per user (multer, stored on disk in /images)
Comments — add and delete comments on any photo
Likes — like/unlike photos
Delete — delete your own photos, comments, or account
Advanced features toggle — optional UI features controlled from the top bar
Client-side routing — react-router-dom (HashRouter) for navigating between user list, user detail, user photos, and comments views
Material UI — styled with @mui/material, @mui/icons-material, and @emotion

Setup & Installation

1. Install dependencies: npm install
2. Start MongoDB: node loadDatabase.js
3. Build the client bundle: npm run build (or) rebuild automatically on file changes: npm run build:w
4. Start the web server: node webServer.js
5. Open the app in your browser at: http://localhost:3000/photo-share.html