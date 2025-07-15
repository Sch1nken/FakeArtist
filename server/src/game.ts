import { Server, Socket } from 'socket.io';
import { GAME_STATE, IDrawData, IGame, IPlayer } from 'shared';

//import { AVAILABLE_COLORS, MIN_PLAYERS_TO_START_GAME } from './constants';

export class Game implements IGame {
    private io: Server;

    room_id: string;
    topic: string = '';
    hint: string = '';
    currentGameState: GAME_STATE = GAME_STATE.LOBBY;
    players: IPlayer[] = [];
    disconnectedDuringSession: string[] = [];
    leader: IPlayer | null = null;
    fakeArtist: IPlayer | null = null;
    currentTurn: number = 0;
    currentPlayer: IPlayer | null = null;
    playerTurn: IPlayer[] = [];
    possibleLeaders: IPlayer[] = [];
    actualPlayers: IPlayer[] = [];
    spectators: IPlayer[] = [];
    turnDrawdata: IDrawData[][] = [];
    canVote: IPlayer[] = [];
    playerVotes: { [playerId: string]: number; } = {};

    constructor(room_id_: string, ioInstance: Server) {
        this.room_id = room_id_;
        this.io = ioInstance;
    }

    add_player(socket: Socket, _username: string, _persistentId: string): void {
        this.io.to(socket.id).emit("message", "yooo");
    }


    remove_player(_socketId: string): void {
    }

    get_player_by_persistent_id(id: string): IPlayer | null {
        return this.players.find(item => item.persistentId === id) || null;
    }
}
