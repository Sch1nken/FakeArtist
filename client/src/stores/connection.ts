import { defineStore } from "pinia";
import socket from "../socket";

export const useConnectionStore = defineStore("connection", {
    actions: {
        bindEvents() {
            socket.on("connect", () => {
                this.isConnected = true;
            });

            socket.on("disconnect", () => {
                this.isConnected = false;
            });
        },

        connect() {
            socket.connect();
        }
    },

    state: () => ({
        isConnected: false,
    }),
});