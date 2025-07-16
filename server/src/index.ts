import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

import { Game } from "./game";
import { RoomCodeGenerator } from "./roomGenerator";
import { UPDATE_TYPE } from "shared";
import { MAX_PLAYERS_IN_ROOM } from "./constants";

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

io.on(UPDATE_TYPE.CONNECTION, (socket: Socket) => {
  console.log("User connected:", socket.id);

  // Creating and Joining a room could be unified
  // Is I join a non-existent room, it will automatically be created?
  // This would be bad for user feedback though, as they think they joined a room
  socket.on(UPDATE_TYPE.CREATE_ROOM, (username: string, persistentId: string) => {
    console.log("CREATE ROOM " + username);
    if (!username || username.trim() === "") {
      socket.emit(UPDATE_TYPE.ROOM_ERROR, "Invalid username!");
      return;
    }

    let room_id = roomCodeGenerator.randomId();
    while (active_games[room_id]) {
      room_id = roomCodeGenerator.randomId();
    }

    const game = new Game(room_id, io);
    active_games[room_id] = game;

    console.log(`Room ${room_id} created by ${username} (${socket.id})`);
    socket.emit(UPDATE_TYPE.JOIN_ROOM, room_id);
    game.addPlayer(socket, username.trim(), persistentId);
  });

  socket.on(
    UPDATE_TYPE.JOIN_ROOM,
    (roomId: string, username: string, persistentId: string) => {
      const upperRoomId = roomId.toUpperCase();

      if (!username || username.trim() === "") {
        socket.emit(UPDATE_TYPE.ROOM_ERROR, "Invalid username!");
        console.log("INVALID USERNAME" + username);
        return;
      }

      if (!active_games[upperRoomId]) {
        socket.emit(UPDATE_TYPE.ROOM_ERROR, "This room does not exist!");
        console.log("ROOM DOES NOT EXIST " + upperRoomId);
        return;
      }

      const game = active_games[upperRoomId];

      const existingPlayer = game.getPlayerByPersistentId(persistentId);
      if (existingPlayer && existingPlayer.id === socket.id) {
        socket.emit(UPDATE_TYPE.ROOM_ERROR, "You are already in this room!");
        return;
      }

      if (game.players.length >= MAX_PLAYERS_IN_ROOM && !existingPlayer) {
        socket.emit(UPDATE_TYPE.ROOM_ERROR, "This room is full!");
        return;
      }

      console.log(
        `User ${username} (${socket.id}) joining room ${upperRoomId}`,
      );
      game.addPlayer(socket, username.trim(), persistentId);
      socket.emit(UPDATE_TYPE.JOIN_ROOM, upperRoomId);
    },
  );

  socket.on(UPDATE_TYPE.DISCONNECT, () => {
    console.log("User disconnected:", socket.id);
    if (socket.game) {
      socket.game.removePlayer(socket.id);
      if (socket.game.players.length === 0) {
        console.log(
          `Room ${socket.game.roomId} is empty after disconnect. Deleting game.`,
        );
        delete active_games[socket.game.roomId];
      }
    }
  });
});

const PORT: number = parseInt(process.env.PORT || "7777", 10);
http.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on ${PORT}`);
  console.log(`Access the game at http://localhost:${PORT}`);
});
