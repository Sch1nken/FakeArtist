"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const shared_1 = require("shared");
//import { AVAILABLE_COLORS, MIN_PLAYERS_TO_START_GAME } from './constants';
class Game {
    constructor(room_id_, ioInstance) {
        this.topic = '';
        this.hint = '';
        this.currentGameState = shared_1.GAME_STATE.LOBBY;
        this.players = [];
        this.disconnectedDuringSession = [];
        this.leader = null;
        this.fakeArtist = null;
        this.currentTurn = 0;
        this.currentPlayer = null;
        this.playerTurn = [];
        this.possibleLeaders = [];
        this.actualPlayers = [];
        this.spectators = [];
        this.turnDrawdata = [];
        this.canVote = [];
        this.playerVotes = {};
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
