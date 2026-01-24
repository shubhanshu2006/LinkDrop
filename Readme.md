# LinkDrop

LinkDrop is a secure file sharing platform designed to give senders precise control over how files are accessed, stored, and expired.  
The system supports three strict file security levels and enforces all access rules at the backend level.

The platform allows anonymous usage, seamless account claiming, time-based access control, and secure delivery without violating browser security constraints.

---

## Project Overview

LinkDrop solves the problem of sharing files with different sensitivity requirements while maintaining strict control over access duration, download permissions, and offline persistence.

Senders choose one of three file security options at upload time. Each option defines exactly how receivers may view, download, or retain the file.  
All rules are enforced by the backend and **cannot be bypassed from the client side**.

---

## Core Design Principles

- Backend is the **single source of truth**
- Frontend is never trusted for access control
- All timing rules are enforced server-side
- Anonymous users are first-class citizens
- Security rules are explicit and state-driven
- Files are never exposed via direct URLs

---

## Global Rules

These rules apply to all file types:

- Sender can always set a link expiry
- Link expiry prevents new access through the link
- Behavior of already accessed or saved content depends on the selected file option
- Exactly one file option must be selected per upload
- File options are limited to:
  - Normal
  - Sensitive
  - Very Sensitive

---

## Sender Flow

### Step 1: Upload File

- Sender uploads a file
- Sender provides file metadata
- Sender selects a file security option

Anonymous users are allowed to upload files.  
Uploaded files are linked to an anonymous account and can later be claimed after signup.

---

### Step 2: Set Link Expiry

- Sender sets a link expiry timestamp
- Used for deadlines, assignments, or temporary access
- Expiry determines when **new access attempts are blocked**

---

### Step 3: Select File Security Option

Sender must choose **exactly one** security option.

---

## Option 1: Normal File

### Sender Intent

Receivers should be able to freely download or save the file while the link is active.

### Sender Settings

- File type: Normal
- Link expiry: Optional
- Device download: Allowed
- Website-only offline save: Allowed
- OTP verification: Not required

---

### Receiver Flow

While the link is active, the receiver can:

#### Device Download

- Standard browser download
- File is permanently saved on the device
- Sender loses control after download

#### Website-only Offline Save

- File is stored in browser-managed storage (IndexedDB)
- Receiver selects duration (10 min, 1 hour, 1 day, custom)
- File is accessible:
  - Online
  - Offline through the website or PWA

---

### Behavior After Link Expiry

- New users cannot access the link
- Online re-fetch is blocked
- Existing offline copies continue working
- Offline copies auto-delete after receiver-selected duration
- Sender expiry does **not** affect existing offline copies

---

## Option 2: Sensitive File

### Sender Intent

The file should never be permanently saved, and all access must end strictly at link expiry.

### Sender Settings

- File type: Sensitive
- Link expiry: Required
- Device download: Disabled
- Website-only offline save: Enabled
- OTP verification: Not required
- Receiver-controlled duration: Disabled

---

### Receiver Flow

While the link is active, the receiver can:

- View the file online
- Save the file offline on the website

The receiver **cannot choose** how long the offline copy exists.

---

### Behavior After Link Expiry

At the exact expiry time:

- Online access is blocked
- Website-offline copy is deleted automatically
- Offline access is blocked

No file data remains accessible after expiry.

---

## Option 3: Very Sensitive File

### Sender Intent

Only a specific person should open the file, and only for a fixed duration after verification.

---

### Sender Settings (All Mandatory)

- File type: Very Sensitive
- Allowed email address
- Link expiry
- Open duration after verification
- Device download: Disabled
- Website-only offline save: Disabled
- OTP verification: Required

---

### Receiver Flow

#### Step 1: Open Link

System verifies:

- Link exists
- Link is not expired

If expired, access is denied.

---

#### Step 2: Verification Screen

Receiver sees:

- Protected file notice
- Pre-filled, read-only email address
- Option to request OTP

---

#### Step 3: OTP Generation

- 6-digit OTP is generated
- OTP is emailed to the sender-defined email
- OTP is valid for 5 minutes
- OTP is single-use

OTP can be regenerated if expired or unused.  
OTP cannot be generated after the file is opened.

---

#### Step 4: OTP Verification

If OTP is invalid or expired, access is denied.

If OTP is valid:

- File is marked as opened
- OTP generation is permanently disabled
- Access timer starts
- Access end time = `otpVerifiedAt + openDuration`

---

#### Step 5: Viewing Window

While current time < access end time:

- File can be viewed
- Page refresh is allowed
- Download is disabled
- Offline save is disabled

---

#### Step 6: Auto Close

When access window ends:

- File closes immediately
- Access is permanently blocked
- OTP remains disabled forever
- Link becomes unusable

Even if link expiry is later, access is permanently revoked.

---

## Storage and Access Matrix

| Option         | Device Download | Website Offline | Duration Controlled By |
| -------------- | --------------- | --------------- | ---------------------- |
| Normal         | Allowed         | Allowed         | Receiver               |
| Sensitive      | Disabled        | Allowed         | Sender (Link Expiry)   |
| Very Sensitive | Disabled        | Disabled        | Sender (Open Duration) |

---

## Security and Enforcement

- All access rules enforced at backend level
- Direct file URLs are never exposed
- Files are streamed through controlled endpoints
- OTPs are hashed and never stored in plain text
- Access timers are server-controlled
- Anonymous users are fully supported
- JWT authentication with refresh tokens
- HTTP-only cookies for token storage
- Virus scanning enforced before access
- Disabled or infected files are blocked

---

## Backend Architecture

- Node.js with Express
- MongoDB with Mongoose
- JWT-based authentication
- Email services via Brevo
- Modular controllers and services
- Centralized error handling
- Background cleanup jobs (cron)
- Intent-based access control

---

## Implemented Features

- Anonymous uploads and access
- Email verification
- OTP-based file access
- Time-based access control
- File listing APIs
- Admin moderation APIs
- Automatic cleanup of expired files

---

## Use Case Mapping

- Assignments: Normal files
- Temporary private sharing: Sensitive files
- Confidential documents: Very Sensitive files

---

## Author

Developed by **Shubhanshu Singh**

---

## License

All rights reserved.  
This project is intended for personal and educational use.  
Unauthorized commercial use is prohibited.
