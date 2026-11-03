# Lost & Found – Frontend

This directory contains the React frontend for **Lost & Found – FPT Cần Thơ**, a campus-focused platform for reporting lost and found belongings and connecting members of the FPT University community.

For the full project overview, backend setup, database requirements, and security notes, see the [root README](../README.md).

## Features

- Account registration, sign-in, email verification, and password reset.
- Home page with recent Lost & Found posts and community discussions.
- Lost-item and found-item listings with search, filters, sorting, and post details.
- Post creation, editing, deletion, status updates, and visibility controls.
- Comments, replies, likes, and post sharing.
- Community forum and website reviews with ratings.
- User profiles, avatar updates, account settings, and notifications.
- Role-aware navigation and an administrative interface.
- Light and dark appearance preferences.

## Technology Stack

- React 19
- Vite 8
- JavaScript (ES Modules)
- React Router 7
- Axios
- Bootstrap 5 and React-Bootstrap
- Bootstrap Icons
- ESLint

## Requirements

- Node.js `20.19.0` or newer in the `20.x` line, or `22.12.0` or newer.
- npm.
- The Lost & Found backend running locally or at the API host configured in the source.

## Installation and Development

From this directory, install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Vite normally serves the frontend at:

```text
http://localhost:5173
```

The backend must also be running and reachable. The current frontend configuration points to:

```text
http://localhost:8080/LAF_back
```

The API base URL is configured in `src/main.jsx`. The Vite development proxy is configured in `vite.config.js`. If the backend host, port, or context path changes, review both files and the backend CORS configuration.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the local Vite development server. |
| `npm run build` | Creates an optimized production build in `dist/`. |
| `npm run preview` | Previews the production build locally. |
| `npm run lint` | Runs ESLint. |

## Source Structure

```text
src/
├── components/       # Shared UI and authentication components
├── pages/            # Home, Lost & Found, Forum, Reviews, Profile, Admin, etc.
├── routes/           # React Router configuration and route protection
├── utils/            # Session, theme, image, and visibility helpers
├── App.jsx           # Main application component
├── App.css           # Application-level styles
├── index.css         # Global styles
├── theme.css         # Theme variables and styles
└── dark-theme.css    # Dark theme styles
```

## Notes

- The frontend uses session-aware API requests and relies on the backend for authentication, authorization, and persistent data.
- The project does not define a frontend unit-test script in `package.json`.
- Database setup and backend deployment instructions are documented in the [root README](../README.md).
