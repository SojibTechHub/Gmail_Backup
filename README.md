# MailVault – Universal Email Recovery & Security Platform

**MailVault** is an enterprise-grade SaaS web platform engineered to help legitimate email account owners manage their recovery information, evaluate account recovery readiness, and restore access to their own or explicitly authorized email accounts through verified provider procedures.

---

## 🛡️ Core Architectural Pillars

1. **Multi-Provider Support**
   - Gmail / Google Workspace
   - Microsoft Outlook / Hotmail / Live
   - Yahoo Mail
   - Apple iCloud Mail
   - Zoho Mail
   - Proton Mail
   - GMX Mail
   - AOL Mail
   - Yandex Mail
   - Custom Domain & Other IMAP/SMTP

2. **Zero-Knowledge Client-Side Vault**
   - **AES-256-GCM** client-side encryption using the standard **W3C Web Crypto API**.
   - **PBKDF2** key derivation with 100,000 iterations of SHA-256.
   - Master passphrases and encryption keys never leave the browser.
   - Zero sensitive plaintext storage: administrators cannot decrypt or read private recovery credentials.

3. **Universal Recovery Assistant**
   - Guided step-by-step restoration wizard.
   - Direct integration with verified official provider recovery URLs.
   - Heuristic evaluation of available recovery channels: Secondary Email, Mobile SMS, 2FA Backup Codes, TOTP Authenticator, Trusted Devices, and Support Portals.
   - Full legal compliance: strictly enforces legitimate owner verification and never bypasses provider MFA, security questions, or CAPTCHA.

4. **Multi-User Security & Governance**
   - **Argon2id** password hashing.
   - Time-based One-Time Passwords (TOTP) Multi-Factor Authentication with emergency backup codes.
   - HttpOnly, SameSite, Secure cookies for JWT session management.
   - Role-Based Access Control (User, Admin, Super Admin).
   - 90-day automated TTL audit trail with secret redaction.

---

## 📁 Repository Structure

```
mailvault/
├── backend/                       # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/                # Environment, Database, Seed, Providers
│   │   ├── controllers/           # Auth, Accounts, Vault, Recovery, Admin, Notifications
│   │   ├── middlewares/           # Auth, ErrorHandler, RateLimiter, Security, Validation
│   │   ├── models/                # User, EmailAccount, RecoveryVault, RecoverySession, etc.
│   │   ├── routes/                # REST endpoints (/api/auth, /api/accounts, /api/recovery, etc.)
│   │   ├── services/              # Business logic & Database interaction
│   │   ├── types/                 # Enums and TypeScript interfaces
│   │   ├── utils/                 # Logger (Winston), Email (Nodemailer), Encryption, Helpers
│   │   ├── validators/            # Zod validation schemas
│   │   └── server.ts              # Server bootstrap and graceful shutdown
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                      # Next.js 15 (App Router) + Tailwind CSS + DaisyUI
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/            # Login, Register, Forgot Password, Verify Email
    │   │   ├── (dashboard)/       # Overview, Accounts, Recovery Center, Vault, Settings, Profile
    │   │   ├── (admin)/           # Admin Console, User Directory, Global Accounts, Audit Logs
    │   │   ├── globals.css        # Tailwind + DaisyUI + Cyber aesthetics
    │   │   ├── layout.tsx         # Providers (Theme, Auth, Sonner Toaster)
    │   │   └── page.tsx           # High-converting SaaS landing page
    │   ├── components/
    │   │   ├── accounts/          # AccountCard, AccountForm, AccountFilters, ProviderIcon
    │   │   ├── admin/             # AdminStatsGrid, ProviderStats
    │   │   ├── auth/              # LoginForm, RegisterForm, MfaInput, PasswordStrength
    │   │   ├── dashboard/         # WelcomeCard, StatsGrid, ReadinessChart, RecentActivities
    │   │   ├── layout/            # Navbar, Sidebar, DashboardLayout, AuthLayout, Footer
    │   │   ├── recovery/          # RecoveryWizard, ReadinessReport, ProviderInstructions
    │   │   ├── ui/                # Button, Input, Modal, DataTable, Skeleton, StatCard, etc.
    │   │   └── vault/             # VaultStatus, VaultUnlock, VaultForm (AES-256-GCM)
    │   ├── contexts/              # AuthContext, ThemeContext
    │   ├── hooks/                 # useAuth, useAccounts, useRecovery, useNotifications
    │   ├── lib/                   # axios client, client-side encryption (Web Crypto)
    │   ├── services/              # API clients for all backend endpoints
    │   └── types/                 # Shared frontend models and enums
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017/mailvault`) or MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Verify environment variables
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Default seeded administrator credentials:
- **Email**: `admin@mailvault.com`
- **Password**: `AdminPassword123!`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 REST API Reference Summary

### Authentication (`/api/auth`)
- `POST /register`: Register user account
- `POST /login`: Authenticate with password & optional MFA code
- `POST /logout`: Invalidate session and clear cookies
- `POST /verify-email`: Verify registration token
- `POST /forgot-password`: Send password reset email
- `POST /reset-password`: Reset password with token
- `POST /refresh-token`: Refresh access JWT
- `GET /me`: Get authenticated user profile
- `POST /mfa/enable`: Generate TOTP secret and QR code
- `POST /mfa/verify`: Verify TOTP code and return emergency backup codes
- `POST /mfa/disable`: Disable MFA

### Email Accounts (`/api/accounts`)
- `GET /`: List user's email accounts with pagination and filters
- `POST /`: Add a new email account
- `GET /stats`: Retrieve dashboard statistics
- `GET /:id`: Retrieve single account details
- `PATCH /:id`: Update account metadata and recovery flags
- `DELETE /:id`: Remove account and associated vault data

### Universal Recovery (`/api/recovery`)
- `GET /providers`: List all supported email providers
- `GET /providers/:provider`: Retrieve recovery URL, methods, and step-by-step instructions
- `GET /readiness/:accountId`: Generate intelligent recovery readiness report and score
- `POST /sessions`: Initiate a recovery session
- `GET /sessions`: List user's recovery attempts
- `GET /sessions/:id`: Get session details
- `PATCH /sessions/:id`: Update session progress and record outcome

### Secure Vault (`/api/vault`)
- `GET /:accountId`: Fetch AES-256-GCM encrypted ciphertext blob
- `PUT /:accountId`: Upsert client-encrypted blob (`encryptedData`, `iv`, `authTag`)
- `DELETE /:accountId`: Purge vault data

### Administration (`/api/admin`)
- `GET /statistics`: Platform analytics & provider distribution
- `GET /users`: User directory with role filter
- `PATCH /users/:id/role`: Promote or modify user role
- `GET /accounts`: Global accounts directory (zero-knowledge)
- `GET /audit-logs`: Immutable system audit trail
- `PATCH /providers/:provider`: Update provider configuration
