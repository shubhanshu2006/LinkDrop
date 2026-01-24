# LinkDrop Backend – Deep Architecture & Flow Documentation

This document is an **internal engineering reference** for the LinkDrop backend. It is intentionally long, precise, and explicit. Its goal is that **any backend engineer can read this once and fully understand the system without reading the entire codebase**.

This is not a marketing README. This is **system documentation**.

---

## 1. Design Philosophy (Read This First)

Before understanding files, it is important to understand **why this backend is designed the way it is**.

### Core Principles

1. **Backend is the single source of truth**
   - Client is never trusted
   - All security rules live on the server

2. **Explicit state over implicit behavior**
   - File access is controlled by stored timestamps and flags
   - No logic relies on frontend timers

3. **Separation of concerns**
   - Middleware prepares context
   - Controllers orchestrate HTTP
   - Services enforce rules
   - Models store state

4. **Security-first, convenience-second**
   - OTP is hashed
   - Access windows are server-timed
   - Anonymous users are controlled, not ignored

---

## 2. High-Level System Diagram

```
Client (Browser / App)
        │
        ▼
┌───────────────────┐
│ Express Router    │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Middleware Layer  │
│ - anonymousAuth   │
│ - verifyJWT       │
│ - upload          │
│ - fileAccessGuard │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Controllers       │
│ - auth.controller │
│ - file.controller │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Services          │
│ - auth.service    │
│ - fileAccess      │
│ - fileOtp         │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Models (MongoDB)  │
│ - User            │
│ - PendingUser     │
│ - File            │
└───────────────────┘
```

Each layer **only talks to the layer directly below it**.

---

## 3. Entry & Bootstrap Files

### `app.js`

**Purpose:** Configure the Express application

What it does:

- Initializes Express
- Sets up CORS
- Enables JSON and URL parsing
- Enables cookie parsing
- Registers all route modules

What it does NOT do:

- No database logic
- No business logic
- No security rules

Reason for existence:

- Keeps application configuration separate from server startup

---

### `server.js`

**Purpose:** Start the application

What it does:

- Loads environment variables
- Connects to MongoDB
- Starts HTTP server
- Handles fatal startup errors

Why this file exists:

- Allows `app.js` to be imported for testing
- Clean separation between configuration and execution

---

## 4. Routes Layer (Traffic Mapping)

Routes define **what URLs exist** and **which middleware + controller handle them**.

Routes contain **zero logic**.

---

### `auth.routes.js`

Maps authentication-related endpoints.

Examples:

- `/register`
- `/login`
- `/refresh-token`
- `/verify-email`
- `/forgot-password`

Why routes are thin:

- Makes security review easier
- Prevents logic duplication

---

### `file.routes.js`

Maps all file-related endpoints.

Important patterns:

- Anonymous access allowed for viewing and OTP
- JWT required for destructive actions
- Guard middleware always runs before file access

This file defines the **entire security perimeter of file access**.

---

### `healthcheck.route.js`

Simple liveness endpoint.

Purpose:

- Used by hosting platforms
- Used by monitoring tools

---

## 5. Middleware Layer (Context & Protection)

Middleware runs **before controllers** and prepares request context.

---

### `auth.middleware.js` (verifyJWT)

**Responsibility:**

- Validate access token
- Attach authenticated user to request

Used when:

- User must be logged in

Security guarantee:

- Prevents unauthorized access to protected routes

---

### `anonymous.middleware.js` (anonymousAuth)

**Responsibility:**

- Allow both anonymous and authenticated users
- Create anonymous user if no token exists
- Issue short-lived anonymous access token

Why this exists:

- Anonymous uploads
- Anonymous file access
- Later account claiming

Important invariant:

- Every request always has `req.user`

---

### `upload.middleware.js`

**Responsibility:**

- Handle multipart file uploads
- Enforce max file size
- Enforce allowed MIME types
- Generate secure filenames

Why filenames are randomized:

- Prevent path traversal
- Prevent guessing file URLs

---

### `fileAccessGuard.middleware.js`

**Responsibility:**

- Load file from database
- Reject non-existent files
- Reject expired links
- Reject disabled files

Why this is critical:

- Controllers never repeat these checks
- Centralizes access preconditions

---

## 6. Controllers Layer (HTTP Orchestration)

Controllers translate **HTTP requests** into **service calls**.

