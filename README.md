# E2EE (Zero-Knowledge) File Transfer System

This is a portfolio project demonstrating a secure file transfer service based on a **Zero-Knowledge Architecture**.

The entire **encryption (AES-256)** and **decryption** process occurs entirely client-side (in the browser). The server (back-end and storage) never has access to the decryption key and only stores encrypted data blobs.

## Architecture

The security flow ensures that only the sender and the recipient (who possesses the link) can access the file's content.

1.  **Upload (Client-Side):**
    *   A user selects a file in the front-end (React).
    *   The browser generates a secure AES-GCM 256-bit encryption key and a unique Initialization Vector (IV).
    *   The file is encrypted in the browser's memory using the `Web Crypto API`.
    *   The front-end sends the **encrypted file** (as a blob) to the back-end API (NestJS).

2.  **Storage (Back-End):**
    *   The API (NestJS) acts as a *proxy*, receiving the encrypted blob.
    *   The API stores the encrypted blob in the Minio (S3) storage bucket.
    *   **Important:** The decryption key and IV **never** touch the server.

3.  **Share Link (Client-Side):**
    *   The front-end generates the share link in the format:
        `/download/[fileKey]#[keyBase64].[ivBase64]`
    *   The key and IV are stored in the **URL hash (`#`)**. By HTTP protocol design, the hash fragment is **never sent to the server**.

4.  **Download (Client-Side):**
    *   The recipient opens the link.
    *   The front-end (React) reads the `fileKey` (from the URL path) and the key/IV (from the URL hash).
    *   It requests the encrypted blob from the API using the `fileKey`.
    *   The file is downloaded and decrypted entirely in the recipient's browser.

## Tech Stack

The project is fully orchestrated with Docker Compose, ensuring a consistent development environment.

*   **Front-End:** **React** with **TypeScript** & **Vite** (Client-side crypto).
*   **Back-End (API):** **NestJS** (Node.js/TypeScript) (Acts as an upload/download proxy).
*   **Database:** **PostgreSQL** (Used by the service, though this simple implementation doesn't store metadata).
*   **Storage:** **Minio** (Self-hosted S3-compatible API).
*   **Infrastructure:** **Docker** & **Docker Compose**.
*   **Quality:** Strict ESLint, Prettier, and `tsconfig.json` configurations.

---

## How to Run the Project

### Prerequisites

*   [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose (included with Docker Desktop).
*   A code editor (like VS Code) with the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions.
*   Node.js and NPM (for syncing host dependencies for your editor).

### Setup and Launch

First, clone the repository to your local machine:

```bash
git clone [https://github.com/](https://github.com/)[YOUR_USERNAME]/e2ee-file-transfer.git
cd e2ee-file-transfer
```

Next, create the local `.env` file from the example. This file stores all passwords and secret keys.

```bash
# On Windows (PowerShell)
copy .env.example .env

# On Linux/macOS
cp .env.example .env
```

**Note:** You must ensure the variables in `.env` (like `VITE_API_BASE_URL=http://localhost:3000`) are set correctly for your local setup.

To ensure your code editor (ESLint/TypeScript) recognizes the packages that Docker uses, you must run `npm install` in both the frontend and backend directories on your host machine.

```bash
# Sync the Back-end
cd backend
npm install
cd ..

# Sync the Front-end
cd frontend
npm install
cd ..
```

Finally, build the images and start all four services (web, api, db, storage).

```bash
docker-compose up --build
```

(On the first run, this may take a few minutes to download the base images and install NPM dependencies).

Once the logs indicate that `e2ee_api` (back-end) and `e2ee_web` (front-end) have started successfully, you can access the application:

*   **Application (Upload):** `http://localhost:5173`
*   **Storage Console (Minio):** `http://localhost:9001`

(Login: `minioadmin` / `miniostrongpassword123` or as defined in your `.env`)

## Testing and Code Quality (Maintenance)

The project is configured for automated code quality checks.

### Run the Linter (Check)

To verify that the code adheres to the style rules (without making changes):

```bash
# Check the Front-end
docker-compose run --rm frontend npm run lint

# Check the Back-end
docker-compose run --rm backend npx eslint .
```

### Fix Linter Errors (Format)

To automatically fix formatting errors (Prettier, line endings LF):

```bash
# Fix the Front-end (via Docker)
docker-compose run --rm frontend npm run lint:fix

# Or fix on your host machine
cd frontend
npm run lint:fix
cd ..
```