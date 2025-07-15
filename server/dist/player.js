"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    id;
    persistentId;
    playerName;
    playerColor;
    score = 0;
    ready = false;
    isSpectator = false;
    constructor(id_, persistentId_, name_, player_color_) {
        this.id = id_;
        this.persistentId = persistentId_;
        this.playerName = name_;
        this.playerColor = player_color_;
    }
}
exports.Player = Player;
