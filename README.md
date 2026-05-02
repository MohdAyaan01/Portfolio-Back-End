# ProFolioX API Server

<div align="center">
  <p align="center">
    <b>The robust, AI-powered backbone of the ProFolioX ecosystem.</b>
  </p>
</div>

---

## 🚀 Overview
**ProFolioX Server** is a high-performance Node.js API built with **Express v5** and **TypeScript**. It serves as the intelligent core of the ProFolioX platform, handling complex AI content generation, secure authentication, file parsing (PDF/DOCX), and payment processing.

## ⚙️ Core Functionality
- 🧠 **AI Content Engine**: Integrates with **Google Gemini AI** (`@google/generative-ai`) to generate professional portfolio content.
- 📄 **Document Intelligence**: Parses user resumes and documents using `pdf-parse` and `mammoth` (DOCX) to extract relevant professional data.
- 🔐 **Advanced Auth**: Hybrid authentication system supporting **Google OAuth** and standard **JWT/Bcrypt** flows.
- 💳 **Payment Gateway**: Secure transaction handling integrated with **Razorpay**.
- ☁️ **Cloud Storage**: Seamless image and asset management via **Cloudinary** and **Multer**.
- 🗄️ **Database Management**: Type-safe database operations using **Prisma ORM**.

## 🛠️ Tech Stack
- **Runtime**: [Node.js](https://nodejs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Executed via `tsx`)
- **Framework**: [Express v5.x](https://expressjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **AI Integration**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Payments**: [Razorpay](https://razorpay.com/)
- **File Parsing**: `pdf-parse` & `mammoth`
- **Security**: `jsonwebtoken`, `bcryptjs`, `google-auth-library`

## 🏗️ Getting Started

### Prerequisites
- Node.js 20.x or higher
- A running PostgreSQL (or supported Prisma database) instance
- Cloudinary, Razorpay, and Google AI API credentials

### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/MohdAyaan01/ProFolioX-Server.git
   cd ProFolioX-Server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   Ensure your `.env` is configured, then run:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Environment Variables**
   Create a `.env` file with the following keys:
   ```env
   DATABASE_URL=
   JWT_SECRET=
   GOOGLE_AI_API_KEY=
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```
   The server will start on [http://localhost:5000](http://localhost:5000) (default).

## 📁 API Structure
- `controller/`: Business logic and route handlers.
- `routes/`: API endpoint definitions.
- `middleware/`: Auth guards, error handling, and file upload configs.
- `db/`: Database connection and Prisma client initialization.
- `prisma/`: Schema definition and migrations.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
<p align="center">Built by <a href="https://github.com/MohdAyaan01">Mohd Ayaan</a></p>
