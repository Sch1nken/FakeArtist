import { Game } from './game.js';
declare module 'socket.io' {
    interface Socket {
        game?: Game;
        persistentId?: string;
        playerName?: string;
    }
}
