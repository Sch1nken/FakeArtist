import { io } from 'socket.io-client';
document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    console.log(socket);
});
