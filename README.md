# PhotoSharing App

A full-stack photo sharing web application. Users can register, log in, upload photos, like/unlike photos, comment on photos, and browse activity across other users.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router (`HashRouter`), Material UI (`@mui/material`, `@mui/icons-material`, `@emotion`) |
| Backend | Node.js, Express |
| Database | MongoDB (via Mongoose), sessions stored with `connect-mongo` |
| Auth | `express-session`, salted/hashed passwords |
| File uploads | `multer` (photos stored on disk in `/images`) |
| Build | Webpack, Babel |

## Project structure

| Folder | Contents |
|---|---|
| [`components/`](./components) | React components (user list, user detail, photos, comments, etc.) |
| [`lib/`](./lib) | Shared backend/frontend utilities |
| [`modelData/`](./modelData) | Mongoose schemas / seed data helpers |
| [`schema/`](./schema) | Database schema definitions |
| [`styles/`](./styles) | CSS |
| [`test/`](./test) | Tests |
| [`images/`](./images) | Uploaded photo storage |

Key files: [`webServer.js`](./webServer.js) (Express server), [`photoShare.jsx`](./photoShare.jsx) (React app entry), [`loadDatabase.js`](./loadDatabase.js) (DB seeding script), [`photo-share.html`](./photo-share.html) (app shell).

## Features

1. **User authentication** — register, login, and logout with session-based auth and salted/hashed passwords
2. **User directory** — list of all users with photo and comment counts
3. **Photo upload** — upload new photos per user, stored in `/images`
4. **Comments** — add and delete comments on any photo
5. **Likes** — like/unlike photos
6. **Delete** — remove your own photos, comments, or account
7. **Advanced features toggle** — optional UI features controlled from the top bar
8. **Client-side routing** — navigate between user list, user detail, user photos, and comments views
9. **Material UI styling** throughout

## Requirements

- Node.js
- MongoDB running locally (default: `mongodb://127.0.0.1/project6`)

## Setup & installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start MongoDB (make sure a local `mongod` instance is running)
3. *(Optional)* Seed the database with sample data:
   ```bash
   node loadDatabase.js
   ```
4. Build the client bundle:
   ```bash
   npm run build
   ```
   or rebuild automatically on file changes:
   ```bash
   npm run build:w
   ```
5. Start the web server:
   ```bash
   node webServer.js
   ```
6. Open the app in your browser at [http://localhost:3000/photo-share.html](http://localhost:3000/photo-share.html)

## License
No license specified.
