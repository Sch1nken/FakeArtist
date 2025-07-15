import { Game } from './game';
declare module 'socket.io' {
    interface Socket {
        game?: Game;
        persistentId?: string;
        playerName?: string;
    }
}
