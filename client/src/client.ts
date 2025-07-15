import { io, Socket } from 'socket.io-client';

document.addEventListener('DOMContentLoaded', () => {
    const socket: Socket = io();

    console.log(socket);
});
