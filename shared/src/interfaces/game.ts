import { GAME_STATE } from "../enums/gameState.js";
import { IDrawData } from "./drawData.js";
import { IPlayer } from "./player.js";

export interface IGame {
    room_id: string;
    topic: string;
    hint: string;
    currentGameState: GAME_STATE;
    players: IPlayer[];
    disconnectedDuringSession: string[];
    leader: IPlayer | null;
    fakeArtist: IPlayer | null;
    currentTurn: number;
    currentPlayer: IPlayer | null;
    playerTurn: IPlayer[];
    possibleLeaders: IPlayer[];
    actualPlayers: IPlayer[];
    spectators: IPlayer[];
    turnDrawdata: IDrawData[][];
    canVote: IPlayer[];
    playerVotes: { [playerId: string]: number; };

    /*room_id: string;
    topic: string;
    hint: string;
    
    currentTurn: number;
    currentPlayer: Player | null;

    gameState: GAME_STATE;

    players: Player[];
    disconnectedDuringSession: string[]; // persistent id
    leader: Player | null;
    fakeArtist: Player | null;
    // Players actually playing, excluding spectators and leaders
    // gets cleared/repopulated only when a new round begins
    actualPlayers: Player[];*/

}