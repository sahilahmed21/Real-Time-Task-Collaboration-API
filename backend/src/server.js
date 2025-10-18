require('dotenv').config();

const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const taskRoutes = require('./routes/taskRoutes');
const registerTaskEvents = require('./sockets/taskEvents');

const app = express()
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

app.set('socketio', io);

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error'));
        }
        socket.user = decoded;
        next();
    });
});

const onConnection = (socket) => {
    console.log(`User connected: ${socket.id} (${socket.user.username})`);
    socket.on('join:team', (teamIds) => {
        if (!Array.isArray(teamIds)) {
            return;
        }

        console.log(`User ${socket.user.username} joining teams: ${teamIds}`);
        teamIds.forEach(teamId => {
            socket.join(`team_${teamId}`);
        })
    })
    registerTaskEvents(io, socket);
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id} (${socket.user.username})`);
    });
}

io.on('connection', onConnection);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));