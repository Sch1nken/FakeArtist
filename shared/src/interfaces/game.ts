import { GAME_STATE } from "..";
import { IPlayer } from "..";
import { IDrawData } from "..";

export interface IGame {
    actualPlayers: IPlayer[];
    canVote: IPlayer[];
    currentGameState: GAME_STATE;
    currentPlayer: IPlayer | null;
    currentTurn: number;
    disconnectedDuringSession: string[];
    fakeArtist: IPlayer | null;
    hint: string;
    leader: IPlayer | null;
    players: IPlayer[];
    playerTurn: IPlayer[];
    playerVotes: { [playerId: string]: number; };
    possibleLeaders: IPlayer[];
    room_id: string;

    spectators: IPlayer[];

    topic: string;
    turnDrawdata: IDrawData[][];
    reset_game_state(): void;
}