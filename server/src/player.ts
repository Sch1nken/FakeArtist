import { IPlayer } from 'shared';

export class Player implements IPlayer {
    id: string;
    persistentId: string;
    playerName: string;
    playerColor: string;
    score: number = 0;
    ready: boolean = false;
    isSpectator: boolean = false;

    constructor(id_: string, persistentId_: string, name_: string, player_color_: string) {
        this.id = id_;
        this.persistentId = persistentId_;
        this.playerName = name_;
        this.playerColor = player_color_;
    }


}