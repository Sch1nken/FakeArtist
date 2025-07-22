<script setup lang="ts">
import { inject, ref } from 'vue';
import { SocketInstance } from '../main';
import { Socket } from 'socket.io-client';
import { useRouter } from 'vue-router';
const router = useRouter();

const username = ref<string>('');
const roomIdToJoin = ref<string>('');

var loading = ref(true);
const socket = inject<Socket>(SocketInstance);

socket?.disconnect();

socket?.on('connect', () => {
  console.log("CONNECTED");
  loading.value = false;
});

socket?.connect();

function joinRoom() {
  if (username.value.trim() === '') {
    alert('Please enter your username!');
    return;
  }
  if (roomIdToJoin.value.trim() === '') {
    alert('Please enter a Room ID to join!');
    return;
  }
  console.log(`User '${username.value}' attempting to join room '${roomIdToJoin.value}'.`);
  alert(`Attempting to join room ${roomIdToJoin.value} as ${username.value}...`);
  // TODO: Use router
  //emit('navigate', 'game');
}

function createRoom() {
  if (username.value.trim() === '') {
    alert('Please enter your username!');
    return;
  }

  // ROOM ID should come from the server?
  const newRoomId = "ASDF";
  console.log(`User '${username.value}' creating a new room: ${newRoomId}`);
  alert(`Creating new room for ${username.value}. New Room ID: ${newRoomId}`);
  // TODO: Use router
  //emit('navigate', 'game');
}
</script>

<template>
  <h1 v-if="loading">Loading...</h1>
  <div v-if="!loading">
    <h2>Join or Create a Game Room</h2>
    <div>
      <div>
        <h3>Join Existing Room</h3>
        <input type="text" placeholder="Enter Room ID" v-model="roomIdToJoin" maxlength="6" />
        <button @click="joinRoom" :disabled="!username.trim()">Join Room</button>
      </div>

      <div>
        <h3>Create New Room</h3>
        <button @click="createRoom" :disabled="!username.trim()">Create New Room</button>
      </div>
    </div>

    <button @click="router.back()">Back to Main</button>
  </div>
</template>

<style scoped></style>
