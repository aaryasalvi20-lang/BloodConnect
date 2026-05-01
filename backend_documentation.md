# BloodConnect Backend Documentation

This document provides a comprehensive overview of the BloodConnect backend system, detailing its architecture, technology stack, database design, and API endpoints.

## 1. Overview
The BloodConnect backend is a RESTful API designed to manage a blood donation ecosystem. It handles user authentication (Donors, Hospitals, and Camp Organizers), blood requests, donation history, camp management, and real-time notifications.

---

## 2. Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (using `mysql2/promise` for async/await support)
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs for password hashing
- **Environment Management**: `dotenv`
- **CORS**: Enabled for cross-origin requests from the frontend

---

## 3. Project Structure
```text
backend/
├── controllers/          # Business logic for each module
│   ├── authController.js
│   ├── donorController.js
│   ├── hospitalController.js
│   ├── requestController.js
│   ├── campController.js
│   └── notificationController.js
├── middleware/           # Custom middleware (auth, validation)
│   └── authMiddleware.js
├── routes/               # API route definitions
│   ├── authRoutes.js
│   ├── donorRoutes.js
│   ├── hospitalRoutes.js
│   ├── requestRoutes.js
│   ├── campRoutes.js
│   └── notificationRoutes.js
├── db.js                 # Database connection pool configuration
├── server.js             # Main entry point and server setup
├── schema.sql            # Database schema definition
└── .env                  # Configuration variables
```

---

## 4. Database Schema
The system uses a relational database (`blood_donation`) with the following key tables:

### Core Tables
| Table | Description |
|-------|-------------|
| `donors` | Personal info, blood group, eligibility status, and location. |
| `hospitals` | Hospital registration details and license numbers. |
| `camps` | NGO/Organization details for blood donation camps. |

### Operational Tables
| Table | Description |
|-------|-------------|
| `requests` | Blood requirements posted by hospitals. |
| `request_responses` | Tracks which donor responded to which hospital request. |
| `camp_events` | Specific donation events scheduled by camps. |
| `camp_registrations` | Donors signed up for specific camp events. |
| `blood_inventory` | Current stock of blood groups available at each hospital. |
| `notifications` | System alerts for users (e.g., new requests, registration updates). |

---

## 5. API Reference

### Authentication (`/api/auth`)
- `POST /register`: Register a new donor, hospital, or camp.
- `POST /login`: Authenticate users and return a JWT.
- `GET /me`: Get current user profile (requires token).

### Donors (`/api/donors`)
- `GET /profile`: Get donor profile details.
- `PUT /profile`: Update donor information.
- `GET /history`: Fetch donation history.
- `GET /stats`: Summary of donations and eligibility.

### Hospitals (`/api/hospitals`)
- `GET /inventory`: View blood stock levels.
- `POST /inventory`: Update or add blood units.
- `GET /profile`: Get hospital details.

### Blood Requests (`/api/requests`)
- `POST /create`: Hospital creates a new blood request.
- `GET /active`: List all active blood requests.
- `POST /respond/:id`: Donor responds to a request.
- `GET /hospital-requests`: List requests created by a specific hospital.

### Camps (`/api/camps`)
- `POST /events`: Create a new camp event.
- `GET /events`: List all upcoming/live camps.
- `POST /register-event/:id`: Donor registers for a camp.
- `GET /registrations/:eventId`: Get list of donors for an event.

### Notifications (`/api/notifications`)
- `GET /`: Get all notifications for the logged-in user.
- `PUT /read/:id`: Mark a notification as read.

---

## 6. Core Logic & Workflow

### Authentication Workflow
1. User provides credentials.
2. `bcryptjs` compares the hashed password in the DB.
3. On success, a JWT is generated containing the user `id`, `email`, and `role`.
4. This token must be sent in the `Authorization` header (`Bearer <token>`) for protected routes.

### Blood Request System
1. A hospital creates a request specifying blood group, units, and urgency.
2. The system filters eligible donors (matching blood group and location).
3. Notifications are generated for matching donors.
4. Donors can "Accept" the request, which updates the `request_responses` table.

### Inventory Management
- Hospitals maintain their own inventory.
- When a donation is marked as "Completed", the system automatically increments the corresponding blood group units in the `blood_inventory` table.

---

## 7. Configuration (`.env`)
Required environment variables:
- `PORT`: Server port (default 5000).
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: MySQL credentials.
- `JWT_SECRET`: Secret key for signing tokens.
- `JWT_EXPIRES_IN`: Token validity duration (e.g., `24h`).

---

## 8. Development & Maintenance
- **Database Initialization**: Run `schema.sql` to set up the tables.
- **Testing**: Use `test_db.js` or `test_reg.js` to verify connectivity and core functions.
- **Error Handling**: Standardized JSON error responses (e.g., `{ "message": "error description" }`).
