# 🌟 Employee Attendance System | MERN Full-Stack Project 
by RAJA NANDHUJA S,SNS College of Technology-(6382456454)

Manager dash board
mail:suminan@gmail.com
password:123 

Employee Dashboard
mail:kumar@gmail.com
password:123 


Hey there! 👋  
This is my **Employee Attendance System**, a full-stack MERN application I built to solve real-world problems related to workplace attendance tracking.  

Instead of using manual sheets or outdated HR tools, this system provides:
- **Live attendance tracking**
- **Manager dashboards**
- **CSV export reports**
- **Modern UI with animations**
- **Clear visibility of employee performance**

My goal was to design something **simple, beautiful, fast**, and actually useful in a real company environment.

---

## ✨ What this system can do

### 🧑‍💼 Employees can:
- Mark **Check-In**, **Break**, **Check-Out**
- View attendance history
- Track personal performance like present/late/absent streaks

### 👨‍💼 Managers / HR / Admin can:
- View real-time team attendance
- Search employees by name or department
- Export attendance records as **CSV** with one click
- Monitor present / late / absent distribution

### 🎨 UI Highlights
- **Glassmorphism + Animated Dashboard**
- **Dark mode support**
- Fully responsive design
- Smooth transitions using **Framer Motion**

---

## 🧠 Tech Stack

| Frontend | Backend | Database | Auth |
|----------|---------|-----------|-------|
| React (Vite) | Express + Node.js | MongoDB | JWT Tokens |
| Tailwind CSS | Mongoose | | |

---

RUN LOCALLY
```bash
git clone https://github.com/Raja-Nandhuja/employee-attendance-system.git
cd employee-attendance-system
Install backend dependencies:
bash
Copy code
cd server
npm install
npm run dev
Install frontend dependencies:
bash
Copy code
cd ../client
npm install
npm run dev
Frontend will run at: http://localhost:5173
Backend at: http://localhost:5000

🔐 Environment Variables
server/.env
ini
Copy code
MONGO_URI=your_mongo_connection
JWT_SECRET=your_secret_key
PORT=5000
client/.env
bash
Copy code
VITE_API_URL=http://localhost:5000/api
📤 Export CSV
Managers can download reports like:

Copy code
attendance-report-2025-01-01.csv
🌱 Sample Admin Login
makefile
Copy code
Email: admin@gmail.com
Password: 123456
🖼 Screenshots (Add after uploading)
markdown
Copy code
### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Manager Team View
![Team View](./screenshots/team.png)
🎯 What I learned from building this
Structuring full stack applications end-to-end

Writing clean APIs with authentication & roles

Working with MongoDB data modeling

Building animated front-end dashboards

GitHub collaboration & project structure management

💡 Future Improvements
Monthly analytics graph

PDF export

Notifications / email reminders

Biometric / QR attendance

👨‍💻 Author
Raja Nandhuja S
Full-Stack Developer | Final year student passionate about building real-world software
