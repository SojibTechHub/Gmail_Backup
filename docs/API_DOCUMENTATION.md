# MailVault – REST API Specification & Architecture Guide

**Version:** 1.2.0  
**Base URL:** `http://localhost:5000/api` (Production: `https://api.mailvault.com/api`)  
**Security:** Cookie-based HttpOnly JWT sessions + `Authorization: Bearer <token>` fallback

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register new user account with Argon2id password hash |
| `POST` | `/login` | Public | Sign in with email, password, and optional TOTP code |
| `POST` | `/google` | Public | Verify Google OAuth 2.0 credential and sign in/up |
| `POST` | `/logout` | Public | Terminate active session and clear HttpOnly cookies |
| `POST` | `/verify-email` | Public | Verify user email address via token |
| `POST` | `/forgot-password`| Public | Initiate password reset email dispatch |
| `POST` | `/reset-password` | Public | Complete password reset with secure token |
| `POST` | `/refresh-token` | Public | Rotate access token using valid refresh token |
| `GET`  | `/me` | User | Retrieve current authenticated user profile |
| `PATCH`| `/profile` | User | Update user display name or avatar |
| `POST` | `/change-password`| User | Update master password with current password verification |
| `POST` | `/mfa/enable` | User | Generate TOTP secret and QR code for authenticator setup |
| `POST` | `/mfa/verify` | User | Verify initial TOTP token and issue 10 emergency backup codes |
| `POST` | `/mfa/disable`| User | Disable two-factor authentication with verification code |
| `GET`  | `/sessions` | User | List all active device sessions and IP addresses |
| `DELETE`| `/sessions/:id`| User | Remotely terminate a specific active session |
| `DELETE`| `/sessions/other`| User | Log out from all other devices except the current session |
| `DELETE`| `/account` | User | Permanently purge user account, emails, and encrypted vaults |

---

## 2. Email Account Management (`/api/accounts`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET`  | `/` | User | List email accounts with search, provider filter, pagination |
| `POST` | `/` | User | Add new email account with automatic provider detection |
| `GET`  | `/stats` | User | Retrieve overview metrics for dashboard cards |
| `GET`  | `/health-monitor`| User | Real-time audit of stale credentials & missing 2FA codes |
| `GET`  | `/:id` | User | Retrieve detailed information for a specific email account |
| `PATCH`| `/:id` | User | Update account metadata, ownership status, or labels |
| `DELETE`| `/:id` | User | Delete email account and cascade-delete its encrypted vault |

---

## 3. Zero-Knowledge Client-Side Vault (`/api/vault`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET`  | `/:accountId` | User | Retrieve encrypted vault payload (`encryptedData`, `iv`, `authTag`) |
| `PUT`  | `/:accountId` | User | Save client-side encrypted ciphertext, IV, and auth tag |
| `DELETE`| `/:accountId` | User | Purge ciphertext record for the specified account |

> **Zero-Knowledge Guarantee:** The server only receives `{ encryptedData: string, iv: string, authTag: string }`. Master passphrases and decryption keys are never transmitted to the API.

---

## 4. Universal Recovery Engine (`/api/recovery`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET`  | `/providers` | Public | List all 10+ supported email providers and capabilities |
| `GET`  | `/providers/:provider` | Public | Retrieve official recovery URLs and step instructions |
| `POST` | `/sessions` | User | Initiate a tracked official recovery session |
| `GET`  | `/sessions` | User | List past and active recovery attempts |
| `GET`  | `/sessions/:id` | User | Get details of a specific recovery attempt |
| `PATCH`| `/sessions/:id` | User | Update status (e.g. `completed`, `failed`) and step progress |
| `GET`  | `/readiness/:accountId`| User | Generate explainable 0–100% readiness scorecard |

---

## 5. Administration Console (`/api/admin`)

*Restricted strictly to users with `role: "admin"` or `"super_admin"`.*

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET`  | `/statistics` | Admin | Platform metrics, provider distribution, recent audit logs |
| `GET`  | `/users` | Admin | Paginated user directory with search and role filters |
| `GET`  | `/users/:id` | Admin | Detailed user profile, registered account count |
| `PATCH`| `/users/:id/role`| Admin | Update user privileges (`user` ↔ `admin`) |
| `GET`  | `/accounts` | Admin | Global account inventory (**Zero-Knowledge**: cannot decrypt) |
| `GET`  | `/audit-logs` | Admin | 90-day sanitized forensic security audit log viewer |
| `PATCH`| `/providers/:provider`| Admin | Update official recovery URL or provider documentation |

---

## 6. Notifications Engine (`/api/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET`  | `/` | User | Get user notifications with unread count |
| `PATCH`| `/:id/read` | User | Mark a specific notification as read |
| `PATCH`| `/read-all` | User | Mark all pending notifications as read |
| `DELETE`| `/:id` | User | Delete notification record |
