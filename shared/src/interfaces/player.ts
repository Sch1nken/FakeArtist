export interface IPlayer {
    id: string; // socket id
    isSpectator: boolean;
    persistentId: string; // persisten id from client localStorage
    playerColor: string; // Maybe have a fixed array?
    playerName: string;
    ready: boolean;

    score: number;
}