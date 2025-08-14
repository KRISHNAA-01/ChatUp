
# Real-Time Chat App with File Upload & Auto-Delete Messages

This is a **real-time chat application** built with **Node.js, Express, Prisma, PostgreSQL, and React**.  
It supports **file uploads**, **real-time messaging** using Socket.IO, and **automatic deletion of messages** after 1 hour to save database space.

---

## 🚀 Features
- 📡 **Real-time Messaging** (Socket.IO)
- 📎 **File Upload Support** (images, PDFs, etc.)
- 🗑 **Auto-delete messages after 1 hour**
- 🗄 **PostgreSQL database** with Prisma ORM
- 🔒 **CORS configuration for security**

---

## 🛠 Tech Stack
**Frontend:** React, Tailwind CSS  
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL (Prisma ORM)  
**Real-time:** Socket.IO  
**Hosting:** Render, VERCEL

---

## 📂 Project Structure
```

root/
│── client/       # React frontend
│── server/       # Node.js + Express backend
│── prisma/       # Prisma schema and migrations
│── package.json  # Project metadata and dependencies
│── README.md     # Project documentation

````

---

## ⚙️ Environment Variables
Create a `.env` file in the **server** folder with:

```env
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>?schema=public
PORT=5000
CORS_ORIGIN=http://localhost:3000
````

---

## 📦 Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/KRISHNAA-01/ChatUp.git
cd chatup
```

### 2️⃣ Install dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd ../client
npm install
```

### 3️⃣ Setup the database

```bash
cd server
npx prisma migrate dev --name init
```

---

## ▶️ Running Locally

**Start backend:**

```bash
cd server
npm run dev
```

**Start frontend:**

```bash
cd client
npm start
```

---

## 🌍 Deployment on Render

### Backend

* **Build Command:** `npm install && npx prisma generate`
* **Start Command:** `node server.js`
* Add environment variables in Render settings.

### Frontend

* **Build Command:** `npm run build`
* **Start Command:** `serve -s build`
* Set the environment variable for the backend API URL.

---

## 🗑 Auto-Delete Messages

The server runs a scheduled job that **deletes all messages older than 1 hour**:

```javascript
setInterval(async () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  await prisma.message.deleteMany({
    where: { timestamp: { lt: oneHourAgo } },
  });
}, 60 * 1000); // Runs every 1 minute
```

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

Developed by **\KRISHNA** 🚀

```

