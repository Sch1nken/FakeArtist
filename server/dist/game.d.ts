import { Server, Socket } from 'socket.io';
import { GAME_STATE, IDrawData, IGame, IPlayer } from 'shared';
export declare class Game implements IGame {
    private io;
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
    constructor(room_id_: string, ioInstance: Server);
    add_player(socket: Socket, _username: string, _persistentId: string): void;
    remove_player(_socketId: string): void;
    get_player_by_persistent_id(id: string): IPlayer | null;
}
