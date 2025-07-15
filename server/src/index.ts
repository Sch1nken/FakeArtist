import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

import { Game } from "./game";
import { RoomCodeGenerator } from "./roomGenerator";

declare module "socket.io" {
  interface Socket {
    game?: Game; // Reference to the Game instance the socket belongs to
    persistentId?: string;
    playerName?: string;
  }
}

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    methods: ["GET", "POST"],
    origin: "*", // Allow all origins for development
  },
});

/*app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});*/

const active_games: { [roomId: string]: Game; } = {};

const roomCodeGenerator = new RoomCodeGenerator();

io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("create_room", (username: string, persistentId: string) => {
    if (!username || username.trim() === "") {
      socket.emit("room_error", "Invalid username!");
      return;
    }

    let room_id = roomCodeGenerator.randomId();
    while (active_games[room_id]) {
      room_id = roomCodeGenerator.randomId();
    }

    const game = new Game(room_id, io);
    active_games[room_id] = game;

    console.log(`Room ${room_id} created by ${username} (${socket.id})`);
    socket.emit("join_room", room_id);
    game.add_player(socket, username.trim(), persistentId);
  });

  socket.on(
    "join_room",
    (room_id: string, username: string, persistentId: string) => {
      const upper_room_id = room_id.toUpperCase();

      if (!username || username.trim() === "") {
        socket.emit("room_error", "Invalid username!");
        return;
      }

      if (!active_games[upper_room_id]) {
        socket.emit("room_error", "This room does not exist!");
        return;
      }

      const game = active_games[upper_room_id];

      const existingPlayer = game.get_player_by_persistent_id(persistentId);
      if (existingPlayer && existingPlayer.id === socket.id) {
        socket.emit("room_error", "You are already in this room!");
        return;
      }

      const MAX_PLAYERS_IN_ROOM = 10;
      if (game.players.length >= MAX_PLAYERS_IN_ROOM && !existingPlayer) {
        socket.emit("room_error", "This room is full!");
        return;
      }

      console.log(
        `User ${username} (${socket.id}) joining room ${upper_room_id}`,
      );
      game.add_player(socket, username.trim(), persistentId);
      socket.emit("join_room", upper_room_id);
    },
  );

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (socket.game) {
      socket.game.remove_player(socket.id);
      if (socket.game.players.length === 0) {
        console.log(
          `Room ${socket.game.room_id} is empty after disconnect. Deleting game.`,
        );
        delete active_games[socket.game.room_id];
      }
    }
  });
});

const PORT: number = parseInt(process.env.PORT || "7777", 10);
http.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on ${PORT}`);
  console.log(`Access the game at http://localhost:${PORT}`);
});
