# 🌐 Profoliox Server — Backend API

This repository contains the backend Express API for **Profoliox**, an AI-powered portfolio generator. It manages user authentication, database operations via Prisma, payment integration with Razorpay, image uploads with Cloudinary, and resume parsing combined with Gemini AI portfolio generation.

---

## ⚡ Core Features

- **🤖 AI-Powered Portfolio Generation:** Uses `@google/generative-ai` (Gemini 1.5 Flash) with strict JSON response configuration to write copy, draft bios, list skills, and format projects based on user-supplied resumes or prompts.
- **📄 Resume Text Extraction:** Supports parsing of `.pdf` files (using `pdf-parse`) and `.docx` files (using `mammoth`) directly in memory.
- **🔐 Secure Authentication:** Supports traditional credentials (hashed using `bcryptjs`) and secure login/sign-up flows. Features standard JWT authorization middleware (`isAuth.ts`) and Google OAuth login integration.
- **💳 Razorpay Payment Integration:** Custom order creation and cryptographic webhook signature verification to handle tier/credit upgrades.
- **☁️ Cloudinary Media Uploads:** Multi-part form-data support using `multer` and `multer-storage-cloudinary` to host user profile pictures and custom portfolio screenshots.
- **🗄️ Relational Database (Prisma ORM):** Connects to a PostgreSQL database defining models for both `User` accounts and generated `Portfolio` objects.

---

## 🛠️ Technology Stack

- **Runtime Environment:** [Node.js (v18+)](https://nodejs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Framework:** [Express (v5.x)](https://expressjs.com/)
- **Dev Runner:** [tsx](https://github.com/privatenumber/tsx) (TypeScript Execute)
- **Database / ORM:** [Prisma Client](https://www.prisma.io/) & PostgreSQL
- **AI Integration:** [Google Gemini API Client](https://ai.google.dev/)
- **Parsing Libraries:** [mammoth](https://www.npmjs.com/package/mammoth) (DOCX) & [pdf-parse](https://www.npmjs.com/package/pdf-parse)
- **Authentication:** [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken), [bcryptjs](https://www.npmjs.com/package/bcryptjs), [google-auth-library](https://www.npmjs.com/package/google-auth-library)
- **Payment & Cloud Integration:** [razorpay](https://razorpay.com/), [cloudinary](https://cloudinary.com/), [multer](https://github.com/expressjs/multer)

---

## 📂 Project Structure

```bash
profoliox-server/
├── controller/            # Request handlers / controllers
│   ├── googleController.ts     # Google OAuth handler
│   ├── portfolioController.ts  # Resume parsing and Gemini AI generator logic
│   ├── razorpayController.ts   # Razorpay order & verification handlers
│   ├── uploadController.ts     # Cloudinary image upload helper
│   └── userController.ts       # Auth status, login, sign-up, and query history
├── db/                    # DB connection logic
│   ├── connectDB.ts            # Prisma client instance setup
│   └── cloudinary.ts           # Cloudinary instance & multer storage configuration
├── middleware/            # Custom Express middlewares
│   └── isAuth.ts               # JWT verification & request attachment middleware
├── prisma/                # Prisma configuration
│   └── schema.prisma           # Prisma database schema definition (PostgreSQL)
├── routes/                # Route definitions & router exports
│   ├── portfolioRoutes.ts      # Portfolio generation & upload endpoints
│   ├── razorpayRoutes.ts       # Order creation & verification endpoints
│   └── userRoutes.ts           # Authentication & history query routes
├── .env.example           # Reference environment variables file
├── index.ts               # Server entry point & CORS configuration
├── tsconfig.json          # TypeScript compiler configuration
└── package.json           # Scripts and package definitions
```

---

## 🚀 Getting Started

Follow these steps to run the backend API server locally:

### 1. Prerequisites
- Ensure you have **Node.js** installed on your system.
- Ensure you have a running instance of **PostgreSQL** (local or hosted e.g., Render, Neon).

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/MohdAyaanSiddiqui/Profoliox.git
cd Profoliox/profoliox-server
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root of the `profoliox-server` directory and configure the following variables:
```env
# Database URI
DATABASE_URL="postgresql://username:password@localhost:5432/profoliox_db"

# Server configuration
PORT=5000
SALT=10
SECRET_KEY="your-jwt-super-secret-key"

# Third-party integrations
GEMINI_API_KEY="your-gemini-api-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# OAuth and payments
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
RAZORPAY_API_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
```

### 4. Database Setup & Migrations
Synchronize your schema with your database:
```bash
npx prisma db push
```

### 5. Start the Development Server
Run the development environment using `tsx`:
```bash
npm run dev
```
The server will boot up and be accessible at [http://localhost:5000](http://localhost:5000).

---

## ⚙️ Available Scripts

- `npm run dev` - Boots the development server with live reload powered by `tsx watch`.
- `npm run build` - Transpiles TypeScript files to vanilla JavaScript output (`tsc`).
- `npm run start` - Runs the server using the `tsx` compiler.
