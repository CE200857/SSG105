# Lost & Found – FPT Cần Thơ

A campus-focused Lost & Found web application built to help the FPT University community in Cần Thơ report missing belongings, share found-item information, and connect with people who may help return those items to their owners.

The platform also provides community discussions, user reviews, notifications, personal profiles, and administrative tools for managing content and user accounts.

> **Project type:** Academic team project  
> **Architecture:** React frontend + Java Servlet backend + Microsoft SQL Server

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Application Architecture](#application-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Prepare the Database](#1-prepare-the-database)
  - [2. Configure and Run the Backend](#2-configure-and-run-the-backend)
  - [3. Configure and Run the Frontend](#3-configure-and-run-the-frontend)
- [Application Roles](#application-roles)
- [Available Scripts](#available-scripts)
- [Configuration Notes](#configuration-notes)
- [Security Considerations](#security-considerations)
- [Current Project Scope](#current-project-scope)

## Overview

Lost & Found is designed for a campus environment where students can publish information about items they have lost or found. Users can browse and search posts, narrow results by category or campus location, and interact with other members through comments and likes.

The application brings several campus-community functions together in one place:

- Lost-item and found-item reporting.
- Community discussions and website reviews.
- User profiles and account settings.
- Notifications for relevant interactions.
- Administrative moderation and account management.

## Key Features

### Accounts and Authentication

- Register and create a user profile.
- Verify email addresses using a one-time verification code.
- Sign in and sign out, with a remember-me option.
- Reset a forgotten password through email verification.
- Update profile information, profile picture, and password.
- Delete an account through account settings.

### Lost and Found Posts

- Create posts for lost or found belongings.
- Add item details, category, campus location, date/time information, and images.
- Browse, search, filter, and sort posts.
- Edit or delete posts owned by the current user.
- Update the status of a post as an item-finding or return process progresses.
- Set post visibility to public or private.
- Like posts, comment, reply to comments, and share posts.

### Community Forum

- Create discussion posts with a title, category, and content.
- Browse and sort community discussions.
- Like posts and participate in comment threads.
- Edit or delete posts owned by the current user.
- Control post visibility.

### Reviews and Notifications

- Submit a website review with a star rating and written feedback.
- Browse, filter, and sort reviews.
- Edit or delete your own review and manage its visibility.
- Receive notifications for supported post and community interactions.
- Mark notifications as read.

### Profile and Administration

- View user profiles and their published content.
- Manage personal account settings.
- View an application overview.
- Provide administrators with tools to review pending content, manage Lost & Found and forum posts, handle status requests, manage reviews, and manage student accounts.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 8, JavaScript (ES Modules) |
| UI | Bootstrap 5, React-Bootstrap, Bootstrap Icons, custom CSS |
| Client-side routing | React Router 7 |
| HTTP communication | Axios |
| Backend | Java 11, Jakarta EE 10 APIs, Jakarta Servlets |
| Backend build | Apache Maven, WAR packaging |
| Database | Microsoft SQL Server, Microsoft JDBC Driver |
| Supporting libraries | Gson, Angus Mail, Jakarta Standard Tag Library (JSTL) |

## Application Architecture

The project is organized as a separate frontend and backend application:

1. The **React frontend** renders the user interface and sends HTTP requests through Axios.
2. The **Java Servlet backend** exposes `/api/*` endpoints, handles application workflows, and applies request filters for session and access checks.
3. The **DAO layer** contains database access operations and communicates with Microsoft SQL Server through JDBC.
4. The **entity and DTO classes** represent application data transferred between backend components and the frontend.

```text
┌─────────────────────────────┐
│       React Frontend        │
│  React Router / Bootstrap   │
│          Axios              │
└──────────────┬──────────────┘
               │ HTTP / JSON / FormData
               ▼
┌─────────────────────────────┐
│     Java Servlet Backend    │
│       /api/* endpoints      │
│  Filters / Controllers      │
└──────────────┬──────────────┘
               │ JDBC
               ▼
┌─────────────────────────────┐
│      Microsoft SQL Server   │
│       LostAndFoundDB        │
└─────────────────────────────┘
```

## Project Structure

```text
SSG105/
├── LAF_front/                  # React + Vite frontend
│   ├── public/                 # Public static assets
│   ├── src/
│   │   ├── components/         # Shared UI and authentication components
│   │   ├── pages/              # Application pages
│   │   ├── routes/             # Client-side route definitions
│   │   ├── utils/              # Session, theme, image, and visibility helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── LAF_back/                   # Java Servlet backend
│   ├── src/main/java/
│   │   ├── controller/         # HTTP servlet controllers
│   │   ├── dao/                # SQL Server data access objects
│   │   ├── dto/                # Data transfer objects
│   │   ├── entity/             # Application entities
│   │   ├── filter/             # CORS, session, and authentication filters
│   │   └── util/               # Database, email, image, and auth utilities
│   └── pom.xml
│
└── README.md
```

## Getting Started

The following instructions describe the local development setup reflected in the project configuration.

### Prerequisites

Install the following tools before running the project:

- **Node.js:** `20.19.0` or newer in the `20.x` line, or `22.12.0` or newer.
- **npm:** installed with Node.js.
- **JDK:** Java 11.
- **Apache Maven:** a Maven installation compatible with the Maven Wrapper/build configuration (the project currently uses Maven directly).
- **Microsoft SQL Server:** a running SQL Server instance.
- **Apache Tomcat 10.1+** or another servlet container compatible with Jakarta Servlet 6.0 / Jakarta EE 10.

### 1. Prepare the Database

The backend expects a SQL Server database named `LostAndFoundDB` by default.

**Important:** The provided ZIP does not contain a database creation script, schema dump, or seed-data script. Prepare the database schema and any required initial records separately before starting the application. The backend DAOs expect the tables used by the application, including users, Lost & Found posts, forum posts, comments, reviews, notifications, and related interaction records.

Configure the JDBC connection using the Java system property `laf.db.url` (see [Configuration Notes](#configuration-notes)). Do not use sample or source-code fallback credentials for a shared or public environment.

### 2. Configure and Run the Backend

1. Open a terminal in the backend directory:

   ```bash
   cd LAF_back
   ```

2. Configure the SQL Server connection and email service before starting the servlet container. See [Configuration Notes](#configuration-notes).

3. Build the WAR package:

   ```bash
   mvn clean package
   ```

4. After a successful build, Maven generates:

   ```text
   target/LAF_back-1.0-SNAPSHOT.war
   ```

5. Deploy the WAR to your servlet container. For the current frontend configuration, the deployed application context path must be:

   ```text
   /LAF_back
   ```

   For Tomcat, you can deploy the WAR as `LAF_back.war` (rename the generated artifact when copying it to Tomcat's `webapps` directory). Start or restart Tomcat after deployment.

The frontend is configured to send API requests to `http://localhost:8080/LAF_back` during local development.

### 3. Configure and Run the Frontend

1. Open another terminal in the frontend directory:

   ```bash
   cd LAF_front
   ```

2. Install the dependencies from the lockfile:

   ```bash
   npm ci
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite. The default development URL is:

   ```text
   http://localhost:5173
   ```

Keep the backend and SQL Server running while using the frontend. The frontend's API base URL, backend deployment context path, and backend CORS origin must agree; see [Configuration Notes](#configuration-notes) if you use different ports or hostnames.

## Application Roles

The application defines two roles in its frontend route and backend access logic:

| Role | Description |
|---|---|
| Student (`RoleID = 2`) | Uses the campus features, manages their own profile and content, and participates in community activities. |
| Admin (`RoleID = 1`) | Has access to administrative functions for content moderation, status requests, reviews, and student account management. |

Access to administrative pages and APIs is restricted to the administrator role in the application logic.

## Available Scripts

### Frontend (`LAF_front`)

| Command | Description |
|---|---|
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Builds the production frontend assets into `dist/`. |
| `npm run preview` | Serves the production build locally for preview. |
| `npm run lint` | Runs ESLint against the frontend source. |

### Backend (`LAF_back`)

| Command | Description |
|---|---|
| `mvn clean package` | Cleans and packages the backend as a WAR file. |

No automated frontend or backend test command is defined in the supplied project files.

## Configuration Notes

### Database Connection

`LAF_back/src/main/java/util/DBContext.java` reads the JDBC URL from the Java system property `laf.db.url`. Use a connection string appropriate for your SQL Server instance:

```text
jdbc:sqlserver://localhost:1433;databaseName=LostAndFoundDB;user=YOUR_DB_USER;password=YOUR_DB_PASSWORD;encrypt=true;trustServerCertificate=true;
```

Pass it to the Java process as a system property, for example through Tomcat's `CATALINA_OPTS` / `JAVA_OPTS` or your IDE's VM options:

```bash
-Dlaf.db.url="jdbc:sqlserver://localhost:1433;databaseName=LostAndFoundDB;user=YOUR_DB_USER;password=YOUR_DB_PASSWORD;encrypt=true;trustServerCertificate=true;"
```

`trustServerCertificate=true` is shown only as a local-development example. Configure certificate validation appropriately for a deployed environment.

### Email Service

The backend sends verification and password-reset emails through Gmail SMTP. The mail password is read from the `LAF_MAIL_PASSWORD` environment variable in `LAF_back/src/main/java/util/MailUtil.java`.

Set this variable in the environment used to start the backend. The current source also contains a hard-coded fallback credential; remove that fallback and rotate the exposed app password before pushing the repository to a public remote or deploying the application.

### Local API and CORS Settings

The current local configuration assumes:

- Frontend development origin: `http://localhost:5173`
- Backend origin: `http://localhost:8080`
- Backend context path: `/LAF_back`

The backend CORS settings are currently hard-coded for the local frontend origin. When changing the frontend origin or deploying to another environment, update the CORS configuration in the backend filters as well as the frontend API base URL in `LAF_front/src/main.jsx` and the proxy target in `LAF_front/vite.config.js`.

## Security Considerations

This project is an academic application and should not be treated as production-hardened without further review. Before deploying it for real users:

- Remove all hard-coded credentials and rotate any credentials that have already been committed or shared.
- Store database and mail credentials in environment-specific configuration or a secrets manager.
- Replace the current MD5 password hashing implementation with a modern password-hashing algorithm such as Argon2id or bcrypt, with an appropriate work factor.
- Use HTTPS and configure secure session-cookie settings and environment-specific CORS origins.
- Review authorization, input validation, file-upload handling, and other security controls before production use.

## Current Project Scope

The supplied project contains the frontend and backend source code, Maven and npm configuration, and static frontend assets. It does **not** include a database schema/backup, seed data, deployment descriptors for a production environment, or an automated test suite. These items must be prepared separately for a complete reproducible deployment.
