"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const game_js_1 = require("./game.js");
const roomGenerator_js_1 = require("./roomGenerator.js");
const app = (0, express_1.default)();
const http = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(http, {
    cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"]
    }
});
/*app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});*/
const active_games = {};
const roomCodeGenerator = new roomGenerator_js_1.RoomCodeGenerator();
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('create_room', (username, persistentId) => {
        if (!username || username.trim() === '') {
            socket.emit('room_error', 'Invalid username!');
            return;
        }
        let room_id = roomCodeGenerator.randomId();
        while (active_games[room_id]) {
            room_id = roomCodeGenerator.randomId();
        }
        const game = new game_js_1.Game(room_id, io);
        active_games[room_id] = game;
        console.log(`Room ${room_id} created by ${username} (${socket.id})`);
        socket.emit('join_room', room_id);
        game.add_player(socket, username.trim(), persistentId);
    });
    socket.on('join_room', (room_id, username, persistentId) => {
        const upper_room_id = room_id.toUpperCase();
        if (!username || username.trim() === '') {
            socket.emit('room_error', 'Invalid username!');
            return;
        }
        if (!active_games[upper_room_id]) {
            socket.emit('room_error', 'This room does not exist!');
            return;
        }
        const game = active_games[upper_room_id];
        const existingPlayer = game.get_player_by_persistent_id(persistentId);
        if (existingPlayer && existingPlayer.id === socket.id) {
            socket.emit('room_error', 'You are already in this room!');
            return;
        }
        const MAX_PLAYERS_IN_ROOM = 10;
        if (game.players.length >= MAX_PLAYERS_IN_ROOM && !existingPlayer) {
            socket.emit('room_error', 'This room is full!');
            return;
        }
        console.log(`User ${username} (${socket.id}) joining room ${upper_room_id}`);
        game.add_player(socket, username.trim(), persistentId);
        socket.emit('join_room', upper_room_id);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.game) {
            socket.game.remove_player(socket.id);
            if (socket.game.players.length === 0) {
                console.log(`Room ${socket.game.room_id} is empty after disconnect. Deleting game.`);
                delete active_games[socket.game.room_id];
            }
        }
    });
});
const PORT = parseInt(process.env.PORT || '7777', 10);
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Listening on ${PORT}`);
    console.log(`Access the game at http://localhost:${PORT}`);
});
