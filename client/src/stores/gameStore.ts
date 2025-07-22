import { defineStore } from 'pinia';

interface GameState {
    roomId: string | null;
    username: string;
}

export const useGameStore = defineStore('game', {
    actions: {
        clearGameSession() {
            this.username = '';
            this.roomId = null;
        },
        setRoomId(id: string | null) {
            this.roomId = id;
        },
        setUsername(name: string) {
            this.username = name;
        }
    },
    getters: {
        currentRoom: (state) => state.roomId,
        isUserLoggedIn: (state) => state.username !== '',
    },
    state: (): GameState => ({
        roomId: null,
        username: '',
    })
});
