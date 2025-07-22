import { io, Socket } from 'socket.io-client';
import { reactive } from 'vue';
const SOCKET_SERVER_URL = 'http://localhost:7777';

const socket: Socket = io(SOCKET_SERVER_URL, {
    // AutoConnect = false so we can try to connect and display a loading indicator
    // in vue?
    autoConnect: false
});

export const socketState = reactive({
    connected: false,
});

socket.on('connect', () => {
    console.log('Socket.IO connected:', socket.id);
    socketState.connected = true;
});

socket.on('disconnect', (reason: string) => {
    console.log('Socket.IO disconnected:', reason);
    socketState.connected = false;
});

socket.on('connect_error', (error: Error) => {
    console.error('Socket.IO connection error:', error.message);
});

export default socket;
