# Ascend Fitness

Ascend Fitness is a modern, high-performance, and visually stunning web application designed for comprehensive fitness, calorie, and activity tracking. Built with a sleek dark-themed interface, the application offers premium usability, smooth animations, and robust cloud data synchronization.

---

## ✨ Features

- **📊 Comprehensive Dashboard:** Real-time visual tracking of daily nutrition (calories, protein, carbs, fats), active duration, bodyweight milestones, and daily steps.
- **🏋️ Workout Planner:** Log workouts, manage custom routines (Push/Pull/Legs templates or custom created routines), duplicate plans, track sets, and record Personal Records (PRs) seamlessly.
- **🍎 Nutrition & Calorie Tracker:** Log custom meals, save favorite items to a persistent food list, track macro goals, and monitor total water intake.
- **🏃 Live Activity Tracker:** Capture live running, walking, or cycling sessions with real-time pace, distance, and calorie expenditure metrics.
- **☁️ Cloud Sync & Migration:** Powered by Supabase for user authentication and relational database storage. Includes automatic offline-to-online migration of local session data upon first registration.

---

## 🛠️ Technology Stack

- **Frontend Core:** React, Vite (Single Page Application)
- **Styling:** Custom Vanilla CSS with custom theme variables (Dark Mode optimized)
- **Icons:** Lucide React
- **Backend / Authentication:** Supabase (PostgreSQL database & JWT-based user authentication)

---

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) (v18 or higher) and `npm` installed.

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/ishantchahal1611-code/ascend-fitness.git
cd ascend-fitness
npm install
```

### 3. Database Setup (Supabase)
1. Create a new project on the [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor** in your Supabase project.
3. Copy and run the contents of [`supabase_schema.sql`](file:///c:/Antigravity%20workspace/supabase_schema.sql) to initialize the database tables, relations, and permissions.

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Running Locally
Start the local development server:
```bash
npm run dev
```

---

## 📂 Project Structure

- `src/store/AppContext.jsx`: Central React context managing global application state and direct synchronization with the Supabase client.
- `src/components/Auth.jsx`: Sleek authentication portal for signup, login, and secure session state.
- `src/components/Settings.jsx`: Profile configurations, goal updates, daily step calibration, and secure sign out capabilities.
- `supabase_schema.sql`: SQL initialization script outlining structure for workouts, profiles, custom plans, activities, and nutrition database.
