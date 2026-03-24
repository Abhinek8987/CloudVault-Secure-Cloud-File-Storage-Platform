<div align="center">

# ☁️ CloudVault — Secure Cloud File Storage Platform

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-4.0.4-F2F4F9?style=for-the-badge&logo=spring-boot" />
  <img src="https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Security-JWT-6DB33F?style=for-the-badge&logo=Spring-Security&logoColor=white" />
  <img src="https://img.shields.io/badge/H2_Database-embedded-003545?style=for-the-badge&logo=h2&logoColor=white" />
</p>

A full-stack enterprise cloud storage platform with JWT-based authentication, OTP email verification, role-based access control, and a powerful admin portal with real-time analytics.

</div>

---

## 🏗️ Architecture of the Project

### High-Level Architecture

```mermaid
graph TD
A[React Frontend <br/> Vite + Tailwind CSS] -->|REST API calls| B[Spring Boot Backend <br/> Port 8080]
B --> C[Spring Security <br/> JWT Auth Filter]
C --> D[Service Layer <br/> AuthService / FileService / AdminService]
D --> E[JPA Repository <br/> H2 Embedded Database]
D --> F[File System <br/> /uploads directory]
D --> G[JavaMailSender <br/> Gmail SMTP OTP]
```

### Request Flow

```mermaid
sequenceDiagram
participant User
participant React Frontend
participant Spring Boot API
participant JWT Filter
participant Database

User->>React Frontend: Enter credentials
React Frontend->>Spring Boot API: POST /api/auth/login
Spring Boot API->>Database: Validate user credentials
Database-->>Spring Boot API: User entity
Spring Boot API->>User: Send OTP via Gmail SMTP (first login)
User->>React Frontend: Enter OTP
React Frontend->>Spring Boot API: POST /api/auth/verify-login
Spring Boot API-->>React Frontend: JWT Token + User Info
React Frontend->>Spring Boot API: GET /api/files (Bearer Token)
JWT Filter->>JWT Filter: Validate & decode token
Spring Boot API-->>React Frontend: File list response
```

---

## ✨ Core Features

### 👤 User Portal (`/dashboard`)
- Drag & Drop file upload with real-time progress bar (up to 50MB)
- File listing with search, download, and delete
- Overview dashboard with storage stats and file type breakdown
- Notification system and dark/light theme toggle
- Secure password change with auto-logout

### 🛡️ Admin Portal (`/admin`)
- Analytics dashboard with Recharts — Pie, Area, and Bar charts
- User directory with search, role filter, block/unblock, and soft delete
- Archived users panel with restore or permanent delete (cascading disk wipe)
- Global file index across all users with Vault (quarantine) and Restore
- Deep user profile telemetry — login timestamps, storage footprint, file history

### 🔐 Security
- Stateless JWT authentication (24hr expiry)
- First-login OTP email verification via Gmail SMTP
- Forgot password OTP reset flow
- BCrypt password hashing
- Role-based route guards (`ROLE_USER` / `ROLE_ADMIN`)
- File ownership enforcement — users can only access their own files
- Custom confirm modals — zero use of `window.confirm`

---

## 📸 Screenshots

### Authentication
![Login Page](Screenshot/screenshot_1_login.png)
![Register Page](Screenshot/screenshot_2_register.png)
![OTP Verification](Screenshot/screenshot_3_otp_verification.png)

### User Dashboard
![User Dashboard Overview](Screenshot/screenshot_4_user_dashboard.png)
![File Upload](Screenshot/screenshot_5_file_upload.png)
![My Files](Screenshot/screenshot_6_my_files.png)

### Admin Portal
![Admin Dashboard](Screenshot/screenshot_7_admin_dashboard.png)
![Admin Analytics Charts](Screenshot/screenshot_8_admin_charts.png)
![Admin User Directory](Screenshot/screenshot_9_admin_users.png)

### Admin Deep Features
![User Profile Telemetry](Screenshot/screenshot_10_user_profile_telemetry.png)
![Admin Global Files](Screenshot/screenshot_11_admin_files.png)
![Archived Users](Screenshot/screenshot_12_archived_users.png)

---

## 🚀 Running Locally

### Backend
```bash
cd backend/
./mvnw spring-boot:run
```
> Runs on `http://localhost:8080`. Requires Java 17+.

### Frontend
```bash
cd frontend/
npm install
npm run dev
```
> Runs on `http://localhost:5173`.

### Default Admin Account
On first boot, the system auto-provisions:
```
Email:    admin@cloudstorage.com
Password: admin123
```

### Gmail SMTP (OTP)
Update `backend/src/main/resources/application.properties` with your Gmail credentials and App Password to enable OTP emails.

---

## 🗂️ Project Structure

```
cloud-file-storage/
├── backend/                        # Spring Boot application
│   └── src/main/java/com/cloudstorage/backend/
│       ├── config/                 # Security, CORS, DataInitializer
│       ├── controller/             # Auth, File, Admin REST controllers
│       ├── service/                # Business logic layer
│       ├── entity/                 # User, FileItem JPA entities
│       ├── repository/             # Spring Data JPA repositories
│       ├── security/               # JWT filter & service
│       └── dto/                    # Request/Response DTOs
├── frontend/                       # React + Vite application
│   └── src/
│       ├── pages/                  # Login, Register, Dashboard, Admin pages
│       ├── components/             # ConfirmModal
│       ├── context/                # AuthContext (JWT state)
│       └── api/                    # Axios config with interceptor
├── Screenshot/                     # UI screenshots
├── run_backend.bat                 # Windows backend launcher
├── run_frontend.bat                # Windows frontend launcher
└── docker-compose.yml              # Docker setup (PostgreSQL)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 4, Recharts, Lucide Icons |
| Backend | Spring Boot 4, Spring Security, Spring Data JPA |
| Auth | JWT (jjwt 0.12.5), BCrypt, OTP via Gmail SMTP |
| Database | H2 (embedded, file-persisted) |
| File Storage | Local filesystem (`/uploads`) |
| HTTP Client | Axios with Bearer token interceptor |

---

*Built with a focus on enterprise-grade security, clean UI, and full-stack depth.*
