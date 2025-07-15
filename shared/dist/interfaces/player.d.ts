export interface IPlayer {
    id: string;
    persistentId: string;
    playerName: string;
    playerColor: string;
    score: number;
    ready: boolean;
    isSpectator: boolean;
}
