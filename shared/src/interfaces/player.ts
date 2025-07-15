export interface IPlayer {
    id: string; // socket id
    persistentId: string; // persisten id from client localStorage
    playerName: string;
    playerColor: string; // Maybe have a fixed array?
    score: number;
    ready: boolean;

    isSpectator: boolean;
}