They do not implement rules.

---

### `auth.controller.js`

Handles:

- Registration
- Email verification
- Login
- Logout
- Token refresh
- Password change
- Password reset

Key principle:

- Tokens are issued only after identity is verified

---

### `file.controller.js`

Handles:

- File upload
- File streaming
- OTP request
- OTP verification
- File deletion
- File settings update

Important rule:

- File streaming happens only after access is approved by services

---

## 7. Services Layer (Business Rules)

Services contain **all decision-making logic**.

---

### `auth.service.js`

Purpose:

- Generate access tokens
- Generate refresh tokens
- Rotate refresh tokens securely

Why separate from controller:

- Security logic stays centralized

---

### `fileAccess.service.js` (canAccessFile)

This is the **policy engine**.

It decides:

- Whether access is allowed
- Whether download is allowed
- Whether offline save is allowed

It enforces:

- File type rules
- OTP verification
- Access windows
- Email restrictions

Controllers only ask:

> “Can this user do this action?”

---

### `fileOtp.service.js`

Purpose:

- Generate OTP
- Hash OTP
- Store expiry
- Verify OTP
- Start access window

Critical guarantees:

- OTP is single-use
- OTP is time-limited
- Access window starts only after verification

---

## 8. Models Layer (Persistent State)

Models define **what exists**, not **what happens**.

---

### `user.model.js`

Represents:

- Anonymous users
- Registered users

Key idea:

- Anonymous users are first-class citizens

---

### `pendingUser.model.js`

Temporary storage for unverified users.

Why this exists:

- Prevent login before email verification
- Prevent fake account creation

---

### `file.model.js`

Represents the **entire file lifecycle**.

Stores:

- Ownership
- Metadata
- Security mode
- Access state
- OTP state
- Audit data

This model is the backbone of LinkDrop.

---

## 9. Utils Layer (Infrastructure Helpers)

### ApiError

Standardized error handling with HTTP status codes.

---

### ApiResponse

Standardized success responses.

---

### asyncHandler

Eliminates repetitive try-catch blocks.

---

### Email Utilities (Brevo)

Files:

- sendVerificationEmail
- sendResetPasswordEmail
- sendOtpEmail

Purpose:

- Encapsulate email delivery
- Keep controllers clean

---

## 10. Virus Scanning Flow

1. File uploaded to disk
2. Database record created
3. Scan status set to `pending`
4. Virus scan job runs
5. Result updates `scanStatus`
6. Access guard enforces result

Infected files:

- Are permanently blocked
- Can be disabled by admin
- Are removed by cleanup jobs

---

## 11. Cleanup Jobs (Lifecycle Management)

A scheduled cleanup job runs periodically.

It removes:

- Expired files
- Files past access window
- Corresponding disk files
- Database records

Why cleanup matters:

- Prevents disk bloat
- Prevents stale access
- Maintains security guarantees

---

## 12. File Listing API

Allows users to list their uploaded files.

Supports:

- Pagination
- Filtering
- Sorting

Security:

- Only metadata is returned
- Sensitive fields are excluded

---

## 13. Admin Controls

Admins can:

- Disable files
- Mark files as infected
- Prevent access without deletion

Admins are currently managed via database flags and can be expanded later.

---

## 14. End-to-End Flow Diagrams

### Normal File Access

```
Client
  ↓
GET /files/:id
  ↓
anonymousAuth
  ↓
fileAccessGuard
  ↓
canAccessFile → allowed
  ↓
getFile → stream
```

---

### Sensitive File Access

```
Client
  ↓
GET /files/:id
  ↓
link expiry enforced
  ↓
offline allowed
  ↓
access revoked at expiry
```

---

### Very Sensitive File Access

```
Client opens link
  ↓
OTP required
  ↓
POST /request-otp
  ↓
OTP emailed
  ↓
POST /verify-otp
  ↓
accessEndsAt set
  ↓
GET /files/:id
  ↓
allowed until expiry
```

---

## 15. Security Invariants (Must Never Break)

- OTP is never stored in plain text
- File access is always server-timed
- File URLs are never direct
- Anonymous users always have identity
- Expired access is irreversible

---

## 16. Final Notes

This backend is intentionally explicit, strict, and verbose in state.

The goal is:

- Predictability
- Security
- Long-term maintainability

Any future feature must respect these invariants.
