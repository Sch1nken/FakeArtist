import { GAME_STATE } from "..";
import { IPlayer } from "..";
import { IDrawData } from "..";
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
    playerVotes: {
        [playerId: string]: number;
    };
}
