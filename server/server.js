const express = require('express');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'https://chat-up-eosin.vercel.app',
  'http://localhost:5173'
];
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
});


app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Upload file route
app.post('/upload', upload.single('file'), async (req, res) => {
  const { username } = req.body;
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

  // Find or create user
  let user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    user = await prisma.user.create({ data: { username } });
  }

  const message = await prisma.message.create({
    data: {
      text: fileUrl,
      userId: user.id,
    },
    include: { user: true }
  });

  io.emit('receive_message', message);
  res.status(200).json({ message: "File uploaded", fileUrl });
});

// API route to get messages
app.get('/messages', async (req, res) => {
  const messages = await prisma.message.findMany({
    include: { user: true },
    orderBy: { timestamp: 'asc' }
  });
  res.json(messages);
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('send_message', async (data) => {
    const { username, text } = data;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      user = await prisma.user.create({ data: { username } });
    }

    const message = await prisma.message.create({
      data: {
        text,
        userId: user.id,
      },
      include: { user: true }
    });

    io.emit('receive_message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
// Delete messages older than 1 hour every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    const deleted = await prisma.message.deleteMany({
      where: {
        timestamp: {
          lt: oneHourAgo,
        },
      },
    });
    console.log(`Deleted ${deleted.count} old messages`);
  } catch (err) {
    console.error('Error deleting old messages:', err);
  }
});


const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
