"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const shared_1 = require("shared");
//import { AVAILABLE_COLORS, MIN_PLAYERS_TO_START_GAME } from './constants';
class Game {
    io;
    room_id;
    topic = '';
    hint = '';
    currentGameState = shared_1.GAME_STATE.LOBBY;
    players = [];
    disconnectedDuringSession = [];
    leader = null;
    fakeArtist = null;
    currentTurn = 0;
    currentPlayer = null;
    playerTurn = [];
    possibleLeaders = [];
    actualPlayers = [];
    spectators = [];
    turnDrawdata = [];
    canVote = [];
    playerVotes = {};
    constructor(room_id_, ioInstance) {
        this.room_id = room_id_;
        this.io = ioInstance;
    }
    add_player(socket, _username, _persistentId) {
        this.io.to(socket.id).emit("message", "yooo");
    }
    remove_player(_socketId) {
    }
    get_player_by_persistent_id(id) {
        return this.players.find(item => item.persistentId === id) || null;
    }
}
exports.Game = Game;
