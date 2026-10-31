# 🌱 EcoTrack – Smart Carbon Footprint Tracking Platform

**EcoTrack** is a MERN Stack web application that helps users track their daily carbon emissions, understand their carbon footprint, and monitor their environmental impact.

Users can record everyday activities, calculate their CO₂ emissions, view category-wise statistics, and track weekly and monthly emission trends through interactive dashboard charts.

## 🚀 Live Demo

🌐 **Frontend:** https://ecotrack-dharmendra.vercel.app/

⚙️ **Backend API:** https://ecotrack-backend-4zo7.onrender.com/

📂 **GitHub Repository:** https://github.com/ChaurasiyaDharmendra/EcoTrack

## ✨ Features

- **User Authentication:** Secure signup and login using JWT authentication.
- **Dashboard:** View total CO₂ emissions and total recorded activities.
- **Carbon Tracker:** Add and manage daily carbon-emitting activities.
- **Emission Calculation:** Automatically calculate CO₂ emissions using predefined emission factors.
- **Category-wise Tracking:** Track emissions across six categories:
  - Transport
  - Electricity
  - Food
  - Waste Management
  - Water
  - Lifestyle
- **Weekly Emission Chart:** Visualize emissions over the last seven days.
- **Monthly Emission Chart:** Analyze emission trends over the last six months.
- **Goals:** Manage personal carbon reduction goals.
- **Challenges:** Explore environmental challenges.
- **User Profile:** View and update profile information.
- **Responsive Design:** User-friendly interface for different screen sizes.

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Backend
- Node.js
- Express.js
- REST API

### Database
- MongoDB
- Mongoose

### Authentication & Tools
- JSON Web Token (JWT)
- bcrypt.js
- Git & GitHub
- VS Code
- Postman

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## 📊 Dashboard Preview

The dashboard provides an overview of the user's carbon footprint.

**Dashboard includes:**
- Total CO₂ Emission
- Category-wise CO₂ Emission
- Weekly Emission Chart
- Monthly Emission Chart

## 📁 Project Structure

```text
EcoTrack/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seedData.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── index.html
│
└── README.md
```

## ⚙️ Installation and Setup

Follow these steps to run EcoTrack locally.

### 1. Clone the Repository

```bash
git clone https://github.com/ChaurasiyaDharmendra/EcoTrack.git
```

### 2. Navigate to the Project

```bash
cd EcoTrack
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Start the backend server:

```bash
npm run dev
```

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Now open the local URL provided by Vite in your browser.

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| PORT | Backend server port |
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for JWT authentication |
| VITE_API_URL | Backend API base URL |

**Important:** Never upload `.env` files or database credentials to GitHub.

## 🔄 How It Works

1. A user creates an account and logs in.
2. The user records daily activities in Carbon Tracker.
3. The backend fetches the corresponding emission factor.
4. CO₂ emission is calculated using the activity quantity and emission factor.
5. The data is stored in MongoDB.
6. The dashboard fetches and displays total and category-wise emissions.
7. Weekly and monthly charts visualize the user's emission history.

## 🎯 Project Objective

The main objective of EcoTrack is to make people aware of their everyday carbon footprint and encourage environmentally responsible habits.

By tracking daily activities and monitoring emission trends, users can better understand their environmental impact and work towards reducing it.

## 👨‍💻 Developer

**Dharmendra Chaurasiya**

B.Tech – Information Technology

Chhatrapati Shahu Ji Maharaj University, Kanpur

- GitHub: https://github.com/ChaurasiyaDharmendra
- LinkedIn: https://www.linkedin.com/

---

⭐ If you find this project useful, consider giving it a star on GitHub.

**Built with ❤️ using the MERN Stack.**