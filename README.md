# CourseMatrix - Student Course Allotment Management System
📖 Overview
A full-stack Node.js + Express + MongoDB (backend) and HTML/CSS/JS (frontend) application that simplifies student registration, course selection, and department-wise course allocation.
The system automatically generates roll numbers for students, maintains records, and allows admin-based course allotment across multiple departments and semesters.

🔥 Key Highlights

✔️ Student Registration with auto-generated roll numbers 🧑‍🎓
✔️ Department & Semester-wise course allotment 🏛️
✔️ Admin panel to manage students and allocate courses ⚙️
✔️ Dynamic course listing for CSE, ECE, Civil, Mechanical 🖥️
✔️ JSON/MongoDB persistence for data 📂
✔️ Runs on localhost or cloud (Vercel/Render) 🚀

🎯 Innovation & Impact

🌍 What Makes It Special?
🔹 Simplifies academic course management with automation
🔹 Reduces admin workload by structured roll number + allocation system
🔹 Supports multiple departments and semesters
🔹 Real-time course allocation updates
🔹 Built with scalable backend and lightweight frontend

👥 Who Can Use It?
👨‍🎓 Students – Register and get allocated to department courses
👩‍🏫 Admins – Manage course lists and student allocations
🏫 Colleges/Universities – Deploy as an institutional course management system

🚀 Modules & Features
🧑‍🎓 Student Registration

‣ Simple form for student details (Name, Email, Department, Semester)
‣ Auto-generated roll numbers

📚 Course Management

‣ Course database per department & semester
‣ Admin assigns courses to registered students

🏛️ Admin Panel

‣ View all students
‣ Allocate courses department-wise
‣ Manage course lists

📊 Student Dashboard

‣ View allocated courses
‣ Department-wise semester display

🛠 Tech Stack

🎨 Frontend
‣ HTML, CSS, JavaScript
‣ Organized into /public, /pages, /styles

🧠 Backend
‣ Node.js + Express
‣ MongoDB (extendable, JSON fallback used in dev)
‣ REST APIs for students, courses, allocations

🌐 Deployment
‣ Frontend: Vercel (Static hosting)
‣ Backend: Render / Vercel

⚙️ How It Works

1️⃣ Student fills out registration form
2️⃣ System generates unique roll number
3️⃣ Admin logs in → assigns department + semester courses
4️⃣ Student can view allocated courses in dashboard

📂 Project Structure
student-course-allotment/
├── client/
│   ├── public/
│   │   ├── index.html  
│   │   ├── student.png  
│   │   ├── admin.png  
│   │   └── favicon.ico  
│   ├── src/  
│   │   ├── assets/  
│   │   ├── components/  
│   │   ├── pages/  
│   │   ├── scripts/  
│   │   └── styles/  
│   └── README.md  
│
├── server/
│   ├── config/  
│   ├── controllers/  
│   ├── models/  
│   ├── routes/  
│   ├── server.js  
│   ├── package.json  
│   └── .env  
│
├── LICENSE  
└── README.md  


⚡ Local Setup Guide

1️⃣ Clone the Repo

git clone https://github.com/your-username/student-course-allotment.git
cd student-course-allotment


2️⃣ Install Dependencies

cd server
npm install


3️⃣ Setup .env File

MONGO_URI=your_mongodb_url
PORT=3000


4️⃣ Run the Server

node server.js


5️⃣ Open in Browser
Frontend → http://localhost:3000

