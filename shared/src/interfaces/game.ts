import { GAME_STATE } from "..";
import { IPlayer } from "..";
import { DrawPath } from "..";

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
    roomId: string;

    spectators: IPlayer[];

    topic: string;
    turnDrawdata: DrawPath[];
    resetGameState(): void;
}