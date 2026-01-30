# 🚀 Production Deployment Guide

Follow these steps to take your **Smart Healthcare Scheduler** live.

---

## 🟢 Step 1: MongoDB Atlas (Database)
1. **Create Cluster**: Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free Shared Cluster.
2. **Network Access**: Go to "Network Access" and click **Add IP Address**. Choose **"Allow Access from Anywhere"** (0.0.0.0/0) for deployment.
3. **Database User**: Create a user with a username and password.
4. **Connection String**: Click **Connect** → **Drivers** → **Node.js**. Copy the connection string.
   - Replace `<password>` with your database user password.

---

## 🔵 Step 2: Render (Backend API)
1. **Host on Render**: Go to [Render.com](https://render.com) and create a new **Web Service**.
2. **Connect Repo**: Connect your GitHub repository.
3. **Configurations**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `PORT` | `10000` (or leave default) |
   | `MONGO_URI` | *Your MongoDB Connection String* |
   | `JWT_SECRET` | *Any random strong string* |
   | `TWILIO_ACCOUNT_SID` | *From Twilio Console* |
   | `TWILIO_AUTH_TOKEN` | *From Twilio Console* |
   | `TWILIO_PHONE_NUMBER` | *From Twilio Console* |
   | `FRONTEND_URL` | *Your Vercel URL (Add AFTER Step 3)* |
   | `AI_PROVIDER` | `mock` (or `gemini` / `claude`) |
   | `GEMINI_API_KEY` | *Your Google AI API Key (Optional)* |

---

## ⚪ Step 3: Vercel (Frontend)
1. **Host on Vercel**: Go to [Vercel.com](https://vercel.com) and import your project.
2. **Framework Preset**: Choose **Vite**.
3. **Configurations**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | *Your Render Backend URL (e.g., https://api-name.onrender.com)* |

---

## 🔄 Step 4: Final Connection
- Once the Vercel app is deployed, copy its URL (e.g., `https://my-app.vercel.app`).
- Go back to **Render Dashboard** → **Environment**.
- Update `FRONTEND_URL` with your Vercel address.
- Restart the Render service.

---

## ✅ Deployment Checklist
- [ ] Backend status is "Live" on Render.
- [ ] Frontend can login and fetch data.
- [ ] SMS notifications trigger on actions.
- [ ] Cron job is running (see Render logs).
