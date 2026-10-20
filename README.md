# LuxuryDrive - Premium Car Rental Platform 

LuxuryDrive is a full-stack luxury car rental web application with a modern React frontend and a robust Node.js/Express backend.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Swiper, React Router v7, i18next (Arabic, English, French)
- **Backend**: Node.js, Express, Sequelize ORM, SQLite / MySQL, JWT Authentication, Swagger / OpenAPI Docs
- **Security**: HTTPS/SSL (local mkcert), bcrypt password hashing, input validation

---

## Project Structure

```text
├── backend/
│   ├── config/          # Swagger and environment configs
│   ├── controllers/     # Route logic (Auth, Cars, Bookings, etc.)
│   ├── middleware/      # Auth & file upload middleware
│   ├── models/          # Sequelize models (User, Car, Booking, etc.)
│   ├── routes/          # Express API route declarations
│   ├── uploads/         # Uploaded images (ignored by git)
│   └── server.js        # Backend entrypoint
├── frontend/
│   ├── src/             # React source code (components, pages, context)
│   ├── public/          # Static assets
│   └── vite.config.js   # Vite configuration
└── certs/               # Local SSL certificates (ignored by git for security)
```

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [mkcert](https://github.com/FiloSottile/mkcert) (for local HTTPS certificates)

### 2. Generate Local HTTPS Certificates
For secure local development, create a `certs/` folder in the project root and generate the certificates:
```bash
mkdir certs
cd certs
mkcert -install
mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1
cd ..
```

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   Backend will be running on `https://localhost:5000` (API Docs: `https://localhost:5000/api/docs`).

### 4. Frontend Setup
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Copy environment template:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Frontend will be running on `https://localhost:5173`.
