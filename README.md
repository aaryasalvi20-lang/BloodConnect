# 🩸 BloodConnect: Blood Donation Management System

![Project Banner](assets/banner.png)

## 🚀 Overview
**BloodConnect** is a state-of-the-art, full-stack platform designed to revolutionize the blood donation ecosystem. By connecting **Donors**, **Hospitals**, and **Camp Organizers** in real-time, the system ensures that life-saving blood reaches those in need with maximum efficiency and minimal delay.

Built with a focus on modern UI/UX and robust backend logic, BloodConnect provides a seamless experience for all stakeholders in the blood supply chain.

---

## ✨ Key Features

### 👤 For Donors
- **Personalized Dashboard**: Track your impact and donation history at a glance.
- **Smart Eligibility**: Automated 90-day cooldown tracking ensures donor safety and health.
- **Availability Toggle**: Let hospitals know when you are ready to donate.
- **Urgent Alerts**: Receive real-time notifications for critical blood shortages in your area.
- **Camp Discovery**: Easily find and register for upcoming blood donation camps nearby.

### 🏥 For Hospitals
- **Inventory Management**: Real-time tracking of blood units across all groups (A+, B-, etc.).
- **Urgent Request System**: Create "Critical" or "High Urgency" requests that instantly alert matching donors.
- **Donor Matching**: Advanced filtering to find eligible donors by blood group and proximity.
- **Camp Collaboration**: Request to collaborate with NGOs and organizations for upcoming donation events.

### ⛺ For Camp Organizers
- **Event Creation**: Schedule and manage large-scale blood donation camps with ease.
- **Donor Registration Tracking**: View and manage the list of donors registered for specific events.
- **Hospital Partnerships**: Coordinate with hospitals to ensure proper medical support and blood collection.
- **Location-Based Outreach**: Target donors in specific regions for maximum participation.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Vanilla JavaScript, CSS3 (Modern Glassmorphism Design) |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (Relational Schema) |
| **Security** | JWT (JSON Web Tokens), Bcrypt.js password hashing |
| **Communication** | RESTful API Architecture |

---

## 📂 Project Structure

```text
BloodConnect/
├── backend/              # Node.js/Express API
│   ├── controllers/      # Business logic & Database queries
│   ├── routes/           # API Endpoints
│   ├── middleware/       # Authentication & Security
│   ├── db.js             # MySQL Connection Pool
│   └── server.js         # Entry Point
├── frontend/             # Client-side Application
│   ├── donor/            # Donor-specific pages
│   ├── hospital/         # Hospital-specific pages
│   ├── camp/             # Camp Organizer-specific pages
│   ├── styles.css        # Global Design System
│   └── script.js         # Shared Logic
├── assets/               # Media & Visuals
├── schema.sql            # Database Schema
└── .env                  # Configuration (to be created)
```

---

## 📦 Getting Started

### 1. Database Setup
1. Create a MySQL database named `blood_donation`.
2. Run the queries in `backend/schema.sql` to initialize tables.
3. (Optional) Run `node backend/reinit_db.js` to reset the database if needed.

### 2. Backend Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blood_donation
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
```

### 3. Installation & Execution
```bash
# Install dependencies
npm install

# Start the server
npm start
```
*The server will run on `http://localhost:5000`.*

### 4. Running the Frontend
The frontend is built with pure HTML/JS. You can run it by:
- Opening `frontend/index.html` directly in a browser.
- Using a development server like **Live Server** in VS Code (recommended).

---

## 📄 Documentation
For a deep dive into the backend architecture and API endpoints, refer to the `backend_documentation.md` (generated separately).

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.
