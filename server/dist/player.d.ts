import { IPlayer } from 'shared';
export declare class Player implements IPlayer {
    id: string;
    persistentId: string;
    playerName: string;
    playerColor: string;
    score: number;
    ready: boolean;
    isSpectator: boolean;
    constructor(id_: string, persistentId_: string, name_: string, player_color_: string);
}
