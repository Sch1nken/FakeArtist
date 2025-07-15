"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(id_, persistentId_, name_, player_color_) {
        this.score = 0;
        this.ready = false;
        this.isSpectator = false;
        this.id = id_;
        this.persistentId = persistentId_;
        this.playerName = name_;
        this.playerColor = player_color_;
    }
}
exports.Player = Player;
