# PhotoSharing_App

A full-stack photo sharing web application built with React on the frontend and Node.js/ Express/ MongoDB on the backend. Users can register, log in, upload photos, like/unlike photos, comment on photos, and view activity across other users.

## Requirements:

1. Node.js
2. MongoDB running locally (default: mongodb://127.0.0.1/project6)

## Features:

1. User authentication — register, login, and logout with session-based auth (express-session + connect-mongo) and salted/hashed passwords.
2. User directory — list of all users with photo and comment counts
3. Photo upload — upload new photos per user (multer, stored on disk in /images)
4. Comments — add and delete comments on any photo
5. Likes — like/unlike photos
6. Delete — delete your own photos, comments, or account
7. Advanced features toggle — optional UI features controlled from the top bar
8. Client-side routing — react-router-dom (HashRouter) for navigating between user list, user detail, user photos, and comments views
9. Material UI — styled with @mui/material, @mui/icons-material, and @emotion

## Setup & Installation

1. Install dependencies: npm install
2. Start MongoDB (make sure a local mongod instance is running install and run if you haven't already)
3. (Optional) Seed the database with sample data: node loadDatabase.js
4. Build the client bundle: npm run build (or) rebuild automatically on file changes: npm run build:w
5. Start the web server: node webServer.js
6. Open the app in your browser at: http://localhost:3000/photo-share.html