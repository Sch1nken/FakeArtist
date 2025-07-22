import { createApp } from 'vue';
import App from './App.vue';
import socket from './socket';
import router from './router';
import { createPinia } from 'pinia';


import './style.css';

export const SocketInstance = Symbol('socket');

const app = createApp(App);

const pinia = createPinia();

app.provide(SocketInstance, socket);
app.use(pinia);
app.use(router);
app.mount('#app');