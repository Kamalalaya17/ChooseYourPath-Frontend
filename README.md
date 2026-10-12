# ChooseYourPath

ChooseYourPath is an interactive branching-story platform. Readers explore stories scene by scene, writers create stories and choices, and administrators moderate content and manage users.

## Features

- Separate Reader, Writer, and Administrator areas
- Interactive stories with scenes, choices, and endings
- Writer story creation and editing
- Admin dashboard, user management, story review, and moderation
- Reading progress, favorites, comments, and story-view statistics
- JWT-based authentication and role-based authorization
- Sample story data can be seeded for an existing writer account; seeders do **not** create demo login accounts

## Technology stack

- Frontend: React, Vite, JavaScript/TypeScript, React Router, Tailwind CSS
- Backend: Java, Spring Boot, Spring Web, Spring Data JPA, Spring Security, JWT
- Database: MySQL
- Build tools: npm and Maven

## Requirements

- Node.js and npm
- JDK 17 or later (use a JDK compatible with your installed Maven/Spring Boot setup)
- Maven 3.8+ (or use the Maven wrapper if one is added)
- MySQL 8.x or compatible

## 1. Configure MySQL

Create the local database (no password is stored in this repository):

```sql
CREATE DATABASE chooseyourpath CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

The backend uses `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, and `DB_PASSWORD`. Defaults are `localhost`, `3306`, `chooseyourpath`, `root`, and an empty password. Override these for your own local MySQL installation. Never commit real credentials.

## 2. Configure the backend

Spring Boot reads environment variables from the process environment; it does not automatically load `.env` files. In PowerShell, set the values for the current terminal before starting the backend. Example (replace values for your own machine):

```powershell
$env:DB_HOST = "localhost"
$env:DB_PORT = "3306"
$env:DB_NAME = "chooseyourpath"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = ""
$env:JWT_SECRET = "replace-with-a-random-secret-of-at-least-32-characters"
$env:JWT_EXPIRATION_MS = "86400000"
cd backend
mvn spring-boot:run
```

Use a unique, randomly generated JWT secret for any shared or deployed environment. Do not reuse the example value above in production.

The Hibernate setting currently uses `ddl-auto: update`; back up your local database before changing entity mappings. For the reserved `reads` column migration, see [`backend/DB_FIX_READ_COUNT.sql`](backend/DB_FIX_READ_COUNT.sql). Inspect and back up the database before running any migration against valuable data.

## 3. Configure and run the frontend

From the project root (the folder containing `package.json`):

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Set `VITE_API_URL=http://localhost:8080` in your local `.env` to use the Spring Boot REST API. Vite environment variables prefixed with `VITE_` are visible in the browser; **never place passwords, JWT signing keys, or other private secrets in them**.

Open the local URL printed by Vite (usually `http://localhost:5173`).

## 4. Accounts and administrator access

- Register Reader and Writer accounts through the app's signup flow.
- The seeders do not create predictable demo reader, writer, or admin accounts.
- Administrator accounts must be provisioned deliberately through a controlled, trusted backend/database operation. Do not expose admin credentials in frontend code, documentation, seeders, or public commits.
- Hiding the admin link is not a security boundary. Keep role checks enabled on every protected backend endpoint.

## Scene illustration behavior and troubleshooting

Writers can enter an **Illustration description** for each scene. The editor sends this value to the active data backend, then reads the scene list back and verifies the stored value before displaying a save confirmation. The reader uses that description to choose a matching built-in SVG scene illustration and to vary its deterministic composition. For example, door/portal/rune/stair keywords select an ancient doorway illustration. This is local SVG artwork, not an AI image-generation service; arbitrary details will not all be rendered as separate objects.

If a description does not persist, open the browser Developer Tools → Network and inspect the scene update request and subsequent scene-list response. Confirm `sceneDescription` is present in both, and check the backend/Convex logs for validation or authorization errors. After publishing, test the story from the reader account and hard-refresh once to verify the persisted description is being loaded.

## Deploying

This is a full-stack app, so deploying only the Vite frontend is not enough when using the Spring Boot/MySQL mode. Deploy the frontend, Spring Boot API, and MySQL database as separate services (or use an equivalent full-stack host):

1. Push the repository to GitHub.
2. Create a managed MySQL 8 database and note its host, port, database name, username, and password.
3. Deploy `backend/` as a Java web service. Build command: `mvn --batch-mode clean package -DskipTests`; start command: `java -jar target/chooseyourpath-backend-1.0.0.jar`.
4. Set backend environment variables in the hosting dashboard: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `APP_CORS_ALLOWED_ORIGINS` (the deployed frontend origin, e.g. `https://your-app.example.com`), and a strong random `JWT_SECRET` (at least 32 characters). Set `JWT_EXPIRATION_MS` as needed. Do not put backend secrets in the frontend environment or GitHub.
5. Deploy the frontend as a static Vite site with build command `npm ci && npm run build` and publish directory `dist`. Set `VITE_API_URL` to the deployed API's HTTPS base URL **before the frontend build**.
6. Verify CORS is restricted to the deployed frontend origin for production, configure HTTPS, and test registration, login, writer save, publish/admin review, and reader playback against the deployed database.

Vite substitutes `VITE_*` variables at build time, and those values are visible to users in the browser. Keep passwords, database credentials, and JWT secrets exclusively in backend environment variables. See the [official Vite deployment guide](https://vite.dev/guide/static-deploy) for host-specific static-site settings.

A GitHub Actions workflow at `.github/workflows/ci.yml` runs the frontend build and backend Maven tests on pushes and pull requests. A successful CI run is a build/test signal, not a substitute for end-to-end testing against the deployed database.

## Tests and quality checks

```powershell
# Frontend
npm run build
npm run lint

# Backend, from backend/
mvn test
```

Run these locally before publishing. Tests and builds have not necessarily been run on every developer machine.

## Screenshots

Add genuine screenshots of the landing page, reader story view, writer story editor, and admin dashboard under `docs/screenshots/`, then embed them here using relative links, for example:

```markdown
![Admin dashboard](docs/screenshots/admin-dashboard.png)
```

Do not include screenshots containing real passwords, tokens, private user data, or database credentials.

## GitHub safety checklist

- Keep `.env` and local config files out of Git; commit `.env.example` files with placeholders only.
- Keep `node_modules/`, `dist/`, Maven `target/`, logs, and local database backups out of Git.
- Review `git status` and scan staged changes before each commit.
- If a secret was ever committed, rotate it; deleting it in a later commit does not remove it from Git history.
